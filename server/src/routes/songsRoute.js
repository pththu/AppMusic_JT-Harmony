const express = require('express')
const router = express.Router()
const songController = require('../controllers/songController')

// controller here
router.get('/', songController.getAllSong)
router.get('/:id', songController.getSongById)
router.post('/', songController.createSong)
router.put('/update/:id', songController.updateSong)
router.delete('/remove/:id', songController.deleteSong)
router.get('/:id/artists', songController.getArtistBySong)

// track from youtube



// track from spotify

module.exports = router
