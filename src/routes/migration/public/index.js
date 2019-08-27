const RouteClass = require('../../../core/RouteClass')
const { createTableMigration, undateTableMigration, runMigration, undoMigration } = require('../../../core/db/migration')
// const { cmd } = require('../../../core/utils/cmd')
// const path = require('path')

class Route extends RouteClass {
  routes() {
    this.get('hello', (req, res) => {
      this.json(res, req.config)
    })
    this.get(':host/:db/:table/:action', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      const action = req.params.action
      let columns = req.body.columns
      columns = [{
        columnName: 'hello',
        type: 'INTEGER(11)',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      }]
      let resultArray = []
      switch (action) {
        case 'create':
          resultArray = await createTableMigration(host, db, table, columns)
          break
        case 'update':
          resultArray = await undateTableMigration(host, db, table, columns)
          break
        case 'run':
          resultArray = await runMigration(host, db, table)
          break
        case 'undo':
          resultArray = await undoMigration(host, db, table)
          break
        case 'undoall':
          resultArray = await undoMigration(host, db, table, true)
          break
      }
      this.json(res, resultArray)
    })
  }
}
module.exports = Route
