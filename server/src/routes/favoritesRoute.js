const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/', favoriteController.GetAll);
router.get('/get/:id', favoriteController.GetByPk);
router.get('/me', favoriteController.GetByUserId);
router.get('/grouped/items', favoriteController.GetItemsGroupedByType);
router.get('/playlists', favoriteController.GetPlaylistFavorite);

router.post('/', favoriteController.CreateOne);

router.delete('/remove/:id', favoriteController.DeleteOne);

module.exports = router;