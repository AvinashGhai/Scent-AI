const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'unisex'] },
  type: { type: String }, // EDP, EDT, Parfum, Elixir
  launchYear: { type: Number },
  accords: [{ type: String }],
  topNotes: [{ type: String }],
  middleNotes: [{ type: String }],
  baseNotes: [{ type: String }],
  rating: { type: Number },
  totalVotes: { type: Number },
  reviews: { type: Number },
  longevity: { type: String },
  sillage: { type: String },
  bestFor: {
    seasons: [{ type: String }],
    time: [{ type: String }],
    occasions: [{ type: String }],
  },
  vibe: [{ type: String }],
  priceCategory: { type: String },
  image: { type: String },

  embedding: {
    type: [Number], 
    default: undefined,
  },
});

module.exports = mongoose.model('Perfume', perfumeSchema);