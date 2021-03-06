const { Router } = require('express')
const resolver = require('../errors/resolver')
const anuncianteController = require('../controllers/anuncianteController')
const middleware = require('../middlewares')

const router = new Router()

/* CRUD */
router
	.post('/anunciante', middleware.validacao, resolver(anuncianteController.create))     // criar Anunciante
	.get('/anunciante', middleware.autorizacao, resolver(anuncianteController.account))   // ver dados Anunciante
	.get('/anunciantes/:id', resolver(anuncianteController.getAnunciante))                 // ver dados Anunciante especifico
	.get('/anunciantes', resolver(anuncianteController.listAnunciantes))                  // ver lista de Anunciantes
	.put('/anunciante', middleware.autorizacao, resolver(anuncianteController.update))    // atualizar dados do Anunciante
	.delete('/anunciante',middleware.autorizacao, resolver(anuncianteController.delete))  // deletar Anunciante

/* LOGIN AUTENTICAÇÃO */
router
	.post('/login/anunciante', resolver(middleware.autenticacao), resolver(anuncianteController.login))   // autenticação e login (gera token JWT) do Anunciante
	.delete('/logout/anunciante', middleware.autorizacao, resolver(anuncianteController.logout))          // logout do Anunciante

module.exports = router
