require("dotenv").config();
const express = require("express");
const config = require("./app/constants/appConstants.json");
const connectToDatabase = require("./app/config/mongo");
const connectTosocket = require("./app/config/socket");
const app = express();
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const setWorker = require("./app/utils/workers");

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(hpp());

connectToDatabase();

const port = config.PORT;

app.get("/", (req, res) => {
  res.send(
    "*******************WELCOME_TO_THE_BETMASTER_BACKEND_SPORTS_SERVICE_APPLICATION*******************"
  );
});

app.use(require("./app/routes/sport"));

//PAGE NOT FOUND URL
app.use("*", (req, res) => {
  res.status(404).send({
    status: 404,
    Message: "URL_NOT_FOUND",
  });
});

const server = app.listen(port, () => {
  console.log("*******************************************");
  console.log(`Server started successfully on ${port}`);
});

const io = connectTosocket(server);

// if you got error 403 please send post request to enable destribution
// https://stm-api.lsports.eu/Distribution/Start
/*  ===== body ====== :
{
  "PackageId": 1017, // change this to 1016 for prematch
  "UserName": "skystopcs@gmail.com",
  "Password": "G735@dhu8T"
}
*/
// for inPlay

// setWorker(io, "_1017_", "stm-inplay.lsports.eu", "StmInPlay");

// for preMatch // uncomment that for prematchs
// setWorker(io, "_1016_", "stm-prematch.lsports.eu", "StmPreMatch");

// API routes
