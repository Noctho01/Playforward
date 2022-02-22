const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Estadosprodutos extends Model {
		static associate (models) {
			this.hasMany(models.Produtosclientes, { foreignKey: 'estado_atual_id', as: 'produto' })
		}
	}

	Estadosprodutos.init({
		nome: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'Estadosprodutos'
	})
	
	return Estadosprodutos
}
