const Validator = require('validatorjs')
const ValidaCpf = require('./validaCpf')
const secret = require('../../infraestrutura/variaveis/variaveisAmbiente').security.crypto
const { ValidationError } = require('../errors/customErrors')
const { createHmac } = require('crypto')

module.exports = (req, res, next) => {
	let errors = {}
	const userData = req.body
	const scheme = {
		nome: ['required', 'string', 'min:5', 'max:50'],
		cpf: ['required', 'string'],
		email: ['required', 'email'],
		senha: ['required', 'string', 'min:8', 'max:20'],
		numero_telefone: 'digits_between:11,12',
		data_nascimento: ['required', 'date'],
		cep: ['required', 'digits_between:8,8'],
		pais: ['required', 'string'],
		estado: 'string',
		cidade: 'string',
		complemento: ['required', 'string'],
	}

	scheme.carteira_virtual = 'string'

	Validator.useLang('pt')
	const resultadoValidação = new Validator(userData, scheme)
	resultadoValidação.passes()

	if (Object.keys(resultadoValidação.errors.all()).length !== 0) errors = resultadoValidação.errors.all()

	// Validando CPF
	if (!errors.cpf) {
		if (!ValidaCpf(userData.cpf)) errors.cpf = { message: 'cpf invalido' }
	}

	switch (Object.keys(errors).length > 0) {
		case true:
			throw new ValidationError(errors)
		case false:
			req.body.senha = createHmac('sha256', secret)
				.update(userData.senha)
				.digest('hex')
			next()
	}
}
