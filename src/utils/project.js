const path = require('path')
const { isFileExist, copyFolder, readYAML, readFile, writeJSON } = require('./file')
const _ = require('lodash')
// 檢查並建立conf目錄
const createConfFolder = async() => {
  const sourcePath = path.resolve('./gulp/tpl/conf')
  const targetPath = path.resolve('./conf')
  const isExist = await isFileExist(targetPath)
  if (!isExist) {
    await copyFolder(sourcePath, targetPath)
    console.log(`已建立設定目錄，請開啟 conf/hosts.yml設定需要連線的host資料再重新執行`)
    return true
  } else {
    return false
  }
}
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
  let hostConfig = await getHostConfig(host)
  if (hostConfig === null) return
  // 檢查目錄是否存在
  const isNewDb = await createDbFolder(host, db, hostConfig)
  if (isNewDb) console.log(`已新增${host}/${db}`)
  // 執行migration
  
}
// 更新migration
const updateMigration = async(host, db, table, params) => {

}
module.exports = {
  createConfFolder, createMigration, updateMigration
}