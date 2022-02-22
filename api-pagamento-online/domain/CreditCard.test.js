const CreditCard = require('./CreditCard')

test('instanciando cartão de credito', () => {
    
    const creditCard = new CreditCard(
        /* nome */              'Vinicius dos Santos Rodrigues',
        /* numero */            '2020121236',
        /* dataVencimento */    Date.now(),
        /* csv */               '767'
    )

    expect(creditCard._csv).toBeTruthy()
})