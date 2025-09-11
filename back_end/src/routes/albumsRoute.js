const express = require('express')
const router = express.Router()
const controller = require('../controllers/albumController')

router.get('/', controller.getAllAlbum)
router.get('/:id', controller.getAlbumById)
router.post('/', controller.createAlbum)
router.put('/update/:id', controller.updateAlbum)
router.delete('/remove/:id', controller.deleteAlbum)
router.get('/:albumId/songs', controller.getSongByAlbumId)

module.exports = router


