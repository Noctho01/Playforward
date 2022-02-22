const axios = require('axios')
const produtoServices = require('../services/ProdutoServices')
const CustomErrors = require('../errors/customErrors')

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
	},

	// ----------------------------------------------- Carrinho Cliente ------------------------------------------------------

	addProdutoCarrinho: async (req, res) => {
		const userId = req.user.id
		const { quantidade } = req.body
		const { produtoId } = req.params
		await produtoServices.addProdutoCarrinho(quantidade, produtoId, userId)
		return res
			.status(201)
			.json({
				status: 'Ok',
				message: 'added'
			})
	},

	getCarrinho: async (req, res) => {
		const userId = req.user.id
		const carrinho = await produtoServices.getCarrinho(userId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'geted',
				data: carrinho
			})
	},

	updateProdutoCarrinho: async (req, res) => {
		const userId = req.user.id
		const dataToUpdate = req.body
		const { produtoId } = req.params
		await produtoServices.updateProdutoCarrinho(dataToUpdate, produtoId, userId)
		return res
			.status(200)
			.json({
				status: 'Ok',
				message: 'updated'
			})
	},

	deleteProdutoCarrinho: async (req, res) => {
		const userId = req.user.id
		const { produtoId } = req.params
		await produtoServices.deleteProdutoCarrinho(produtoId, userId)
		return res
			.status(201)
			.json({
				status: 'Ok',
				message: 'deleted'
			})
	},


	// ----------------------------------------------- Comprar Produto ---------------------------------------------------------
	 previsionPaymentSlip: async (req, res) => {
		const userId = req.user.id
		const resultAnalise = await produtoServices.reviewProdutos(userId)
		const { paymentSlip, produtos } = await produtoServices.generatePaymentSlip(resultAnalise, userId)
		delete paymentSlip.nome_cartao

		produtos.forEach(produto => {
			delete produto.id
			delete produto.em_estoque
		})

		return res
			.status(200)
			.json({
				status: "Ok",
				paymentSlip,
				produtos
			})
	},

	buyProcessProdutos: async (req, res) => {
		const userId = req.user.id
		const { func } = req.params

		const configAxios = {
			method: 'post',
			url: process.env.API_PAGAMENTO + "" + func || `http://localhost:3222/${func}`,
			data: {
				nome: req.body.nome,
				numero: req.body.numero,
				dataVencimento: req.body.dataVencimento,
				cvc: req.body.cvc
			}
		}

		const resultAnalise = await produtoServices.reviewProdutos(userId)
		const { extrato, produtos} = await produtoServices.generatePaymentSlip(resultAnalise, userId, req.body.nome)
		
		// consumindo api de pagamento de boleto
		const resultadoPagamento = await axios(configAxios)

		if (resultadoPagamento.data.error) {
			throw new CustomErrors.ValidationError(resultadoPagamento.data.message)
		}

		const idsProdutos = []
		for (const produto of produtos) {
			idsProdutos.push(produto.id)
		}
	
		// update Clienteprodutos
		await produtoServices.setClienteProdutos(produtos, userId, 'CreditCard')

		// update Produtos
		for (const produto of produtos) {
			await produtoServices.update({ estoque: produto.em_estoque } , produto.id)
		}

		// apagar produto do carrinho
		await produtoServices.deleteProdutoCarrinho(idsProdutos, userId)
		
		return res
		.status(200)
		.json({
			status: "Ok",
			message: {
				pagamento: "Aprovado",
				extrato
			}
		})
	},

	getClienteProdutos: async (req, res) => {
		const userId = req.user.id
		const produtos = await produtoServices.getClienteProdutos(userId)	
		return res
			.status(200)
			.json({
				status: "Ok",
				produtos
			})
	}
}
