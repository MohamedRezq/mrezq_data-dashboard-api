module.exports = (sequelize, DataTypes) => {
    class SyncLog extends sequelize.Model {
      static associate(models) {
        SyncLog.belongsTo(models.Organization, {
          foreignKey: 'organization_id',
          as: 'organization',
          onDelete: 'CASCADE',
        });
        SyncLog.belongsTo(models.OrganizationApplication, {
          foreignKey: 'organization_application_id',
          as: 'organizationApplication',
          onDelete: 'CASCADE',
        });
      }
    }
  
    SyncLog.init(
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
        sync_target: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        sync_type: {
          type: DataTypes.ENUM('manual', 'scheduled'),
          allowNull: false,
        },
        sync_status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'success', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        data: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        message: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        start_time: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_time: {
          type: DataTypes.DATE,
          allowNull: true,
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
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'SyncLog',
        tableName: 'sync_logs',
        underscored: true,
        timestamps: false,
      }
    );
  
    return SyncLog;
  };
  