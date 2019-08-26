const RouteClass = require('../../../core/RouteClass')
class Route extends RouteClass {
  routes() {
    this.get('text', (req, res) => {
      res.send(`s-text`)
    })
    this.get('json', (req, res) => {
      this.json(res, { id: 's-test', content: 's-json' })
    })
  }
}
module.exports = Route
