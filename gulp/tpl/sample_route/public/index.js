const RouteClass = require('../../../core/RouteClass')
class Route extends RouteClass {
  routes() {
    this.get('hello', (req, res) => {
      this.json(res, req.config)
    })
  }
}
module.exports = Route
