const CreditCard = require('./CreditCard')

module.exports = class Autentication {

    /* constructor props
        @creditCard: 'Object'
        @func: 'Inter'
    */
    constructor(creditCard, func) {
        this._creditCard = creditCard
        this._func = parseInt(func)
    }

    init() {
        Autentication.checkCreditCard(this._creditCard)
        Autentication.checkFunc(this._func)

        switch(this._func) {
            case 0 :
                return {
                    error: false,
                    message: 'aprovado'
                }
            case 1 :
                return {
                    error: true,
                    message: `${this._creditCard.nome} não é um nome valido`
                }
            case 2 :
                return {
                    error: true,
                    message: `o numero ${this._creditCard.numero} não é valido`
                }
            case 3 :
                return {
                    error: true,
                    message: `${this._creditCard.dataVencimento} não é a data correta`
                }
            case 4 :
                return {
                    error: true,
                    message: `cvc invalido`
                }
            case 5 :
                return {
                    error: true,
                    message: 'Sem saldo na conta'
                }
            case 6 :
                return {
                    error: true,
                    message: 'Sem limite disponivel'
                }
        }
    }

    static checkCreditCard(creditCard) {
        if (!(creditCard instanceof CreditCard)) {
            throw new Error('creditCard não é uma instancia de CreditCard')

        } else if (creditCard === undefined) {
            throw new Error('creditCard não foi definida')

        } else if (creditCard === null) {
            throw new Error('creditCard não foi atribuido e resultou em null')
        }
    }

    static checkFunc(func) {
        const typeFuncs = [
            0, // aprovado
            1, // nome invalido
            2, // numero invalido
            3, // data invalida
            4, // csv invalido
            5, // sem saldo na conta
            6, // sem limite na conta
        ]

        if (func === null) {
            throw new Error('func não foi atribuida e resultou em null')

        } else if (func === undefined) {
            throw new Error('func indefinida')

        } else if (typeFuncs.indexOf(func) === -1) {
            throw new Error('func invalida')
        }
    }
}