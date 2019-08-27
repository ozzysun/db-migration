const path = require('path')
const { isFileExist, copyFolder, readYAML, writeFileFromTpl } = require('../utils/file')
const { cmd } = require('../utils/cmd')
const moment = require('moment')
// 檢查並建立sequelize目錄
const createDbFolder = async(host, db, dbConfig) => {
  const sourcePath = path.resolve('./gulp/tpl/db')
  const targetPath = path.resolve(`./hosts/${host}/${db}`)
  const isExist = await isFileExist(targetPath)
  if (!isExist) {
    // 複製產生目錄
    await copyFolder(sourcePath, targetPath)
    // 建立config檔案
    await createConfigJSON(host, db, dbConfig)
    return true
  } else {
    return false
  }
}
const createConfigJSON = async(host, db, dbConfig) => {
  const sourceFile = path.resolve(`./gulp/tpl/config.json.tpl`)
  const targetFile = path.resolve(`./hosts/${host}/${db}/config/config.json`)
  dbConfig.database = db
  const result = await writeFileFromTpl(sourceFile, targetFile, dbConfig)
  return result
}
// 以host 名稱取得host config
const getHostConfig = async(host) => {
  const hosts = await readYAML('./conf/hosts.yml')
  let hostConfig = null
  hosts.forEach(item => {
    if (item.id === host) hostConfig = item
  })
  if (hostConfig === null) {
    console.log(`[ERROR] hosts.yml未設定${host}連線資訊 `)
    return null
  } else {
    return hostConfig
  }
}
// 建立table migration
const createTableMigration = async(host, db, table, columns) => {
  // 取得host設定
  const hostConfig = await getHostConfig(host)
  if (hostConfig === null) return
  // 檢查目錄是否存在
  const isNewDb = await createDbFolder(host, db, hostConfig)
  if (isNewDb) console.log(`已新增${host}/${db}`)
  const tplPath = path.resolve('./gulp/tpl/migration/createTable.tpl')
  const fileName = genFileName('create', table)
  const targetPath = path.resolve(`./hosts/${host}/${db}/migrations/${fileName}`)
  const data = { table, columns: modifyColumns(columns) }
  const result = await writeFileFromTpl(tplPath, targetPath, data)
  return result
}
// 更新 table migration
const updateTableMigration = async(host, db, table, columns) => {
  const tplPath = path.resolve('./gulp/tpl/migration/updateTable.tpl')
  const fileName = genFileName('create', table)
  const targetPath = path.resolve(`./hosts/${host}/${db}/migrations/${fileName}`)
  const data = { table, columns: modifyColumns(columns) }
  const result = await writeFileFromTpl(tplPath, targetPath, data)
  return result
}
// 執行 migration
const runMigration = async(host, db, table) => {
  // 執行migration
  const workPath = path.resolve(`./hosts/${host}/${db}`)
  const cmdStr = `sequelize db:migrate`
  const resultArray = await cmd(workPath, cmdStr)
  return resultArray
}
// 執行回復
const undoMigration = async(host, db, table, all = false) => {
  // 執行migration
  const workPath = path.resolve(`./hosts/${host}/${db}`)
  const cmdStr = all ? `sequelize db:migrate:undo:all` : `sequelize db:migrate:undo`
  const resultArray = await cmd(workPath, cmdStr)
  return resultArray
}
// -- utils -----------
// 產生migration檔名
const genFileName = (action, table) => {
  let stamp = '' + new Date().getTime()
  stamp = stamp.substr(stamp.length - 6, 6)
  const fileName = `${moment().format('YYYYMMDD')}${stamp}-${action}-${table}.js`
  return fileName
}
// 過濾 產生有效的column設定
const modifyColumns = (columns) => {
  const allowProp = ['type', 'allowNull', 'primaryKey', 'autoIncrement', 'defaultValue', 'columnName']
  const lowcaseProp = ['type', 'allownull', 'primarykey', 'autoincrement', 'defaultvalue', 'columnname']
  const newColumns = []
  columns.forEach(column => {
    const obj = {}
    for (const prop in column) {
      const propIndex = lowcaseProp.indexOf(prop)
      if (propIndex !== -1) {
        if (prop === 'type') {
          obj[allowProp[propIndex]] = `Sequelize.${column[prop]}`
        } else {
          obj[allowProp[propIndex]] = column[prop]
        }
      }
      newColumns.push(obj)
    }
  })
  return newColumns
}
module.exports = {
  createTableMigration, updateTableMigration,
  runMigration, undoMigration
}
