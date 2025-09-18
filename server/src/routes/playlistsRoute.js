const express = require('express')
const router = express.Router()
const controller = require('../controllers/playlistController')

router.get('/', controller.getAllPlaylist)
router.get('/:id', controller.getPlaylistById)
router.post('/', controller.createPlaylist)
router.put('/update/:id', controller.updatePlaylist)
router.delete('/remove/:id', controller.deletePlaylist)

module.exports = router


