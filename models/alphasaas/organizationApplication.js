const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrganizationApplication extends Model {
    static associate(models) {
      OrganizationApplication.belongsTo(models.Organization, {
        foreignKey: "organization_id",
        as: "organization",
      });

      OrganizationApplication.belongsTo(models.Application, {
        foreignKey: "application_id",
        as: "application",
      });
    }
  }

  OrganizationApplication.init(
    {
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "applications",
          key: "id",
        },
      },
      vendor_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vendor_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      integration_status: {
        type: DataTypes.ENUM("pending", "active", "disabled", "error"),
        defaultValue: "pending",
      },
      data: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrganizationApplication",
      tableName: "organization_applications",
      underscored: true,
      paranoid: true,
    }
  );

  return OrganizationApplication;
};
