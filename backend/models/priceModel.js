const mongoose = require("mongoose");

const priceSchema = mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    supermarketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supermarket",
      required: true,
    },
    price: { type: Number, required: true },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    unitValue: { type: Number, required: true },
    unitType: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Price", priceSchema);
