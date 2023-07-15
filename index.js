const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const dotenv = require("dotenv");
//-----------------------------------------//


//---creating app
const app = express();
//----cors options
const corsOptions = {
  origin: "http://localhost:3000", // this will be frontend origin in the future
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
//---middlewares
app.use(cors(corsOptions)); // handle preflight requests
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV == "local") {
  dotenv.config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
  });
}

//----models
const models = require("./models");

//-----sync Databases
models.sequelize
  .sync()
  .then(function () {
    console.log("connected to database");
  })
  .catch(function (err) {
    console.log(err);
  });


// register routes
const baseRouter = require("./routes");
app.use("/api", baseRouter);

// index path
app.get("/", function (req, res) {
  res.status(404).send("requested resource was not found on the server");
});

// health
app.get("/health", function (req, res) {
  res.status(200).json({ status: "up" });
});

//----run app
const port = process.env.PORT||3752
app.listen(port, function () {
  console.log("app listening on port: " + port);
});
