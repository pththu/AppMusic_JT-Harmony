const express = require('express')
const router = express.Router()
const controller = require('../controllers/artistController')

router.get('/', controller.getAllArtist)
router.get('/:id', controller.getArtistById)
router.post('/', controller.createArtist)
router.put('/update/:id', controller.updateArtist)
router.delete('/remove/:id', controller.deleteArtist)
router.get('/:id/songs', controller.getSongByArtist)

module.exports = router


