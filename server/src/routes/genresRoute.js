const express = require('express');
const router = express.Router();
const genresController = require('../controllers/genresController');


// Lấy tất cả genres
router.get('/', genresController.getAllGenre);

// Lấy genre theo ID
router.get('/:id', genresController.getById);

module.exports = router;