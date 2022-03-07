const CustomErrors = require('../errors/customErrors')
const { Op } = require('sequelize')
const model = require('../models')
const Storage = model.Produtosclientes
const Produto = model.Produtos
const Genero = model.Generos
const Cliente = model.Cliente
const Estado = model.Estadosprodutos
const Carrinho = model.Carrinhosclientes

module.exports = {

	// --------------------------------------------------- Anunciante ----------------------------------------------------------

	announce: async (produto, userId) => {
		produto.anunciante_id = userId
		const generosProduto = []

		if (typeof produto.generos == 'string') {
			produto.generos = produto.generos
				.replace('[','')
				.replace(']','')
				.split(',')
		}

		produto.generos.forEach(item => generosProduto.push({ id: item }))
		delete produto.generos

		const generos = await Genero.findAll({
			where: { [Op.or]: generosProduto }
		})

		const produtoCreated = await Produto.create(produto)
		produtoCreated.addGeneros(generos)
	},

	getProdutosAnunciante: async userId => {
		let produtos = await Produto.findAll({
			where: {
				anunciante_id: userId
			},
			attributes: [
				'id',
				'nome',
				'preco',
				'estoque',
				'descricao'
			],
			include: [
				{
					association: 'anunciante',
					attributes: [['nome', 'anunciante']]
				},
				{
					association: 'plataforma',
					attributes: ['plataforma']
				},
				{
					association: 'classificacao',
					attributes: ['classificacao']
				},
				{
					association: 'generos',
					attributes: ['genero'],
					through: {
						attributes: []
					}
				}
			]
		})

		if (produtos.length === 0) throw new CustomErrors.NotFound('Produto')
		
		produtos = JSON.parse(JSON.stringify(produtos))

		for (const produto of produtos) {
			const generosProduto = []
			produto.generos.forEach(genero => generosProduto.push(genero.genero))
			produto.generos = generosProduto
			produto.anunciante = produto.anunciante.anunciante
			produto.plataforma = produto.plataforma.plataforma
			produto.classificacao = produto.classificacao.classificacao
		}

		return produtos
	},

	update: async (bodyUpdate, produtoId) => {
		const errors = {}
		let generosProduto = []
		const produto = await Produto.findByPk(produtoId, {
			include: {
				association: 'generos',
				through: {
					attributes: []
				}
			}
		})

		if (!produto) throw new CustomErrors.NotFound('Produto')

		Object.keys(bodyUpdate).forEach(chave => {
			if (chave === 'generos') {
				generosProduto = typeof bodyUpdate[chave] === 'array'
					? bodyUpdate[chave]
					: bodyUpdate[chave]
						.replace('[','')
						.replace(']','')
						.split(',')
				delete bodyUpdate[chave]
			}
			else if (produto[chave] === undefined) {
				errors[chave] = 'Este campo não existe'
			}
			else {
				produto[chave] = bodyUpdate[chave]
			}
		})

		if (Object.keys(errors).length > 0) throw new CustomErrors.Conflito(errors)
		if (generosProduto.length > 0) produto.setGeneros(generosProduto)

		await produto.save()
	},

	delete: async (produtoId, userId) => {
		const produto = await Produto.findOne({
			where: {
				id: produtoId,
				anunciante_id: userId
			},
			include: {
				association: 'generos'
			}
		})
		if (!produto) throw new CustomErrors.NotFound('Produto')

		produto.removeGeneros(produto.generos)

		try {
			await produto.destroy() 
			await Carrinho.destroy({ where: { produto_id: produtoId }})
			await Storage.destroy({ where: { produto_id: produtoId }})
		}
		catch (err) {
			throw new CustomErrors.Conflito(err.message)
		}
	},

	getSolicitations: async userId => {
		let idsProdutos = []

		// colegar os ids dos produtos do anunciante
		const produtos = await Produto.findAll({
			where: { anunciante_id: userId },
			attributes: ['id']
		})

		if (produtos.length === 0) throw new CustomErrors.Conflito('Voce não tem produtos anunciados')
		produtos.forEach(produto =>  idsProdutos.push(produto.id))

		// colegar em storage associacoes com os ids dos produtos
		let associacoes = await Storage.findAll({
			where: {
				produto_id: {
					[Op.or]: idsProdutos
				}
			},
			attributes: [
				'id',
				'quantidade',
				'valor_total',
				'forma_pagamento'
			],
			include: [
				{
					association: 'produto',
					attributes: ['nome', 'estoque']
				},
				{
					association: 'estado',
					attributes: ['nome']
				}
			]
	
		})

		if (associacoes.length === 0) throw new CustomErrors.Conflito('Nenhum pedido foi feito')
		
		associacoes = JSON.parse(JSON.stringify(associacoes))

		for (const associacao of associacoes) {
			associacao['estoque pos venda'] = associacao.produto.estoque
			associacao.produto = associacao.produto.nome
			associacao.estado = associacao.estado.nome
		}

		return associacoes
	},

	setSolicitation: async (associacaoId, userId, estadoId) => {
		let idsProdutos = []

		// buscando produtos associados ao usuario para termos seus ids
		const produtos = await Produto.findAll({
			where: { anunciante_id: userId },
			attributes: ['id']
		})

		if (produtos.length === 0) throw new CustomErrors.Conflito('VVoce não tem produtos anunciados')

		produtos.forEach(produto => idsProdutos.push(produto.id))

		// buscando associacao especifica por id que tenha como autenticacao um dos ids do anunciante
		const associacao = await Storage.findOne({
			where: {		
				id: associacaoId,
				produto_id: {
					[Op.or]: idsProdutos
				}
			}
		})

		if (!associacao) throw new CustomErrors.NotFound('Nenhum pedido foi feito')

		// buscando tipos de estados baseado no id do produto
		const estado = await Estado.findByPk(estadoId)
		if (!estado) throw new CustomErrors.Conflito('Informe um id de estado valido')

		// alterando estado atual do pedido
		associacao.estado_atual_id = estadoId
		await associacao.save()
	},


	// ------------------------------------------------------ Global -------------------------------------------------------------

	catalog: async () => {
		const produtos = await Produto.findAll({
			where: {
				estoque: {
					[Op.gt]: 0
				}
			},
			attributes: [
				'id',
				'nome',
				'preco',
				'estoque'
			],
			include: {
				association: 'plataforma',
				attributes: ['plataforma']
			}
		})

		if (!produtos) throw new CustomErrors.NotFound('Produtos')

		const produtoParser = JSON.parse(JSON.stringify(produtos))

		for (const i in produtoParser) {
			produtoParser[i].plataforma = produtoParser[i].plataforma.plataforma
		}

		return produtoParser
	},

	searchProdutos: async query => {
		const produtos = await Produto.findAll({
			where: [{
				estoque: {
					[Op.gt]: 0
				}},
				query
			],
			attributes: [
				'id',
				'nome',
				'preco',
				'estoque'
			],
			include: {
				association: 'plataforma',
				attributes: ['plataforma']
			}
		})

		if (!produtos) throw new CustomErrors.NotFound('Produtos')

		const produtoParser = JSON.parse(JSON.stringify(produtos))

		for (const i in produtoParser) {
			produtoParser[i].plataforma = produtoParser[i].plataforma.plataforma
		}

		return produtoParser
	},

	getProduto: async produtoId => {
		let produto = await Produto.findByPk(produtoId, {
			attributes: [
				'id',
				'nome',
				'preco',
				'estoque',
				'descricao'
			],
			include: [
				{
					association: 'anunciante',
					attributes: [['nome', 'anunciante']]
				},
				{
					association: 'plataforma',
					attributes: ['plataforma']
				},
				{
					association: 'classificacao',
					attributes: ['classificacao']
				},
				{
					association: 'generos',
					attributes: ['genero'],
					through: { attributes: [] }
				}
			]
		})

		
		if (!produto) throw new CustomErrors.NotFound('Produto')
		
		produto = JSON.parse(JSON.stringify(produto))

		const generosProduto = []
		produto.generos.forEach(genero => generosProduto.push(genero.genero))
		produto.generos = generosProduto
		produto.anunciante = produto.anunciante.anunciante
		produto.plataforma = produto.plataforma.plataforma
		produto.classificacao = produto.classificacao.classificacao
		
		return produto
	}
}
