const { UserInvalido, SenhaIncorreta } = require('../errors/customErrors.js')
const anuncianteServices = require('../services/AnuncianteServices')
const secret = require('../../infraestrutura/variaveis/variaveisAmbiente').security.crypto
const { createHmac } = require('crypto')

/*
	Function Autenticação
*/

module.exports = async (req, res, next) => {
	const body = req.body

	const { id, email, senha } = await anuncianteServices.account(body.email)

	body.senha = createHmac('sha256', secret)
		.update(body.senha)
		.digest('hex')

	if (email != body.email) {
		throw new UserInvalido()
	} else if (senha != body.senha) {
		throw new SenhaIncorreta()
	}

	delete body.senha
	req.user = { id: id, email: email}
	console.log(req.user)
	return next()
}
