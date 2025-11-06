const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/', favoriteController.GetAll);
router.get('/:id', favoriteController.GetByPk);
router.get('/me', favoriteController.GetByUserId);
router.get('/grouped/items', favoriteController.GetItemsGroupedByType);

router.post('/', favoriteController.CreateOne);


module.exports = router;