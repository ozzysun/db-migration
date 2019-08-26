const bodyParser = require('body-parser') // 用來接收 post req.body x-www-form-urlencoded
const compress = require('compression')
const cors = require('cors')
const multer = require('multer') // 用來接收 post req.body form-data
const health = require('express-ping')
const express = require('express')
const lodash = require('consolidate').lodash
const ip = require('ip')
const { loadFolderFiles } = require('../utils/file')
const beforeAfter = require('./beforeAfter')
const jwt = require('./jwt')
const { useGraphql } = require(`../../graphql`)
const OZSocket = require('./socket')
const session = require('express-session')
const getRouter = async(port, staticPath = './public') => {
  try {
    // 產生express app 與router, server
    const { router, app, server } = createAPIServer(port, staticPath)
    let socket = null
    if (global.config.socket.enable) {
      socket = createSocketServer(global.config.socket.port, app)
    }
    await getRoutes(router, global.routes)
    return { router, app, server, socket }
  } catch (e) {
    console.log(e)
  }
}
const createAPIServer = (apiPort = 3138, staticPath = './public') => {
  const app = express()
  const router = express.Router()
  // -- app setting ------
  app.use(compress())
  app.use(cors())
  app.use(bodyParser.urlencoded({ // 接收 post www-form-urlencoded與檔案
    limit: '10mb',
    extended: true
  }))
  app.use(bodyParser.json({
    limit: '10mb'
  }))
  app.use(bodyParser.raw())
  app.use(multer().array()) // 接收 post form-data與檔案 TODO:要用.array()才有效
  // 設定靜態網頁路徑
  app.use('/static', express.static(staticPath))
  // 使用session
  app.use(session({
    secret: 'oz',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
  // app.use('/', express.static(path.resolve('www')))
  // --underscore template--
  app.set('view engine', 'html')
  app.engine('html', lodash)
  // -- add ping
  app.use(health.ping())
  app.use('/', router)
  // graphql
  useGraphql(router)
  // -- router setting ------
  router.use(beforeAfter)
  router.use(jwt)
  const server = app.listen(apiPort, () => {
    console.log(`oz api Start:${ip.address()}:${apiPort} or use graphql@ ${ip.address()}:${apiPort}/graphql ...ctr+c to stop service`)
  })
  return { router, app, server }
}
const createSocketServer = (port, app) => {
  const socket = new OZSocket('oz', app)
  socket.listen(port, 'all', (data) => {
    console.log(`Socket RECEIVE Data =${data}`)
  })
  return socket
}
// 依照routesConfig設定 載入指定的route檔案
const getRoutes = async(app, routesConfig) => {
  try {
    // routesConfig = modifyConfigData(routesConfig)
    for (let i = 0; i < routesConfig.length; i++) {
      const routeData = routesConfig[i]
      const files = await loadFolderFiles(routeData.dir, 'js', 'name')
      files.forEach(filename => {
        const requirePath = `${routeData.dir}/${filename}`
        const RouteClass = global.require2(requirePath)
        const opt = { app, ns: routeData.ns, host: routeData.host, db: routeData.db, filename: requirePath }
        new RouteClass(opt)
      })
    }
    return true
  } catch (e) {
    console.log(e)
  }
}
// 將routes設定 轉換dir 轉為絕對路徑, 並產生private 與public目錄設定
const modifyRoutesConfig = (routesConfig) => {
  const binPath = global.dir.bin
  const result = []
  routesConfig.forEach(item => {
    // enable 的目錄才會載入
    if (item.enable) {
      // 調整設定或加入預設值
      // if (item.autodb === undefined) item.autodb = true
      const publicItem = {}
      const privateItem = {}
      for (const prop in item) {
        publicItem[prop] = item[prop]
        privateItem[prop] = item[prop]
      }
      publicItem.dir = `${binPath}/${publicItem.dir}/public` // 放置開放的目錄
      delete publicItem.auth
      privateItem.id = `${privateItem.ns}_s`
      privateItem.dir = `${binPath}/${privateItem.dir}/private` // 放置需要token驗證的目錄
      privateItem.ns = `${privateItem.ns}/s` // 需要token驗證的網址
      // 建立private 與 public
      result.push(privateItem)
      result.push(publicItem)
    }
  })
  return result
}
module.exports = { getRouter, modifyRoutesConfig }
