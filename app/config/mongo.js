const mongoose = require("mongoose");
const config = require("../constants/appConstants.json");

module.exports = connectToDatabase = () => {
  mongoose
    .connect(config.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected To Mongo DB ATLAS");
      console.log("Connection:OK");
      console.log("DB:Mongo DB ATLAS");
      console.log("*******************************************");
    })
    .catch((err) => {
      console.log(err);
      console.log("Unable to Connect .Something went Wrong");
      console.log("*******************************************");
    });
};
