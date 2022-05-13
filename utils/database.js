const mongoose = require("mongoose");

const url = process.env.DB_STRENG.replace(/testingDB/, `test-${dbName}`);
const mongoOptions = {
  autoIndex: true,
};
const newDatabaseConnection = (dbName) => {
  const db = mongoose.useDb(dbName, { useCache: true });
};

const establishConnection = (dbName, url, mongoOption) => {
  newDatabaseConnection(dbName);
  mongoose.connect(url, mongoOption);
};

module.exports = establishConnection;
