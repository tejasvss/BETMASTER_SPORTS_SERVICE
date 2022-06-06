require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const hpp = require("hpp");
const ejs = require("ejs");
const cors = require("cors");
const setWorker = require("./workers");
// const setWorker = require("./workersAsync");

const storData = require("./store");
const userRoute = require("./routes/userRoute");
const oddSettingRoute = require("./routes/oddSettingRoute");
const skocketio = require("socket.io");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(hpp());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`app running on port ${PORT}...`);
});

const io = skocketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// please fire the server and watch rasult in the browser console u will got undifined somethimes we need to comnfirm with support

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
setWorker(io, "_1016_", "stm-prematch.lsports.eu", "StmPreMatch");

// hier we can store data in mongodb one document thats get updated every 5s
// uncomment line bellow and mongo connection in the end of this sneppit
// storData("_1017_", "stm-inplay.lsports.eu", "StmInPlay");

const global_data = fs
  .readFileSync(`${__dirname}/utils/sportApi.json`)
  .toString();

const gamesEvents = JSON.parse(global_data);

app.get("/", async (req, res, next) => {
  res.render("index", {
    gamesEvents,
  });
});

// API routes

app.use("/api/users", userRoute);
app.use("/api/bets", oddSettingRoute);

// uncoment when you need

mongoose.connect(process.env.DB_LOCAL_STRING, { autoIndex: true }, (err) => {
  if (err) console.log(err);
  console.log("connection database successfuly established");
});
