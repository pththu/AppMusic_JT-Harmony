const express = require('express')
const router = express.Router()
const artistController = require('../controllers/artistController')

router.post('/share', artistController.shareArtist);

module.exports = router;