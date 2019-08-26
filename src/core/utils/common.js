const path = require('path')
const jwt = require('jwt-simple')
const str2Obj = (str, delimiter = '&') => { // ex: str = 'a=1&b=2&c=3'
  const strArray = str.split(delimiter)
  const resultObj = {}
  strArray.forEach(item => {
    const tmp = item.split('=')
    resultObj[tmp[0]] = tmp[1]
  })
  return resultObj
}
const str2Array = (str, delimiter = ',') => { // ex: str='1,2,3,4'
  return str !== undefined ? str.split(delimiter) : []
}
// 目錄
const rootResolve = (dir) => { // ex: dir='src/xx/xx'
  return path.join(process.cwd(), dir)
}
const jwtDecode = (token, authType) => {
  const config = global.config.jwt[authType]
  return jwt.decode(token, config.secret, config.alg)
}
const jwtEncode = (payload, authType) => {
  // --allow :HS256, HS384, HS512 and RS256.
  const config = global.config.jwt[authType]
  return jwt.encode(payload, config.secret, config.alg)
}
const getErrorObj = ({ req, code, title, detail = '' }) => {
  return {
    code, title, detail,
    source: `${req.headers.host}/${req.url}`
  }
}
const trace = (info, type = 'info') => { // type: info|error|warn
  console.log(info)
}
module.exports = {
  str2Obj, str2Array,
  rootResolve,
  jwtEncode, jwtDecode,
  getErrorObj, trace
}

