const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
	class Classificacoes extends Model {
		static associate (models) {
			this.hasMany(models.Produtos, { foreignKey: 'classificacao_id', as: 'produtos' })
		}
	}

	Classificacoes.init({
		classificacao: DataTypes.STRING,
		descrição: DataTypes.STRING
	}, {
		sequelize,
		modelName: 'Classificacoes'
	})
	
	return Classificacoes
}
