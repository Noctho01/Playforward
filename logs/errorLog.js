module.exports = (error, req) => {
    console.log(`
Exception to ${req.ip}
message: ${error.message}`
    )
}