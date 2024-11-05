const Brand = require("../models/brandModel");

exports.getAllBrands = async (req, res) => {
  const searchQuery = req.query.search;
  let query = {};

  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: "i" }; // Case-insensitive regex search
  }

  try {
    const brands = await Brand.find(query);
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBrand = async (req, res) => {
  const brand = new Brand({
    name: req.body.name,
    description: req.body.description,
  });
  try {
    const newBrand = await brand.save();
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
