const mongoose = require("mongoose");
const dotenv = require('dotenv')
dotenv.config()

mongouri = process.env.MONGO_URI

const mongooseConnection = () => {
  mongoose
    .connect(mongouri)
    .then(console.log("connection success"));
};

module.exports = mongooseConnection;
