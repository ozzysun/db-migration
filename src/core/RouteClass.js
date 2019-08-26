const ORM = require('./db/orm')
const { trace } = require('./utils/common')
class RouteClass {
  constructor({ app, ns = null }) {
    this.ns = ns
    this.app = app
    this.urlObj = {} // 儲存各method包含哪些url
    // 建立request method
    const methods = ['get', 'post', 'put', 'delete']
    methods.forEach(method => {
      this[method] = (...args) => {
        this.commonMethod(method, ...args)
      }
    })
    this.routes()
  }
  routes() { }
  // -- 取得ORM物件 當取得null 則為錯誤
  orm({ req = null, host = null, db = null }) { 
    // hostId設定優先讀取順序 1. useLocal 2.hsotId 3.req.db.host
    if (process.env.useLocal) host = 'dbLocal'
    if (host === null && req !== null && req.db.host !== null) host = req.db.host
    if (db === null && req !== null && req.db.db !== null) db = req.db.db
    return new ORM({ host, db })
  }
  commonMethod(method, uri, callback) {
    uri = uri.indexOf('/') === 0 ? `/${this.ns}${uri}` : `/${this.ns}/${uri}`
    if (this.urlObj[method] === undefined) this.urlObj[method] = []
    this.urlObj[method].push(uri)
    this.app[method](uri, callback)
  }
  json(res, data, debugInfo = null) {
    // JSON API Spec
    res.setHeader('Content-Type', 'application/vnd.api+json')
    if (res.debug && debugInfo !== null) {
      res.json({ data, debug: debugInfo })
    } else {
      res.json({ data })
    }
  }
  log(str, type = 'info') {
    trace(str, type)
  }
}
module.exports = RouteClass
