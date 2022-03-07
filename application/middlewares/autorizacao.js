const { TipoUsuario } = require('../errors/customErrors')
const { ValidateTokenOAuth } = require('../services/oAuth')

/*
	Function Autorizacao
*/

module.exports = (req, res, next) => {
	const token = req.cookies['Authorization']
	const tokenValido = new ValidateTokenOAuth(token, 'Anunciante')
	req.user = tokenValido.payload
	console.log(req.user)
	return next()
}
