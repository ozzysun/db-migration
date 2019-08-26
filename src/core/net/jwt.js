const { jwtDecode, getErrorObj } = require('../utils/common')
const JWT = (req, res, next) => {
  if (req.url.indexOf('favicon.ico') !== -1) return next() // 排除icon 的request
  const authType = req.config !== undefined && req.config !== null && req.config.auth ? req.config.auth : null
  const token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-token']
  if (authType === undefined || authType === null) {
    next()
  } else {
    if (token) {
      tokenDecode(token)
    } else {
      res.setHeader('Content-Type', 'application/vnd.api+json')
      res.json({
        errors: [getErrorObj({ req, code: 100, title: 'token不存在' })]
      })
    }
  }
}
const tokenDecode = (res, req, next, token, authType) => {
  try {
    const decoded = jwtDecode(token, authType)
    if (decoded.exp <= Date.now()) {
      res.setHeader('Content-Type', 'application/vnd.api+json')
      res.json({
        errors: [getErrorObj({ req, code: 100, title: 'token已過期' })]
      })
    } else {
      req.tokenData = decoded.data
      next()
    }
  } catch (err) {
    res.setHeader('Content-Type', 'application/vnd.api+json')
    res.json({
      errors: [getErrorObj({ req, code: 100, title: 'token ERROR' })]
    })
  }
}
module.exports = JWT
