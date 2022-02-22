const Autentication = require('../domain/Autentication')
const CreditCard = require('../domain/CreditCard')
const express = require('express')
const server = express()
const PORT = process.env.PORT_API || 3222

// configurando server da api
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.post('/:func', autenticandoCreditCard)

server.listen(PORT, () => {
    console.log(`Server iniciado na porta ${PORT}`)
})


function autenticandoCreditCard(req, res, next) {
    try {
        const { nome, numero, dataVencimento, cvc } = req.body
        const { func } = req.params
        const creditCard = new CreditCard(nome, numero, dataVencimento, cvc)
        const autenticador = new Autentication(creditCard, func)
        const result = autenticador.init()

        return res
            .status(200)
            .json({
                error: result.error,
                message: result.message
            })

    } catch (err) {
        return res
            .json({
                error: true,
                message: err.message
            })
    }

}
