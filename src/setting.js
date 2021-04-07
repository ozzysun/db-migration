const path = require('path')
const process = require('process')
module.exports = {
  files: [
    {
      id: 'config',
      path: path.resolve('./conf/index.yml'),
      default: {
        name: 'dbmigration',
        version: '0.0',
        port: 3138,
        socket: {
          enable: true,
          port: 3139
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
      },
      {
        id: 'migration',
        dir: 'routes/migration',
        ns: 'migration',
        common: 'migration api',
        enable: true
      }]
    }
  ],
  dir: {
    root: process.cwd(), // 整個project根目錄 /ozapi
    bin: __dirname // 執行點的目錄 /ozpai/src 或 /ozapi/dist
  }
}
