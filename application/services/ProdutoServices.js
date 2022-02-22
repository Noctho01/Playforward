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
	},


	// -------------------------------------------------- Carrinho Cliente ---------------------------------------------------------

	addProdutoCarrinho: async (quantidade, produtoId, userId) => {
		const produto = await Produto.findByPk(produtoId)
		const cliente = await Cliente.findByPk(userId)

		if (!produto) throw new CustomErrors.NotFound('Produto')
		if (!cliente) throw new CustomErrors.NotFound('Cliente')
		if (produto.estoque < quantidade) throw new CustomErrors.Conflito('Não ha produtos suficientes')

		await produto.addCarrinho(cliente)
		await Carrinho.update({ quantidade: quantidade },{
			where: {
				produto_id: produtoId,
				cliente_id: userId
			}
		})
	},

	getCarrinho: async userId => {
		let carrinhoUsuario = await Cliente.findByPk(userId, {
			attributes: [],
			include: {
				association: 'carrinho',
				through: {
					as: 'quantidade',
					attributes: ['quantidade']
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
			}
		})

		if (!carrinhoUsuario) throw new CustomErrors.NotFound('Cliente')

		carrinhoUsuario = JSON.parse(JSON.stringify(carrinhoUsuario))

		for (const produto of carrinhoUsuario.carrinho) {
			produto.quantidade = produto.quantidade.quantidade
			produto.plataforma = produto.plataforma.plataforma
		}

		return carrinhoUsuario.carrinho.length === 0
			? "carrinho vazio"
			: carrinhoUsuario.carrinho
	},

	updateProdutoCarrinho: async (body, produtoId, userId) => {
		const carrinho = await Carrinho.findOne({
			where: {
				produto_id: produtoId,
				cliente_id: userId
			}
		})
		const produto = await Produto.findByPk(produtoId, {
			attributes: ['estoque']
		})

		if (!carrinho) throw new CustomErrors.NotFound('Produto no carrinho')
		if (!produto) throw new CustomErrors.NotFound('Produto')
		if (produto.estoque < body.quantidade) throw new CustomErrors.Conflito('Este produto não possui essa quantidade solicitada')
		if (body.quantidade <= 0) throw new CustomErrors.Conflito('Informe um valor maior que 0 ou igual ou menor que o numero em estoque do produto')

		carrinho.quantidade = body.quantidade
		await carrinho.save()
	},

	deleteProdutoCarrinho: async (idsProdutos, userId) => {
		let ids = typeof produtoId === 'object'
			? idsProdutos
			: [idsProdutos]

		const produtosCarrinho = await Carrinho.findAll({
			where: {
				produto_id: {
					[Op.or]: ids
				},
				cliente_id: userId
			}
		})

		if (produtosCarrinho.length === 0) throw new CustomErrors.NotFound('Produto')

		for (let i = 0; i < produtosCarrinho.length; i++) {
			await produtosCarrinho[i].destroy()
		}
	},


	// ----------------------------------------- Processo de Compra -----------------------------------------------------------------

	reviewProdutos: async userId => {
		let idsProdutosCarrinho = []
		let idsProdutosEncontrados = []
		let notOk = []

		// Buscando carrinho do cliente userID
		const carrinho = await Carrinho.findAll({
			where: { cliente_id: userId },
			attributes: [ 'produto_id', 'quantidade' ]
			
		})

		if (carrinho.length === 0) throw new CustomErrors.Conflito('Carrinho está vazio')
		// pegando o id de cada produto no carrinho do cliente
		for (produto of carrinho) {
			idsProdutosCarrinho.push(produto.produto_id)
		}
		// Buscando produtos que estejam no carrinho do cliente
		const produtos = await Produto.findAll({
			attributes: ['id', 'nome', 'estoque', 'preco'],
			where: { id: { [Op.or]: idsProdutosCarrinho }}
		})		
		// Ver se todos os produtos estão presentes
		for (produto of produtos) {
			idsProdutosEncontrados.push(produto.id)
		}
		for (val of idsProdutosCarrinho) {
			if (idsProdutosEncontrados.indexOf(val) === -1) {
				throw new CustomErrors.Conflito('Algum produto do seu carrinho não está mais disponivel no estoque, revisei seu pedido porfavor.')
			}
		}
		carrinho.forEach(produtoCarrinho => {
			produtos.forEach(produto => {
				if (produtoCarrinho.produto_id === produto.id) {
					if (produto.estoque < produtoCarrinho.quantidade) {
						notOk.push(`${produtoCarrinho.quantidade} unidade(s) de ${produto.nome} não estam disponiveis em estoque`)
					}
				}
			})
		})

		if (notOk.length != 0) throw new CustomErrors.Conflito(notOk)

		return { carrinho, produtos }
	},

	generatePaymentSlip: async (dadosProdutos, userId, nome_cartao) => {
		const { carrinho } = dadosProdutos
		const { produtos } = dadosProdutos
		const infoProdutos = []
		let valorTotal = 0

		const cliente = await Cliente.findByPk(userId, {
			attributes: ['nome']
		})

		if (!cliente) throw new CustomErrors.NotFound('Cliente')

		carrinho.forEach(produtoCarrinho => {
			produtos.forEach(produto => {
				if (produtoCarrinho.produto_id === produto.id) {
					// somando valor total
					valorTotal += produtoCarrinho.quantidade * produto.preco

					// pegando informaçoes sobre os produtos
					infoProdutos.push({
						id: produto.id,
						nome: produto.nome,
						preco: produto.preco,
						quantidade: produtoCarrinho.quantidade,
						em_estoque: parseInt(produto.estoque) - parseInt(produtoCarrinho.quantidade)
					})
				}
			})
		})

		return {
			paymentSlip: {
				cliente: cliente.nome,
				nome_cartao: nome_cartao,
				valor_total: parseFloat(valorTotal.toFixed(2))
			},
			produtos: infoProdutos
		}
	},

	setClienteProdutos: async (produtos, userId, formaPagamento) => {
		produtos.forEach(async produto => {
			const associacao = {
				produto_id: produto.id,
				cliente_id: userId,
				valor_total: produto.preco * produto.quantidade,
				quantidade: produto.quantidade,
				forma_pagamento: formaPagamento,
				estado_atual_id: 1,
			}
			const produtoCliente = await Storage.create(associacao)
			if (!(produtoCliente instanceof Storage)) throw new CustomErrors.CreateEntidadeError('Associação entre Cliente e Produto')
		})
	},

	getClienteProdutos: async userId => {
		let associacoes = await Storage.findAll({
			where: { cliente_id: userId },
			attributes: [
				'id',
				'quantidade',
				'valor_total',
				'forma_pagamento'
			],
			include: [
				{
					association: 'produto',
					attributes: ['nome']
				},
				{
					association: 'estado',
					attributes: ['nome']
				}
			]
		})

		if (associacoes.length === 0) throw new CustomErrors.Conflito('Voce ainda não comprou nenhum produto')

		associacoes = JSON.parse(JSON.stringify(associacoes))

		for (const associacao of associacoes) {
			associacao.produto = associacao.produto.nome
			associacao.estado = associacao.estado.nome 
		}

		return associacoes
	}
}
