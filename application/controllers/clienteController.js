const clienteService = require('../services/ClienteServices')
const { CreateTokenOAuth } = require('../services/oAuth')

module.exports = {

    login: (req, res) => {
        const { user } = req
        const jwt = new CreateTokenOAuth(user)
        return res
            .status(200)
            .cookie('Authorization', 'Bearer ' + jwt.token)
            .json({
                status: 'Ok',
                message: 'connected'
            })
    },

    logout: (req, res) => {
        return res
            .status(200)
            .clearCookie('Authorization')
            .json({
                status: 'Ok',
                message: 'disconnected'
            })
    },

    create: async (req, res) => {
        const clienteData = req.body
        await clienteService.create(clienteData)
        return res
            .status(201)
            .json({
                status: 'Ok',
                message: 'created'
            })
    },

    account: async (req, res) => {
        const clienteEmail = req.user.email
        const cliente = await clienteService.account(clienteEmail)
        cliente.senha = undefined
        return res
            .status(200)
            .json({
                status: 'Ok',
                message: 'accessed',
                data: cliente
            })
    },

    update: async (req, res) => {
        const { body: dataToUpdate } = req
        const { id: clienteId } = req.user
        const cliente = await clienteService.update(dataToUpdate, clienteId)
        
        if (dataToUpdate.email) {
            const jwt = new CreateTokenOAuth({
                id: cliente.id,
                email: cliente.email
            })
            
            res.cookie('Authorization', 'Bearer ' + jwt.token)
        }
    
        return res
            .status(201)
            .json({
                status: 'Ok',
                message: 'updated'
            })
    },

    delete: async (req, res) => {
        const { id: clienteId } = req.user
        await clienteService.delete(clienteId)
        return res
        .status(202)
        .json({
            status: 'Ok',
            message: 'deleted'
        })
    },

    getCliente: async (req, res) => {
        const { id: clienteId } = req.params
        const cliente = await clienteService.getCliente(clienteId)
        return res
            .status(200)
            .json({
                status: 'Ok',
                message: 'geted',
                data: cliente
            })
    },

    listClientes: async (req, res) => {
        const clientes = await clienteService.listClientes()
        return res
            .status(200)
            .json({
                status: 'Ok',
                message: 'geted',
                data: clientes
            })
    }
}
