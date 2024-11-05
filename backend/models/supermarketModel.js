const mongoose = require("mongoose");

const supermarketSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supermarket", supermarketSchema);
