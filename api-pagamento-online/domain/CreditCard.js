const { createHmac } = require('crypto')
const secret = 'fd654gd6f5g4dfg87'

module.exports = class CreditCard {

    /* constructor props
        @nome: String
        @numero: String
        @dataVencimento: String
        @cvc: String
    */

    constructor(nome, numero, dataVencimento, cvc) {
        this._nome = nome,
        this._numero = numero,
        this._dataVencimento = dataVencimento,
        this._cvc = createHmac('sha256', secret)
            .update(cvc)
            .digest('hex')
    }

    get nome() {
        return this._nome
    }

    get numero() {
        return this._numero
    }

    get dataVencimento() {
        return this._dataVencimento
    }
}