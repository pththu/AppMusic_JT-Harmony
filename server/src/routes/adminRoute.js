const express = require('express');
const router = express.Router();
const { clearCache } = require('../controllers/adminController');

// Xóa cache
router.delete('/cache', clearCache);

module.exports = router;
