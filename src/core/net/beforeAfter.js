const requestIp = require('request-ip')
const expire_day = 30 // 預設30天expire
// 取得目前req.url對應到的route
const getReqConfig = (req) => {
  let routeConfig = null
  for (let i = 0; i < global.routes.length; i++) {
    const ns = `${global.routes[i].ns}/`
    if (req.url.indexOf(ns) !== -1) {
      routeConfig = global.routes[i]
      break
    }
  }
  return routeConfig
}
const modifyRequest = (req) => {
  // - 取得 head 設定
  req.debug = req.headers['x-debug'] ? req.headers['x-debug'] === '1' : false
  req.appid = req.headers['x-app-id'] ? req.headers['x-app-id'] : null
  req.clientIp = requestIp.getClientIp(req)
  // req 若有帶指定的host或db 則存在req.db內
  req.db = {
    host: req.headers['x-host'] ? req.headers['x-host'] : null,
    db: req.headers['x-db'] ? req.headers['x-db'] : null
  }
  // 將route設定檔埋到req內
  req.config = getReqConfig(req)
  return req
}
const afterResponse = (res) => {
  res.removeListener('finish', afterResponse)
  res.removeListener('close', afterResponse)
}
const beforeAfter = (req, res, next) => {
  if (req.url.indexOf('favicon.ico') !== -1) return next()
  const isStatic = req.url.indexOf('static') !== -1
  req = modifyRequest(req)
  if (isStatic) {
    const sec = expire_day * 24 * 60 * 60
    res.setHeader('Cache-Control', `public, max-age=${sec}`)
    res.setHeader('Expires', new Date(Date.now() + sec).toUTCString())
    next()
  } else {
    res.on('finish', () => afterResponse(res))
    res.on('close', () => afterResponse(res))
    next()
  }
}
module.exports = beforeAfter
