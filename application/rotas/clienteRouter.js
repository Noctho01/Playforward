const { Router } = require('express')
const resolver = require('../errors/resolver')
const clienteController = require('../controllers/clienteController')
const middleware = require('../middlewares')

const router = new Router()

/* CRUD */
router
	.post('/cliente', middleware.validacao, resolver(clienteController.create)) 		// criar Cliente
	.get('/cliente', middleware.autorizacao, resolver(clienteController.account)) 		// ver dados Cliente
	.get('/sistema/cliente/:id', resolver(clienteController.getCliente)) 						// ver dados Cliente especifico
	.get('/sistema/clientes', resolver(clienteController.listClientes))							// ver lista de Clientes
	.put('/cliente', middleware.autorizacao, resolver(clienteController.update)) 		// atualizar dados do Cliente
	.delete('/cliente', middleware.autorizacao, resolver(clienteController.delete)) 	// deletar Cliente

/* LOGIN AUTENTICAÇÃO */
router
	.post('/login/cliente', resolver(middleware.autenticacao), resolver(clienteController.login))	// autenticação e login (gera token JWT) do Cliente
	.delete('/logout/cliente', middleware.autorizacao, resolver(clienteController.logout))			// logout do Cliente

module.exports = router
