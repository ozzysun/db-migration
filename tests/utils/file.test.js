const { rootResolve, rootRequire, sinon } = require('../tool')
const { readFile, writeFile, loadFolderFiles, isFileExist, readYAML, writeYAML, readJSON, writeJSON, copyFolder, removeFolder } = rootRequire('src/core/utils/file')
describe('[utils/file] file 功能', () => {
  it('1.1 檔案是否存在(isFileExist):存在=true', async() => {
    const filePath = rootResolve('testsample/sample.yml')
    const result = await isFileExist(filePath)
    sinon.assert.match(result, true)
  })
  it('1.1.1 檔案是否存在(isFileExist):不存在=false', async() => {
    const filePath = rootResolve('testsample/no.yml')
    const result = await isFileExist(filePath)
    sinon.assert.match(result, false)
  })
  it('1.2 讀取檔案(readFile):成功=text', async() => {
    const filePath = rootResolve('testsample/sample.txt')
    const result = await readFile(filePath).catch(e => {})
    sinon.assert.match(result, 'sample')
  })
  it('1.2.1 讀取檔案(readFile):失敗=undefined', async() => {
    const filePath = rootResolve('testsample/sample1.txt')
    const result = await readFile(filePath).catch(e => {})
    sinon.assert.match(result, undefined)
  })
  it('1.3 寫入案(writeFile)成功=true', async() => {
    const filePath = rootResolve('testsample/oz.txt')
    const result = await writeFile(filePath, 'imozz').catch(e => {})
    sinon.assert.match(result, true)
  })
  it('1.4 載入目錄檔案列表(loadFolderFiles)成功＝取得陣列', async() => {
    const filePath = rootResolve('testsample')
    const result = await loadFolderFiles(filePath).catch(e => {})
    sinon.assert.match(Array.isArray(result), true)
  })
  it('2.1 讀取yaml檔案(readYAML):檔案存在', async() => {
    const filePath = rootResolve('testsample/sample.yml')
    const result = await readYAML(filePath).catch(e => {})
    sinon.assert.match(Array.isArray(result), true)
  })
  it('2.1.1 讀取yaml檔案(readYAML):檔案不存在=undefined', async() => {
    const filePath = rootResolve('testsample/hosts1.yml')
    const result = await readYAML(filePath).catch(e => {})
    sinon.assert.match(result, undefined)
  })
  it('2.2 寫入yaml檔案(writeYAML):成功=true', async() => {
    const filePath = rootResolve('testsample/sample1.yml')
    const result = await writeYAML(filePath, { id: 'test', name: 'tfdsf' }).catch(e => {})
    sinon.assert.match(result, true)
  })
  it('3.1 讀取json檔案(readYAML):檔案存在', async() => {
    const filePath = rootResolve('testsample/sample.json')
    const result = await readJSON(filePath).catch(e => {})
    sinon.assert.match(Array.isArray(result), true)
  })
  it('3.1.1 讀取yaml檔案(readYAML):檔案不存在=undefined', async() => {
    const filePath = rootResolve('testsample/hosts1.json')
    const result = await readJSON(filePath).catch(e => {})
    sinon.assert.match(result, undefined)
  })
  it('3.2 寫入json檔案(writeJSON):成功=true', async() => {
    const filePath = rootResolve('testsample/sample1.json')
    const result = await writeJSON(filePath, { id: 'test', name: 'tfdsf' }).catch(e => {
    })
    sinon.assert.match(result, true)
  })
  it('4.1 複製目錄(copyFolder):成功=true', async() => {
    const sourcePath = rootResolve('testsample')
    const targetPath = rootResolve('testsample1')
    const result = await copyFolder(sourcePath, targetPath).catch(e => {})
    sinon.assert.match(result, true)
  })
  it('4.2 刪除目錄(removeFolder):成功=true', async() => {
    // const sourcePath = rootResolve('testsample')
    const targetPath = rootResolve('testsample1')
    const result = await removeFolder(targetPath).catch(e => {})
    sinon.assert.match(result, true)
  })
})
