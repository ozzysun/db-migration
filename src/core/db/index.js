const { trace } = require('../utils/common')
// page 與perPage未定義代表不分頁
const query = async({ orm, table, params, page, perPage, attributes }) => {
  let error = null
  const model = await orm.model(table)
  const queryOption = getQueryOption({ params, page, perPage, attributes })
  const queryResult = await model.findAndCountAll(queryOption).catch(e => { error = e })
  if (error === null) {
    const rows = queryResult.rows
    if (page !== undefined && perPage !== undefined) {
      // 有分頁查詢 取得count 與rows
      const meta = {
        page, perPage,
        pageCount: rows.length, // 本頁數量
        count: queryResult.count // 總數量
      }
      return { rows, meta }
    } else {
      return { rows }
    }
  } else {
    trace(error, 'error')
    return null
  }
}
// 新增  params:加入的column資料
const create = async({ orm, table, values, transaction = null }) => {
  let error = null
  const model = await orm.model(table)
  const opts = transaction !== null ? { transaction } : {}
  const queryResult = await model.create(values, opts).catch(e => { error = e })
  if (error === null) {
    return queryResult // 回傳 model 物件
  } else {
    trace(error, 'error')
    return null
  }
}
// 新增或修改  params:要修改或加入的column資料
const upsert = async({ orm, table, values }) => {
  let error = null
  const model = await orm.model(table)
  const queryResult = await model.upsert(values).catch(e => { error = e })
  if (error === null) {
    return queryResult // 回傳 true 為新增 false 為修改
  } else {
    trace(error, 'error')
    return null
  }
}
// 修改  params:要修改或加入的column資料
const update = async({ orm, table, values, params }) => {
  let error = null
  const model = await orm.model(table)
  const queryResult = await model.update(values, { where: params }).catch(e => { error = e })
  if (error === null) {
    return queryResult // 回傳影響數量array
  } else {
    trace(error, 'error')
    return null
  }
}
const destroy = async({ orm, table, params, transaction = null }) => {
  let error = null
  const model = await orm.model(table)
  const opts = Object.prototype.hasOwnProperty.call(params, 'where') ? params : { where: params } // 查詢參數
  if (transaction !== null) opts.transaction = transaction
  const queryResult = await model.destroy(opts).catch(e => { error = e })
  if (error === null) {
    return queryResult // 回傳數字
  } else {
    trace(error, 'error')
    return null
  }
}
// utils --
// 組合產生要執行產生查詢所需要的query option, 若params 未帶where則整個params都是 where條件
const getQueryOption = ({ params, page, perPage, attributes }) => {
  const queryOpts = Object.prototype.hasOwnProperty.call(params, 'where') ? params : { where: params } // 查詢參數
  // 分頁
  if (page !== undefined && perPage !== undefined) {
    queryOpts.limit = perPage
    queryOpts.offset = perPage * (page - 1)
  }
  // 查詢欄位
  if (attributes !== undefined) queryOpts.attributes = attributes
  // 排序
  queryOpts.raw = true
  return queryOpts
}
module.exports = { query, create, update, upsert, destroy }
