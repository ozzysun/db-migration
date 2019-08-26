
const http = require('http')
const Server = require('socket.io')
const path = require('path')
const client = require('socket.io-client')
const express = require('express')
// const moment = require('moment')
// const _  = require('lodash')

class Socket {
  constructor(name, app) {
    this.name = name
    this.app = app
    this.init()
  }
  init() {
    this.http = http.Server(this.app)
    this.defaultRoom = 'all'
    const opts = {
      pingTimeout: 60000, // 100秒timeout
      pingInterval: 25000, // 與client ping pong的時間距離
      serveClient: true,
      transports: ['polling', 'websocket']
    }
    this.io = new Server(this.http, opts)
  }
  listen(port = 3139, room = 'all', callback = null) {
    this.http.listen(port, () => {
      console.log(`socket listening on :${port}`)
    })
  }
}
module.exports = Socket
