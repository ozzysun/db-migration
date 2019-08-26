const Sequelize = require('sequelize')
const { trace } = require('../utils/common')
const { readJSON } = require('../utils/file')
class ORM {
  constructor({ config = null, host = null, db = null }) {
    this.sequelize = null
    this.typeMap = null
    if (config === null && host !== null) config = global.hosts[host]
    if (config !== null && db !== null) {
      return this.init(config, db)
    } else {
      trace(`[ERROR]!! [core/db/orm.js]建立orm失敗 host=${host} db=${db}`, 'error')
      return null
    }
  }
  init(config, db = null) {
    this.config = config
    this.config.password = '' + this.config.password
    this.hostId = this.config.id
    this.dbName = db
    this.sequelize = this.getSequelize(this.dbName, this.config)
    if (this.sequelize === null) return null
    // 將 Sequelize property adapt到class上
    const staticProp = ['QueryTypes', 'Op', 'DataTypes']
    staticProp.forEach(prop => {
      this[prop] = Sequelize[prop]
    })
    // 將sequelize instance prop adapter 到this上
    const instanceProp = ['sync']
    instanceProp.forEach(prop => {
      this[prop] = this.sequelize[prop]
    })
    // 將 model method adapter 到this上
    const methods = ['bulkCreate', 'count', 'create', 'destroy', 'findAll', 'findOne', 'max', 'min', 'sync', 'update', 'upsert']
    methods.forEach(method => {
      this[method] = async(table, setting) => { // { options, values,field }
        const result = await this.modelMethod(method, table, setting)
        return result
      }
    })
    return this
  }
  async model(tableName) {
    const modelPath = `${global.dir.root}/models/${this.hostId}/${this.dbName}/${tableName}.json`
    console.log(`load modelPath=${modelPath}`)
    const jsonData = await readJSON(modelPath)
    const model = this.getModelFromJson(jsonData)
    return model
  }
  // 取得model內的設定 欄位類型,pk等.., null代表錯誤
  async schema(tableName) {
    try {
      const model = await this.model(tableName)
      if (model === null) return null
      const column = {}
      const notnullArray = []
      for (const prop in model.tableAttributes) {
        column[prop] = {
          fieldName: model.tableAttributes[prop].fieldName,
          type: model.tableAttributes[prop].type.key || model.tableAttributes[prop].type,
          length: model.tableAttributes[prop].type._length || 0,
          primaryKey: model.tableAttributes[prop].primaryKey !== undefined ? model.tableAttributes[prop].primaryKey : false,
          allowNull: model.tableAttributes[prop].allowNull,
          defaultValue: model.tableAttributes[prop].defaultValue !== undefined ? model.tableAttributes[prop].defaultValue : null,
          autoIncrement: model.tableAttributes[prop].autoIncrement !== undefined ? model.tableAttributes[prop].autoIncrement : false
        }
        if (!column[prop].allowNull) notnullArray.push(prop)
      }
      return {
        column: column,
        pkArray: model.primaryKeyAttributes,
        notnullArray: notnullArray // 不可null的欄位
      }
    } catch (e) {
      trace(e, 'error')
      return null
    }
  }
  // 做sql query 查詢
  async query(sqlStr, opts = {}) {
    let error = null
    if (opts.type === undefined) opts.type = Sequelize.QueryTypes.SELECT
    let result = await this.sequelize.query(sqlStr, opts).catch(e => { error = e })
    if (error === null) {
      // 當是SELECT的結果才需要過濾
      if (opts.type === Sequelize.QueryTypes.SELECT) result = this.trimSpRows(result)
      return result
    } else {
      trace(error, 'error')
      return null
    }
  }
  // -- Private-------------
  // 錯誤 回傳null
  getSequelize(db, { host, port, dbType, user, password, connectionLimit }) {
    let sequelize = null
    try {
      sequelize = new Sequelize(db, user, password, {
        host: host,
        dialect: dbType,
        dialectOptions: {
          multipleStatements: true,
          decimalNumbers: true // 強制把decimal 轉成number
        },
        port: port,
        pool: {
          max: connectionLimit,
          min: 0,
          acquire: 10000,
          idle: 10000
        },
        benchmark: true,
        logging: (info, ms) => {}
      })
    } catch (e) {
      trace(e, 'error')
    }
    return sequelize
  }
  // TODO: 若options內未帶where 則只當作where 條件, 錯誤回傳null
  async modelMethod(method, table, { options, values = null, field = null }) {
    let error = null
    const model = await this.model(table)
    // 當options沒有帶where 則 整個options都當作where條件
    const optionObj = Object.prototype.hasOwnProperty.call(options, 'where') ? options : { where: options }
    let result = null
    if (values !== null) {
      result = await model[method](values, optionObj).catch(e => { error = e })
    } else if (field !== null) {
      result = await model[method](field, optionObj).catch(e => { error = e })
    } else {
      result = await model[method](optionObj).catch(e => { error = e })
    }
    if (error !== null) {
      trace(error, 'error')
      return null
    } else {
      return result
    }
  }
  // 過濾掉由mysql sp 取得的資料 回傳[]
  trimSpRows(_rows) {
    if (_rows === null || !Array.isArray(_rows)) return []
    const result = []
    for (let i = 0; i < _rows.length; i++) {
      // 濾掉fieldCount 濾掉 空物件 {}
      const keys = Object.keys(_rows[i])
      if (keys.indexOf('fieldCount') !== -1 || keys.length === 0) continue
      // 取出 key '0' 這樣的要轉成array
      if (!isNaN(parseInt(keys[0]))) {
        keys.forEach(key => {
          result.push(_rows[i][key])
        })
      } else {
        result.push(_rows[i])
      }
    }
    return result
  }
  // 將json設定值轉成model物件
  getModelFromJson(data) {
    console.log('data==')
    console.log(data)
    for (const prop in data[0]) {
      data[0][prop].type = this.getTypeFromStr(data[0][prop].type)
    }
    return this.sequelize.define(data[1].tableName, data[0], data[1])
  }
  // 將 'DataTypes.STRING(10)' 這樣字串轉成 Sequelize.DataTypes.STRING(10)
  getTypeFromStr(typeStr) {
    typeStr = typeStr.replace('DataTypes.', '')
    if (typeStr.indexOf('(') !== -1) {
      const type = typeStr.substr(0, typeStr.indexOf('('))
      let param = typeStr.substr(typeStr.indexOf('(') + 1, typeStr.length - 1)
      if (!isNaN(parseInt(param))) param = parseInt(param)
      return Sequelize.DataTypes[type](param)
    } else {
      return Sequelize.DataTypes[typeStr]
    }
  }
  /* 透過js取得model 廢棄不用 由 /models/目錄已產生的js檔 產生model物件 model: { dataValues:..}
  async model(tableName) {
    try {
      const modelPath = `${global.dir.root}/models/${this.hostId}/${this.dbName}/${tableName}`
      return global.require2(modelPath)(this.sequelize, this.DataTypes)
    } catch (e) {
      trace(e, 'error')
      return null
    }
  }
  */
}
module.exports = ORM
