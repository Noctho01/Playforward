const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Plataformas extends Model {
		static associate (models) {
			this.hasMany(models.Produtos, { foreignKey: 'plataforma_id', as: 'produtos' })
		}
	}

	Plataformas.init({
		plataforma: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'Plataformas'
	})
	
	return Plataformas
}
