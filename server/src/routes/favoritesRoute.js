const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/authentication');

router.get('/grouped/items/:id', favoriteController.GetItemsGroupedByType);

router.get('/', authenticateToken, favoriteController.GetAll);
router.get('/get/:id', authenticateToken, favoriteController.GetByPk);
router.get('/me', authenticateToken, favoriteController.GetByUserId);
router.get('/playlists', authenticateToken, favoriteController.GetPlaylistFavorite);

router.post('/', authenticateToken, favoriteController.CreateOne);
router.delete('/remove/:id', authenticateToken, favoriteController.DeleteOne);

module.exports = router;