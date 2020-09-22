const RouteClass = require('../../../core/RouteClass')
const { createTableMigration, undateTableMigration, runMigration, undoMigration } = require('../../../core/db/migration')
// const { cmd } = require('../../../core/utils/cmd')
// const path = require('path')

class Route extends RouteClass {
  routes() {
    this.get('hello', (req, res) => {
      this.json(res, req.config)
    })
    this.post(':host/:db/:table/:action', async(req, res) => {
      const host = req.params.host
      const db = req.params.db
      const table = req.params.table
      const action = req.params.action
      let columns = req.body.columns
      if (columns !== undefined && typeof columns === 'string') columns = JSON.parse(columns)
      /*
      columns = [{
        columnName: 'hello',
        type: 'INTEGER(11)',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      }]
      */
      let resultArray = []
      switch (action) {
        case 'create': // 建立migration file
          resultArray = await createTableMigration(host, db, table, columns)
          break
        case 'update': // 更新migragrion file
          resultArray = await undateTableMigration(host, db, table, columns)
          break
        case 'run': // 依照migration file 執行更新db
          resultArray = await runMigration(host, db, table)
          break
        case 'undo': // roll back 到上一個異動
          resultArray = await undoMigration(host, db, table)
          break
        case 'undoall': // roll back 到最初狀態
          resultArray = await undoMigration(host, db, table, true)
          break
      }
      this.json(res, resultArray)
    })
  }
}
module.exports = Route
