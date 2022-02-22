const { Router } = require('express')
const produtoController = require('../controllers/produtoController')
const resolver = require('../errors/resolver')
const middleware = require('../middlewares')

const router = new Router()

/* SERVIÇOS GLOBAIS */
router
	.get('/catalogo', resolver(produtoController.catalog))
	.get('/buscar/produtos', resolver(produtoController.searchProdutos))
	.get('/produto/:id', resolver(produtoController.getProduto))

/* SERVIÇOS ANUNCIANTE */
router
	.post('/anunciante/produto', middleware.autorizacao, resolver(produtoController.announce))
	.get('/anunciante/produtos', middleware.autorizacao, resolver(produtoController.getProdutosAnunciante))
	.put('/anunciante/produto/:produtoId', middleware.autorizacao, resolver(produtoController.update))
	.delete('/anunciante/produto/:produtoId', middleware.autorizacao, resolver(produtoController.delete))
	.get('/anunciante/pedidos', middleware.autorizacao, resolver(produtoController.getSolicitations))
	.put('/anunciante/pedido/:pedidoId', middleware.autorizacao, resolver(produtoController.setSolicitation))

/* SERVIÇOS CLIENTE */
router
	.post('/cliente/carrinho/:produtoId', middleware.autorizacao, resolver(produtoController.addProdutoCarrinho))
	.get('/cliente/carrinho', middleware.autorizacao, resolver(produtoController.getCarrinho))
	.get('/cliente/carrinho/extrato', middleware.autorizacao, resolver(produtoController.previsionPaymentSlip))
	.put('/cliente/carrinho/:produtoId', middleware.autorizacao, resolver(produtoController.updateProdutoCarrinho))
	.delete('/cliente/carrinho/:produtoId', middleware.autorizacao, resolver(produtoController.deleteProdutoCarrinho))
	.post('/cliente/carrinho/solicitar/:func', middleware.autorizacao, resolver(produtoController.buyProcessProdutos))
	.get('/cliente/produtos', middleware.autorizacao, resolver(produtoController.getClienteProdutos))


module.exports = router
