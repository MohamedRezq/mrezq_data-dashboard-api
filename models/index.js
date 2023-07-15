const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(module.filename);
const { database } = require("../configs/app_config");

// GEOMETRY DATATYPE :: Hack :: START
/*
Older version of MySQL had GeomFromText method for Geometry types, it was 
repaced by ST_GeomFromText which is not available in latest version of sequelize.
*/
const Wkt = require("terraformer-wkt-parser");
Sequelize.GEOMETRY.prototype._stringify = function _stringify(value, options) {
  return "ST_GeomFromText(" + options.escape(Wkt.convert(value)) + ")";
};
Sequelize.GEOGRAPHY.prototype._stringify = function _stringify(value, options) {
  return "ST_GeomFromText(" + options.escape(Wkt.convert(value)) + ")";
};
// GEOMETRY DATATYPE :: Hack :: END

const db = {};

let sequelize = new Sequelize(
  database.dbname,
  database.username,
  database.password,
  {
    logging: false,
    host: database.host,
    port: database.port,
    dialect: database.dialect,
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const model_folders = ["alphasaas"];

model_folders.forEach(function (folderName, index) {
  fs.readdirSync(path.join(__dirname, folderName))
    .filter(
      (file) =>
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    )
    .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, folderName, file));
      db[model.name] = model;
    });
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// associations
// db.products.hasMany(db.varieties, { foreignKey: 'product_id', targetKey: 'id' })
// db.varieties.belongsTo(db.products, { foreignKey: 'product_id', targetKey: 'id' })
// db.varieties.belongsTo(db.branches_products_varieties, { foreignKey: 'id', targetKey: 'variety_id' })
// db.products.belongsTo(db.brands, { foreignKey: "brand_id", targetKey: "id" })
// db.products.belongsTo(db.categories, { foreignKey: "category_id", targetKey: "id" })
// db.configs.belongsTo(db.config_translations, { foreignKey: "id", targetKey: "config_id", as: "translation", constraints: false })
// db.varieties.hasMany(db.users_lists_items, { foreignKey: "variety_id", targetKey: "id" })
// db.varieties.hasMany(db.panda_promotions, { foreignKey: "variety_id", targetKey: "id" })
// db.users_lists_items.belongsTo(db.users_lists, { foreignKey: "users_list_id", targetKey: "id" })

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
