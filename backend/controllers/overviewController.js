// /controllers/overviewController.js
const Item = require("../models/itemModel");

exports.searchItems = async (req, res) => {
  try {
    const { query } = req.query; // Assuming you pass a 'query' parameter for text search
    const items = await Item.find({
      $or: [
        { name: new RegExp(query, "i") },
        { supermarket: new RegExp(query, "i") },
        { brand: new RegExp(query, "i") },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).send("Server error in fetching items");
  }
};
