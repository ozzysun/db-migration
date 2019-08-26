'use strict'
let useGraphql
const resolve = require('./resolve')
const schema = require('./schema')
try {
  const { ApolloServer, gql } = require('apollo-server-express')
  const typeDefs = gql`
    ${schema}
  `
  const resolvers = {
    Query: resolve
  }
  // 透過contex 把req 或其他資訊傳進去
  const context = async({ req }) => {
    return req
    /*
    return {
      myProperty: true
    };
    */
  }
  // graphql upload 需node>8.5才能用
  // 先關閉 等node 升級再打開
  const server = new ApolloServer({ typeDefs, resolvers, context, uploads: false })
  useGraphql = (app) => {
    server.applyMiddleware({ app })
  }
} catch (e) {
  useGraphql = (app) => {
    console.log('Warning!! ...graphql is not exist')
  }
  // console.log('....error')
  // console.log(e)
}
module.exports = { useGraphql }
