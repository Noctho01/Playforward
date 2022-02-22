const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Carrinhosclientes extends Model {
		static associate (models) {
			// ...
		}
	}

	Carrinhosclientes.init({
		quantidade: DataTypes.INTEGER
	}, {
		sequelize,
		modelName: 'Carrinhosclientes'
	})
	
	return Carrinhosclientes
}
