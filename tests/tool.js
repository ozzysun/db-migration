const path = require('path')
const supertest = require('supertest')
const sinon = require('sinon')
const rootResolve = (dir) => {
  // console.log(`resolve path=${path.join(process.cwd(), dir)}`)
  return path.join(process.cwd(), dir)
}
const rootRequire = (dir) => {
  return require(rootResolve(dir))
}
module.exports = { supertest, sinon, rootResolve, rootRequire }
