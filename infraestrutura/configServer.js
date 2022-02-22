const cookieParser = require('cookie-parser')
const morgan = require('morgan')

module.exports = (app, express) => {
	app.use(morgan('dev'))
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.use(cookieParser())
}
