const Supermarket = require("../models/supermarketModel");

exports.getAllSupermarkets = async (req, res) => {
  try {
    const supermarkets = await Supermarket.find();
    res.json(supermarkets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupermarket = async (req, res) => {
  const supermarket = new Supermarket({
    name: req.body.name,
    location: req.body.location,
  });
  try {
    const newSupermarket = await supermarket.save();
    res.status(201).json(newSupermarket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSupermarketById = async (req, res) => {
  try {
    const supermarket = await Supermarket.findById(req.params.id);
    if (!supermarket)
      return res.status(404).json({ message: "Supermarket not found" });
    res.json(supermarket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSupermarket = async (req, res) => {
  try {
    const supermarket = await Supermarket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(supermarket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSupermarket = async (req, res) => {
  try {
    await Supermarket.findByIdAndDelete(req.params.id);
    res.json({ message: "Supermarket deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
