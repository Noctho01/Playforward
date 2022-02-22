const anuncianteServices = require('../services/AnuncianteServices')
const { CreateTokenOAuth } = require('../services/oAuth')

module.exports = {

	login: (req, res) => {
		const { user } = req
		const jwt = new CreateTokenOAuth(user)
		return res
			.status(200)
			.cookie('Authorization', 'Bearer ' + jwt.token)
			.json({
				status: 'Ok',
				message: 'connected'
			})
	},

	logout: (req, res) => {
		return res
			.status(200)
			.clearCookie('Authorization')
			.json({
				status: 'Ok',
				message: 'disconnected'
			})
	},

	create: async (req, res) => {
		const anuncianteData = req.body
		await anuncianteServices.create(anuncianteData)
		return res
			.status(201)
			.json({
				status: 'Ok',
				message: 'created'
			})
	},

	account: async (req, res) => {
		const anuncianteEmail = req.user.email
		const anunciante = await anuncianteServices.account(anuncianteEmail)
		anunciante.senha = undefined
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'accessed',
				data: anunciante
			})
	},

	update: async (req, res) => {
		const { body: dataToUpdate } = req
		const { id: anuncianteId } = req.user
		const anunciante = await anuncianteServices.update(dataToUpdate, anuncianteId)
		
		if (dataToUpdate.email) {
			const jwt = new CreateTokenOAuth({
				id: anunciante.id,
				email: anunciante.email
			})
			
			res.cookie('Authorization', 'Bearer ' + jwt.token)
		}

		return res
			.status(201)
			.json({
				status: 'Ok',
				message: 'updated'
			})
	},

	delete: async (req, res) => {
		const { id: anuncianteId } = req.user
		await anuncianteServices.delete(anuncianteId)
		return res
			.status(202)
			.json({
				status: 'Ok',
				message: 'deleted'
			})
	},

	getAnunciante: async (req, res) => {
		const { id: anuncianteId } = req.params
		const anunciante = await anuncianteServices.getAnunciante(anuncianteId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: anunciante
			})
	},

	listAnunciantes: async (req, res) => {
		const anunciantes = await anuncianteServices.listAnunciantes()
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: anunciantes
			})
	}
}
