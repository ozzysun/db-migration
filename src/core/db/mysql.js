'use strict'
// 操作mysql db的基本功能
const mysql = require('mysql2/promise')
const ORM = require(`./orm`)
// 建立資料庫
const createDb = async(targetHost, targetDb, transaction = null) => {
  try {
    const hostObj = global.hosts[targetHost]
    const connection = await mysql.createConnection({
      host: hostObj.host,
      user: hostObj.user,
      password: hostObj.password + ''
    })
    const opts = transaction === null ? {} : { transaction }
    const result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${targetDb} CHARACTER SET utf8 COLLATE utf8_general_ci ;`, opts)
    if (result[0].warningStatus === 0) {
      return `新增 db=${targetDb}@${targetHost} 成功`
    } else if (result[0].warningStatus > 0) {
      const warnings = await connection.query(`show warnings;`)
      const info = []
      warnings[0].forEach(warn => {
        info.push(warn.Message)
      })
      return info.join(',')
    } else {
      return result
    }
  } catch (e) {
    console.log('.....create db error')
    console.log(e)
    throw e
  }
}
// 建立table , 當force=true 就會把原table清空,形同清除原來所有資料
const createTable = async({ targetHost, targetDb, tables, force = false }, transaction = null) => {
  const info = []
  try {
    // 檢查並建立db
    const checkDb = await createDb(targetHost, targetDb, transaction)
    info.push({ checkDb: checkDb })
    const orm = new ORM()
    const hostObj = global.hosts[targetHost]
    orm.initDB(hostObj, targetDb)
    for (const table of tables) {
      const model = orm.model(table)
      const opts = force ? { force: true } : { alert: true }
      if (transaction !== null) opts.transaction = transaction
      // force 時,當已經有的drop 掉 強制建立新的 否則預設都是 當不存在時才建立
      const result = await model.sync(opts)
      info.push({ syncTable: result })
    }
    return info
  } catch (e) {
    info.push(e)
    throw info
  }
}
// 指定 單一table 資料複製 force=true 當已存在則強制更新資料 modify={key:xxx} 將要copy資料修改的內容
const cloneTableData = async({ sourceOrm, targetOrm, table, params, force = false, modify = null }, transaction = null) => {
  // 1. source 連線讀取
  const sourceModel = sourceOrm.model(table)
  const sourceSchema = sourceOrm.modelSchema(table)
  const readOpts = { where: params }
  if (transaction !== null) readOpts.transaction = transaction
  const sourceResult = await sourceModel.findAll(readOpts)
  // 2.轉成可寫入的資料 要刪除auto的欄位資料
  const records = []
  sourceResult.forEach(item => {
    const value = item.dataValues
    if (modify !== null) {
      for (const prop in modify) {
        value[prop] = modify[prop]
      }
    }
    // 刪除 autoincreate欄位的資料
    for (const prop in value) {
      if (sourceSchema.fields[prop].autoIncrement) delete value[prop]
    }
    records.push(value)
  })
  // 3.target 連線寫入 當force則先刪除再寫入
  const targetModel = targetOrm.model(table)
  let deleteResult = null
  if (force) {
    const delOpts = { where: params }
    if (transaction !== null) delOpts.transaction = transaction
    deleteResult = await targetModel.destroy(delOpts)
  }
  const createOpts = { ignoreDuplicates: true }
  if (transaction !== null) createOpts.transaction = transaction
  const targetResult = await targetModel.bulkCreate(records, createOpts)
  return {
    source: records,
    target: targetResult,
    delete: deleteResult
  }
}
// 複製多 table資料 tables內容為 [{table: params: modify:}] params是查詢參數,modify是強制修改的欄位資料
const cloneMultiTableData = async({ sourceOrm, targetOrm, tables, force = false }, transaction = null) => {
  const info = []
  for (const item of tables) {
    const modify = item.modify === undefined ? null : item.modify
    const result = await cloneTableData({ sourceOrm, targetOrm, force, modify, table: item.table, params: item.params }, transaction)
    info.push(result)
  }
  return info
}
// 指定 欄位取得最大值, 當有orm就不需要再提供host與 db
const getMax = async({ orm, host, db, table, fieldname }) => {
  if (orm === undefined) {
    orm = new ORM()
    const hostObj = global.hosts[host]
    orm.initDB(hostObj, db)
  } else {
    db = orm.db
  }
  console.log(orm)
  const sqlStr = `select  Max(${fieldname}) as max from ${db}.${table};`
  console.log(`get max sql=${sqlStr}`)
  const row = await orm.query(sqlStr)
  if (row !== null && row.length > 0) {
    return row[0].max
  } else {
    return 0
  }
  // console.log(`query rewsult === length=${row.length}`)
  // console.log(`val=${row[0].max} type=${typeof row[0].max}`)
}
module.exports = { createDb, createTable, cloneTableData, cloneMultiTableData, getMax }
