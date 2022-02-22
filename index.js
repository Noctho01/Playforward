const server = require('./infraestrutura/server')
const PORT = require('./infraestrutura/variaveis/variaveisAmbiente').security.port

server.listen(PORT, () => {
  console.log('Servidor iniciado na porta: ' + PORT)
})
