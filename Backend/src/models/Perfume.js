const mongoose = require("mongoose");

const perfumeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  brand: String,
  gender: String,
  type: String,
  launchYear: Number,
  accords: [String],
  topNotes: [String],
  middleNotes: [String],
  baseNotes: [String],
  rating: Number,
  totalVotes: Number,
  reviews: Number,
  longevity: String,
  sillage: String,
  bestFor: {
    seasons: [String],
    time: [String],
    occasions: [String],
  },
  vibe: [String],
  priceCategory: String,
  image: String,
});

module.exports = mongoose.model("Perfume", perfumeSchema);
