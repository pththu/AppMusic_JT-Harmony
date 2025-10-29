const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const playlistController = require('../controllers/playlistController')

router.get('/:playlistId/tracks', playlistController.GetTracksFromPlaylist);

router.post('/new', upload.single('image'), playlistController.createOne);

router.put('/update', upload.single('image'), playlistController.updateOne);

router.delete('/:id', playlistController.deletePlaylist);

module.exports = router