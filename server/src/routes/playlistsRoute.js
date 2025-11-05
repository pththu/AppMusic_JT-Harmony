const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const playlistController = require('../controllers/playlistController')

router.post('/new', upload.single('image'), playlistController.createOne);

router.put('/update', upload.single('image'), playlistController.updateOne);
router.put('/:playlistId/share', playlistController.sharePlaylist);
router.put('/:playlistId/update-privacy', playlistController.updatePrivacy);

router.delete('/:id', playlistController.deletePlaylist);

module.exports = router