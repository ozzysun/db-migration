const RouteClass = require('../../../core/RouteClass')
const { createMigration } = require('../../../core/db/migration')
const { cmd } = require('../../../core/utils/cmd')
const path = require('path')

class Route extends RouteClass {
  routes() {
    this.get('hello', (req, res) => {
      this.json(res, req.config)
    })
    this.get(':host/:db/:table/create', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      // 1.建立migration
      const resultArray = await createMigration(host, db, table)
      // 2.執行
      /*
      const workPath = path.resolve(`./hosts/${host}/${db}`)
      const cmdStr = `sequelize model:create --name ${table} --attributes first_name:string,last_name:string,bio:text`
      const resultArray = await cmd(workPath, cmdStr)
      */
      this.json(res, resultArray)
    })
    this.get(':host/:db/:table/update', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      res.send(`TODO: update host=${host} db=${db} table=${table}`)
    })
    this.get(':host/:db/:table/undo', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      res.send(`TODO: undo host=${host} db=${db} table=${table}`)
    })
    this.get(':host/:db/:table/run', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      res.send(`TODO: undo host=${host} db=${db} table=${table}`)
    })
  }
}
module.exports = Route
