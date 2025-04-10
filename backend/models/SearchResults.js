// models/SearchResult.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: mongoose.Schema.Types.Mixed,
});

const searchResultSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  spani: [productSchema],
  atacadao: [productSchema],
  tenda: [productSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchResult', searchResultSchema);
