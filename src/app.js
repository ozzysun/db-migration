const defaultSetting = require('./setting')
const { getRouter, modifyRoutesConfig } = require('./core/net/router')
const { isFileExist, readYAML, writeYAML } = require(('./core/utils/file'))
// 載入外部conf下的config檔案
const loadConfig = async(setting = null) => {
  if (setting === null) setting = defaultSetting
  const result = {}
  for (let i = 0; i < setting.files.length; i++) {
    result[setting.files[i].id] = await readYAML(setting.files[i].path)
  }
  // 將hosts array 轉成object
  if (result.hosts) {
    const hostsObj = {}
    result.hosts.forEach(item => {
      hostsObj[item.id] = item
    })
    result.hosts = hostsObj
  }
  result.dir = setting.dir
  result.require2 = require // 儲存require在動態載入用
  return result
}
// 啟動express
const startExpress = async() => {
  const config = global.config
  // 建立 router
  const { router, app, server } = await getRouter(config.port, './static')
  return { router, app, server }
}
// 產生預設的conf 目錄
const createConfFolder = async(setting = null) => {
  if (setting === null) setting = defaultSetting
  try {
    for (let i = 0; i < setting.files.length; i++) {
      const isExist = await isFileExist(setting.files[i].path)
      if (!isExist) await writeYAML(setting.files[i].path, setting.files[i].default)
    }
    return true
  } catch (e) {
    return false
  }
}
const startServer = async(modifier = null) => { // 若需要在啟動時 強制修改config 可以 由這裏帶入
  await createConfFolder(defaultSetting)
  const configData = await loadConfig(defaultSetting)
  if (modifier !== null && configData.config !== undefined) {
    for (const prop in modifier) {
      configData.config[prop] = modifier[prop]
    }
  }
  // 取得設定值存到global
  for (const prop in configData) {
    global[prop] = configData[prop]
  }
  global.routes = modifyRoutesConfig(global.routes)
  const result = await startExpress()
  return result
}
module.exports = { startServer, createConfFolder, loadConfig }
