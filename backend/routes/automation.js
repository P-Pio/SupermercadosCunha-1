const express = require('express');
const router = express.Router();
const automation = require('../controllers/automation.js');

// EXTERNAL SEARCH
router.get('/search-external', automation.searchExternalItems);
module.exports = router;