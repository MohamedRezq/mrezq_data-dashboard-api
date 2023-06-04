var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const path = require('path')

if (process.env.NODE_ENV == "local") {
  require('dotenv').config({
    path: path.resolve(
      __dirname,
      `.env.${process.env.NODE_ENV}`,
    ),
  })
}
const app_port = process.env.PORT

// models
var models = require("./models")

// sync Databases
models.sequelize.sync().then(function () {
  console.log('connected to database')
}).catch(function (err) {
    console.log(err)
})

// body parser
app.use((req, res, next) => {
  const jsonBodyParse = bodyParser.json()
  jsonBodyParse(req, res, next)
})
app.use(bodyParser.urlencoded({
  extended: true
}))

// register routes
var baseRouter = require('./routes')
app.use('/api', baseRouter);

// index path
app.get('/', function (req, res) {
  res.status(404).send('requested resource was not found on the server')
})

// health
app.get('/health', function (req, res) {
  res.status(200).json({ status: "up" })
})

app.listen(app_port, function () {
  console.log('app listening on port: ' + app_port)
})