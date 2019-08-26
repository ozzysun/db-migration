const path = require('path')
const { isFileExist, copyFolder, readYAML, readFile, writeJSON } = require('../utils/file')
const _ = require('lodash')
const { cmd } = require('../utils/cmd')
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
  const tplData = await readFile(sourceFile)
  const compiled = _.template(tplData.toString())
  dbConfig.database = db
  const jsonData = compiled(dbConfig)
  const result = await writeJSON(targetFile, JSON.parse(jsonData))
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
// 建立migration
const createMigration = async(host, db, table, params) => {
  // 取得host設定
  const hostConfig = await getHostConfig(host)
  if (hostConfig === null) return
  // 檢查目錄是否存在
  const isNewDb = await createDbFolder(host, db, hostConfig)
  if (isNewDb) console.log(`已新增${host}/${db}`)
  // 執行migration
  const workPath = path.resolve(`./hosts/${host}/${db}`)
  const cmdStr = `sequelize model:create --name ${table} --attributes first_name:string,last_name:string,bio:text`
  const resultArray = await cmd(workPath, cmdStr)
  return resultArray
}
// 更新migration
const updateMigration = async(host, db, table, params) => {

}
module.exports = {
  createMigration, updateMigration
}