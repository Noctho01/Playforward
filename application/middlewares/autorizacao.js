const { TipoUsuario } = require('../errors/customErrors')
const { ValidateTokenOAuth } = require('../services/oAuth')

/*
	Function Autorizacao
*/

module.exports = (req, res, next) => {
	const path = req.path
	const type = path.split('/')[1]
	const token = req.cookies['Authorization']
	const tokenValido = new ValidateTokenOAuth(token, type)

	if (tokenValido.payload.type != type) throw new TipoUsuario(type)

	req.user = tokenValido.payload
	return next()
}
