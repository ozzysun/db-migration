const gulp = require('gulp')
const path = require('path')
const shell = require('shelljs')
const { copyFolder, removeFolder } = require('../../src/core/utils/file')
const { createConfFolder } = require('../../src/app')
gulp.task('default', async() => {
  // 若連/conf 都不存在 則透過setting 產生
  await createConfFolder()
  await shell.exec('npm run start')
})
// 初次使用需先建立conf目錄
gulp.task('init', async() => {
  // 若conf不存在 則產生
  const isNewConf = await createConfFolder()
  console.log(`init =${isNewConf}`)
})
// 執行單元測試
gulp.task('test', async() => {
  // 建立測試目錄 才執行測試
  const sourcePath = path.resolve('./.testsample')
  const targetPath = path.resolve('./testsample')
  await removeFolder(targetPath)
  await copyFolder(sourcePath, targetPath)
  await shell.exec('npm run test:unit')
})
