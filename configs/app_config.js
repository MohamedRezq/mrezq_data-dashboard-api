database =  {
    username: process.env.DB_USER,
    dbname: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
}

module.exports = {}