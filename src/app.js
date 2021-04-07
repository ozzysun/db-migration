const defaultSetting = require('./setting')
const { createConfFolder, loadConfig, getArgs } = require('./config')
const { getRouter } = require('./core/net/router')
const startServer = async(modifier = null) => { // 若需要在啟動時 強制修改config 可以 由這裏帶入
  // 建立預設的conf檔案
  await createConfFolder(defaultSetting)
  const configData = await loadConfig(defaultSetting, modifier)
  const args = getArgs()
  for (const prop in configData) {
    global[prop] = configData[prop]
  }
  // 取得設定值存到global
  for (const prop in configData) {
    global[prop] = configData[prop]
  }
  // 啟動server { router, app, server }
  const port = args.port ? args.port : global.config.port
  const result = await getRouter(port, './public', global.routes, global.require2)
  return result
}
module.exports = { startServer }
