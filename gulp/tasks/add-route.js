const gulp = require('gulp')
const path = require('path')
const { argv } = require('yargs')
const { readYAML, writeYAML, copyFolder } = require('../../src/core/utils/file')
const filePath = path.resolve('./conf/routes.yml')
gulp.task('add-route', async() => {
  const route = getArgs()
  if (route !== null) {
    await checkAndSave(route)
  } else {
    runPrompt()
  }
})
const getArgs = () => {
  if (argv.ns === undefined) return null
  const args = {
    id: argv.ns,
    dir: `routes/${argv.ns}`,
    ns: argv.ns,
    common: '',
    enable: argv.enable !== 'false',
    auth: argv.auth || 'default'
  }
  return args
}
const runPrompt = () => {
  console.log('ERROR!! 請設定目錄名稱參數 gulp add-route --ns ')
}
const checkAndSave = async(route) => {
  const routes = await readYAML(filePath)
  let isExist = false
  routes.forEach(item => {
    if (item.id === route.id) isExist = true
  })
  console.log('routes===')
  console.log(routes)
  if (isExist) {
    console.log(`ERROR ${route.id} 已經存在 請重新執行 gulp --ns`)
  } else {
    routes.push(route)
    const readResult = await writeYAML(filePath, routes)
    if (readResult) {
      const source = path.resolve('./gulp/tpl/sample_route')
      const target = path.resolve(`./src/routes/${route.id}`)
      const copyResult = await copyFolder(source, target)
      if (copyResult) {
        console.log(`完成!! 請開啟src/routes/${route.id}目錄編輯 `)
        console.log(`開啟 http://localhost:3138/${route.id}/hello `)
      }
    } else {
      console.error('ERROR 寫入錯誤 請重新執行')
    }
  }
}
