const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middlewares/authentication');

router.post('/new', authenticateToken, upload.single('image'), playlistController.createOne);
router.post('/share', authenticateToken, playlistController.sharePlaylist);

router.put('/update', authenticateToken, upload.single('image'), playlistController.updateOne);
router.put('/:playlistId/update-privacy', authenticateToken, playlistController.updatePrivacy);

router.delete('/:id', authenticateToken, playlistController.deletePlaylist);

module.exports = router