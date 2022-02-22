const express = require('express')
const config = require('./configServer')
const routes = require('../application/rotas')
const corsMiddleware = require('../application/middlewares/corsMiddleware')
const errorMiddleware = require('../application/middlewares/errorMiddleware')
const initLog = require('../logs/initLogs')

const app = express()

// configurando app
config(app, express)
initLog('config server')

// configurando cors
corsMiddleware(app)
initLog('set corsMiddleware in server')

// chamando rotas
routes(app)
initLog('set routes in server')

// middleware de erro
errorMiddleware(app)
initLog('set errorMiddleware in server')

module.exports = app
