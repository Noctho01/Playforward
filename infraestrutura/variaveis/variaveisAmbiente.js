const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: process.env.NODE_ENV === 'win'
    ? path.resolve(__dirname, '.env.win')
    : process.env.NODE_ENV === 'win-pro'
      ? path.resolve(__dirname, '.env.win.pro')
      : process.env.NODE_ENV === 'ubuntu'
        ? path.resolve(__dirname, '.env.ubuntu')
        : process.env.NODE_ENV === 'ubuntu-pro'
          ? path.resolve(__dirname, '.env.ubuntu.pro')
          : null
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
