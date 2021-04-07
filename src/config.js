const { modifyRoutesConfig } = require('./core/net/router')
const { isFileExist, readYAML, writeYAML } = require(('./core/utils/file'))
const { argv } = require('yargs')
// 載入外部conf下的config檔案 setting:要傳入的setting內容, modifier:要overrid config設定檔的資訊
const loadConfig = async(setting, configModifier = null) => {
  // 依照setting載入所有file
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
  // 轉換routes
  result.routes = modifyRoutesConfig(result.routes, setting.dir.bin)
  // 設定其他
  result.dir = setting.dir
  result.require2 = require // 儲存require在動態載入用
  // 取modifier override 只對config有效
  if (configModifier !== null && result.config !== undefined) {
    for (const prop in configModifier) {
      result.config[prop] = configModifier[prop]
    }
  }
  return result
}
// 產生預設的conf 目錄
const createConfFolder = async(setting = null) => {
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
const getArgs = () => {
  // 若同時設定 enable與disable則以 disable生效
  let enable = null
  if (argv.disable) {
    enable = false
  } else if (argv.enable) {
    enable = true
  }
  // socket args
  const port = argv.port || argv.p || null
  const result = { port, enable }
  return result
}
module.exports = { loadConfig, createConfFolder, getArgs }
