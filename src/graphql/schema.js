module.exports = `
type Query {
  hello(name:String): String,
  oz: String,
  vuebms(host:String, db:String, table:String!): [User!]!
}
type User {
  SITE: String,
  COMP_NAME: String,
  COMP_CODE: String
}
`
