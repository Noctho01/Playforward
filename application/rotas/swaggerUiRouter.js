const { Router } = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerUiDocument = require('./swaggerDoc.json')

const swaggerUiOptions = {
    
}

const router = new Router()

router
    .use('/v1/api-doc', swaggerUi.serve)
    .get('/v1/api-doc', swaggerUi.setup(swaggerUiDocument))

module.exports = router