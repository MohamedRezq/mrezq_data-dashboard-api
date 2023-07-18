// models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
      "User",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        organization_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        first_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM("superadmin", "admin", "member"),
          allowNull: false,
          defaultValue: "admin",
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 1,
        },
        data: {
          type: DataTypes.TEXT("long"),
          allowNull: true,
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
        tableName: "users",
        timestamps: false,
        underscored: true,
      }
    );
  
    return User;
  };
  