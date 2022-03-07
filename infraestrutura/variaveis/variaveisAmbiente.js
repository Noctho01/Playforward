const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: process.env.NODE_ENV === 'dev'
    ? path.resolve(__dirname, '.env.dev')
    : path.resolve(__dirname, '.env.pro')
})


module.exports = {
  database: {
    username: process.env.USER_NAME,
    password: process.env.PSW_DB,
    database: process.env.NAME_DB,
    host: process.env.HOST_DB,
    dialect: process.env.DIALECT,
    port: process.env.PORT_DB,
    define: { timestamps: false }
  },
  security: {
    port: process.env.ENV_ALEATORIA || process.env.PORT,
    token: process.env.TOKEN_SECRET,
    crypto: process.env.HASHE_SECRET
  }
}
