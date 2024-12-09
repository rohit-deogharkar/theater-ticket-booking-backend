const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  imagename: String,
  title: String,
  description: String,
  genre: String,
  language:String,
  director: String,
  releasedate: String,
  reservedSeats: {
    type: [],
  },
});

module.exports = mongoose.model("movies", movieSchema);
