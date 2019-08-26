const { argv } = require('yargs')
const getArgs = () => {
  let errorInfo = []
  if (argv.host === undefined) errorInfo.push('請設定host')
  if (argv.db === undefined) errorInfo.push('請設定db')
  if (argv.table === undefined) errorInfo.push('請設定table')
  if (errorInfo.length !== 0) {
    console.log(`[ERROR]!! ${errorInfo.join(',')}`)
    return null
  } else {
    const args = {
      host: argv.host,
      db: argv.db,
      table: argv.table
    }
    
    return args
  }
}
module.exports = { getArgs }
