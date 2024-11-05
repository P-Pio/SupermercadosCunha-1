// /routes/overviewRoutes.js
const express = require("express");
const router = express.Router();
const overviewController = require("../controllers/overviewController");

// Route for searching and filtering items
router.get("/search", overviewController.searchItems);

module.exports = router;
