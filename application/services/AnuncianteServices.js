const model = require('../models')
const Anunciante = model.Anunciante
const CustomErrors = require('../errors/customErrors')

module.exports = {

	create: async anunciante => {
		const errors = {}
		const anunciantes = await Anunciante.findAll({
			attributes: ['email', 'cpf']
		})

		if (anunciantes.find(user => user.email === anunciante.email)) errors.email = 'este email já foi cadastrado'
		if (anunciantes.find(user => user.cpf === anunciante.cpf)) errors.cpf = 'este cpf já foi cadastrado'
		if (Object.keys(errors).length > 0) throw new CustomErrors.Conflito(errors)
		const resultCreate = Anunciante.create(anunciante)
		if (!resultCreate) throw new CustomErrors.CreateEntidadeError('Anunciante')
	},

	account: async anuncianteEmail => {
		const anunciante = await Anunciante.findOne({
			where: { email: anuncianteEmail }
		})

		if (!anunciante) throw new CustomErrors.NotFound('Anunciante')
		return anunciante
	},

	update: async (dataToUpdate, anuncianteId) => {
		const errors = {}
		const anunciante = await Anunciante.findByPk(anuncianteId)
		if (!anunciante) throw new CustomErrors.NotFound('Anunciante')

		Object.keys(dataToUpdate).forEach(prop => {
			if (anunciante[prop] === undefined) errors[prop] = 'Este campo não existe'
			anunciante[prop] = dataToUpdate[prop]
		})

		if (Object.keys(errors).length != 0) throw new CustomErrors.Conflito(errors)
		await anunciante.save()
		return anunciante
	},

	delete: async anuncianteId => {
		const resultDelete = await Anunciante.destroy({
			where: { id: anuncianteId }
		})
		
		if (!resultDelete) throw new CustomErrors.Conflito('Está conta não pode ser deletada, conflitos internos')
	},

	getAnunciante: async anuncianteId => {
		const anunciante = await Anunciante.findOne({
			where: { id: anuncianteId },
			attributes: ['nome', 'email', 'pais']	
		})

		if (!anunciante) throw new CustomErrors.NotFound('Anunciante')
		return anunciante
	},

	listAnunciantes: async () => {
		const anunciantes = await Anunciante.findAll({
			attributes: ['id', 'nome', 'email', 'pais']
		})

		if (!anunciantes) throw new CustomErrors.NotFound('Anunciantes')
		return anunciantes
	}
}
