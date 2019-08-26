// 動態路徑無法build執行檔，以相對路徑導入
const RouteClass = require('../../../core/RouteClass')
class Route extends RouteClass {
  routes() {
    this.get('text', (req, res) => {
      res.send(`text`)
    })
    this.get('json', (req, res) => {
      this.json(res, { id: 'test', content: 'json' })
    })
    this.get('orm/:host/:db/:table', async(req, res) => {
      const orm = this.orm({ host: req.params.host, db: req.params.db })
      const sqlStr = `select * from ${req.params.table}`
      const rows = await orm.query(sqlStr).catch(e => { console.log(e) })
      this.json(res, rows)
    })
    // 測試取得schema
    this.get('orm/:host/:db/:table/schema', async(req, res) => {
      const orm = this.orm({ host: req.params.host, db: req.params.db })
      const schema = await orm.schema(req.params.table)
      this.json(res, schema)
    })
  }
}
module.exports = Route
