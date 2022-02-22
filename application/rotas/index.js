const anuncianteRouter = require('./anuncitanteRouter')
const clienteRouter = require('./clienteRouter')
const produtoRouter = require('./produtoRouter')
const swaggerUiRouter = require('./swaggerUiRouter')

module.exports = app => {
	app.use(
		swaggerUiRouter,
		anuncianteRouter,
		clienteRouter,
		produtoRouter
	)
}