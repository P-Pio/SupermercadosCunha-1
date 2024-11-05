const express = require("express");
const router = express.Router();
const priceController = require("../controllers/priceController");

router.get("/", priceController.getAllPrices);
router.post("/", priceController.createPrice);
router.get("/:id", priceController.getPriceById);
router.put("/:id", priceController.updatePrice);
router.delete("/:id", priceController.deletePrice);
router.get("/historical/:id", priceController.getHistoricalPrices);
module.exports = router;
