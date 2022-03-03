module.exports = (error, req) => {
    console.log(`/n Exception to ${req.ip}/n message: ${error.message}`
    )
}