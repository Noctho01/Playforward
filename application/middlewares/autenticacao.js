const customErrors = require('../errors/customErrors.js')
const anuncianteServices = require('../services/AnuncianteServices')
const clienteServices = require('../services/ClienteServices')
const secret = require('../../infraestrutura/variaveis/variaveisAmbiente').security.crypto
const { createHmac } = require('crypto')

/*
	Function Autenticação
*/

module.exports = async (req, res, next) => {
	const path = req.path
	const body = req.body
	const type = path.split('/')[1]

	const { id, email, senha } = (path === '/cliente/login')
		? await clienteServices.account(body.email)
		: await anuncianteServices.account(body.email)

	body.senha = createHmac('sha256', secret)
		.update(body.senha)
		.digest('hex')

	if (email != body.email) {
		throw new customErrors.UserInvalido()
	} else if (senha != body.senha) {
		throw new customErrors.SenhaIncorreta()
	}

	delete body.senha
	req.user = { id: id, email: email, type: type }
	return next()
}
