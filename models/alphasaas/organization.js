const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Organization = sequelize.define(
    "Organization",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      hashed_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contact_person: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      onboarding_status: {
        type: DataTypes.ENUM("not_started", "in_progress", "completed"),
        defaultValue: "not_started",
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
        onUpdate: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "organizations",
      underscored: true,
      timestamps: false,
    }
  );

  return Organization;
};
