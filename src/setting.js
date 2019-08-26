const path = require('path')
const process = require('process')
module.exports = {
  files: [
    {
      id: 'config',
      path: path.resolve('./conf/index.yml'),
      default: {
        name: 'apiserver',
        version: '0.0',
        port: 3138,
        socket: {
          enable: true,
          port: 3139
        },
        cache: {
          enable: false,
          type: 'memcached',
          server: '127.0.0.1',
          port: 11211,
          expSec: 0
        },
        ssl: {
          enable: false,
          port: 443,
          key: './server.key',
          cert: './server.crt',
          requestCert: false,
          rejectUnauthorized: false
        },
        jwt: {
          default: {
            secret: 'Mojava3',
            alg: 'HS256',
            expDays: 7
          }
        }
      }
    },
    {
      id: 'hosts',
      path: path.resolve('./conf/hosts.yml'),
      default: [{
        id: 'dbLocal',
        dbType: 'mysql',
        host: 'localhost',
        port: '3306',
        user: '',
        password: '',
        connectionLimit: 20
      }]
    },
    {
      id: 'routes',
      path: path.resolve('./conf/routes.yml'),
      default: [{
        id: 'sample',
        dir: 'routes/sample',
        ns: 'sample',
        common: 'sample api',
        enable: true
      }]
    }
  ],
  dir: {
    root: process.cwd(), // 整個project根目錄 /ozapi
    bin: __dirname // 執行點的目錄 /ozpai/src 或 /ozapi/dist
  }
}
