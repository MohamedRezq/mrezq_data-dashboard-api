// models/user.js
module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    "Employee",
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
      organization_application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      employee_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      mobile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      employee_status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "inactive",
      },
      department_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reporting_to: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
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
      tableName: "employees",
      timestamps: false,
      underscored: true,
    }
  );

  return Employee;
};
