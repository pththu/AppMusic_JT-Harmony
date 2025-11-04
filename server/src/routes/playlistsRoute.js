const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const playlistController = require('../controllers/playlistController')

router.post('/new', upload.single('image'), playlistController.createOne);

router.put('/update', upload.single('image'), playlistController.updateOne);
router.put('/:playlistId/share', playlistController.sharePlaylist);

router.delete('/:id', playlistController.deletePlaylist);

module.exports = router