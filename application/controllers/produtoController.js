const produtoServices = require('../services/ProdutoServices')

module.exports = {

	// ----------------------------------------------- Serviços Anunciante -------------------------------------------------

	announce: async (req, res) => {
		const userId = req.user.id
		const produtoData = req.body
		await produtoServices.announce(produtoData, userId)
		return res
		.status(201)
		.json({
			status: 'Ok',
			message: 'announced'
		})
	},

	getProdutosAnunciante: async (req, res) => {
		const userId = req.user.id
		const produto = await produtoServices.getProdutosAnunciante(userId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: produto
			})
	},

	update: async (req, res) => {
		const produtoId = req.params.produtoId
		const userId = req.user.id
		const dataToUpdate = req.body
		await produtoServices.update(dataToUpdate, produtoId, userId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'updeted'
			})
	},

	delete: async (req, res) => {
		const produtoId = req.params.id
		const userId = req.user.id
		await produtoServices.delete(produtoId, userId)
		return res
			.status(201)
			.json({
				status: 'Ok',
				message: 'deleted'
			})
	},

	catalog: async (req, res) => {
		const produtos = await produtoServices.catalog()
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: produtos
			})
	},

	searchProdutos: async (req, res) => {
		const query = req.query
		const produtos = await produtoServices.searchProdutos(query)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: produtos
			})
	},

	getProduto: async (req, res) => {
		const produtoId = req.params.id
		const produto = await produtoServices.getProduto(produtoId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: produto
			})
	},

	getSolicitations: async (req, res) => {
		const userId = req.user.id
		const clienteSolicitations = await produtoServices.getSolicitations(userId)
		return res
			.status(200)
			.json({
				status: "Ok",
				message: 'geted',
				data: clienteSolicitations
			})
	},

	setSolicitation: async (req, res) => {
		const userId = req.user.id
		const { pedidoId } = req.params
		const estadoId = req.body.response
		await produtoServices.setSolicitation(pedidoId, userId, estadoId)
		return res
			.status(200)
			.json({
				status: "Ok",
				message: 'answered'
			})
	}
}
