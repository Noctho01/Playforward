const Autentication = require('./Autentication')
const CreditCard = require('./CreditCard')

describe('Verificando de autenticador funciona', () => {
    const creditCard = new CreditCard(
        /* nome */              'Vinicius dos Santos Rodrigues',
        /* numero */            '2020121236',
        /* dataVencimento */    Date.now(),
        /* csv */               '767'
    )
    const autentication = new Autentication(creditCard, 5)

    test('testando se objeto é criado', () => {
        expect(autentication.init()).toBeTruthy()
    })

    test('testando erros de checkFunc', () => {
        expect(() => Autentication.checkFunc(8)).toThrowError('func invalida')
    })
})

    