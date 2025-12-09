const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken, authorizeRole } = require('../middlewares/authentication');

// admin router
router.get('/', authenticateToken, authorizeRole, favoriteController.GetAll);

router.get('/grouped/items/:id', favoriteController.GetItemsGroupedByType);

router.get('/get/:id', authenticateToken, favoriteController.GetByPk);
router.get('/me', authenticateToken, favoriteController.GetByUserId);
router.get('/playlists', authenticateToken, favoriteController.GetPlaylistFavorite);

router.post('/', authenticateToken, favoriteController.CreateOne);
router.delete('/remove/:id', authenticateToken, favoriteController.DeleteOne);

module.exports = router;