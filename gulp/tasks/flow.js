const gulp = require('gulp')
const path = require('path')
const shell = require('shelljs')
const { readYAML, copyFolder, removeFolder } = require('../../src/utils/file')
const { createConfFolder, createMigration } = require('../../src/utils/project')
const { getArgs } = require('../utils/common')
gulp.task('default', async() => {
  await run()
})
// 初次使用需先建立conf目錄
gulp.task('init', async() => {
  // 若conf不存在 則產生
  const isNewConf = await createConfFolder()
  if (isNewConf) return
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
const run = async() => {
  // 1.若conf不存在 則產生
  const isNewConf = await createConfFolder()
  if (isNewConf) return
  // 2.取得參數
  const args = getArgs()
  if (args === null) return
  // 3.建立migration
  const isNewDb = await createMigration(args.host, args.db, args.table)
}

