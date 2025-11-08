const express = require('express')
const router = express.Router()
const albumController = require('../controllers/albumController')

router.get('/', albumController.getAllAlbum);
router.get('/:id', albumController.getAlbumById);

router.post('/share', albumController.shareAlbum);

module.exports = router;