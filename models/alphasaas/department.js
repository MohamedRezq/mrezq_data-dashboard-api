// models/department.js
module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define(
      'Department',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        organization_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Organizations',
            key: 'id',
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
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
        tableName: 'departments',
        underscored: true,
        timestamps: false,
      }
    );
  
    Department.associate = function (models) {
      Department.belongsTo(models.Organization, {
        foreignKey: 'organization_id',
        as: 'organization',
      });
    };
  
    return Department;
  };
  