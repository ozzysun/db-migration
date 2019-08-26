const SequelizeAuto = require('sequelize-auto')
const { readFile, writeFile } = require('../utils/file')
const path = require('path')
const logPath = path.resolve(`./models/log.txt`)
// 預設建立josn model 資料
const buildModel = async(host, db, tables = [], json = true, opts = null) => {
  const hostConfig = global.hosts[host]
  const checkContent = await readCheckFile(logPath)
  const modelPath = `${global.dir.root}/models/${host}/${db}`
  if (checkContent === '') {
    // 寫入檢查碼
    const text = `host=${host}|db=${db}|tables=${tables.join(',')}`
    await writeCheckFile(text)
    if (hostConfig !== null) {
      const opts = {
        host: hostConfig.host,
        port: hostConfig.port,
        dialect: hostConfig.dbType,
        directory: modelPath,
        additional: {
          freezeTableName: true,
          timestamps: false
        },
        json
      }
      if (tables.length > 0) opts.tables = tables
      const result = await runBuildModel({
        db, opts,
        user: hostConfig.user,
        password: hostConfig.password
      })
      return result === undefined ? true : result
    } else {
      return false
    }
  }
}
// 執行 build model
const runBuildModel = async({ db, user, password, opts }) => {
  return new Promise((resolve, reject) => {
    // 執行
    const auto = new SequelizeAuto(db, user, password, opts)
    auto.run(async(err) => {
      await writeCheckFile()
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
// 讀寫檢查檔案
const readCheckFile = async() => {
  let content = await readFile(logPath).catch(e => {})
  if (content === undefined) {
    await writeFile(logPath, '').catch(e => {})
    content = ''
  }
  return content
}
const writeCheckFile = async(str = '') => {
  const result = await writeFile(logPath, str)
  return result
}
module.exports = { buildModel, writeCheckFile }
