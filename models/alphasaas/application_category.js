const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ApplicationCategory extends Model {
    static associate(models) {
      // Define any relationships between the models here, if necessary.
    }
  }

  ApplicationCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApplicationCategory',
      tableName: 'application_categories',
      underscored: true,
      timestamps: false,
    }
  );

  return ApplicationCategory;
};
