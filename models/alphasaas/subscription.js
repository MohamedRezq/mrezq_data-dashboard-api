const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.Organization, {
        foreignKey: "organization_id",
        as: "organization",
      });

      Subscription.belongsTo(models.OrganizationApplication, {
        foreignKey: "organization_application_id",
        as: "organization_application",
      });
    }
  }

  Subscription.init(
    {
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
      },
      organization_application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "organization_applications",
          key: "id",
        },
      },
      subscription_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor_category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "application_categories",
          key: "id",
        },
      },
      vendor_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_source: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      data_source_type: {
        type: DataTypes.ENUM("finance_app", "self", "hr_app"),
        allowNull: true,
      },
      license_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      license_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_type: {
        type: DataTypes.ENUM("upfront", "recurring"),
        allowNull: true,
      },
      total_contract_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      renewal_status: {
        type: DataTypes.ENUM("upcoming", "due", "discarded", "paid"),
        allowNull: true,
      },
      renewal_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      renewal_end_date: {
        type: DataTypes.DATE,
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
      modelName: "Subscription",
      tableName: "subscriptions",
      underscored: true,
      paranoid: true,
    }
  );

  return Subscription;
};
