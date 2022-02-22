const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Generos extends Model {
		static associate (models) {
			this.belongsToMany(models.Produtos, { foreignKey: 'genero_id', through: 'Generosprodutos', as: 'produtos', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
		}
	}

	Generos.init({
		genero: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'Generos'
	})
	
	return Generos
}
