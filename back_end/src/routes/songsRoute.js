const express = require('express')
const router = express.Router()
const songController = require('../controllers/songController')

router.get('/', songController.getAllSong)
router.get('/:id', songController.getSongById)
router.post('/', songController.createSong)
router.put('/update/:id', songController.updateSong)
router.delete('/remove/:id', songController.deleteSong)
router.get('/:id/artists', songController.getArtistBySong)

module.exports = router
