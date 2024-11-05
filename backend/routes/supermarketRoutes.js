const express = require("express");
const router = express.Router();
const supermarketController = require("../controllers/supermarketController");

router.get("/", supermarketController.getAllSupermarkets);
router.post("/", supermarketController.createSupermarket);
router.get("/:id", supermarketController.getSupermarketById);
router.put("/:id", supermarketController.updateSupermarket);
router.delete("/:id", supermarketController.deleteSupermarket);

module.exports = router;
