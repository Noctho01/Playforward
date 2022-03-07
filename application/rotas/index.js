const anuncianteRouter = require('./anuncitanteRouter')
const produtoRouter = require('./produtoRouter')

module.exports = app => {
	app.use(
		anuncianteRouter,
		produtoRouter
	)
}