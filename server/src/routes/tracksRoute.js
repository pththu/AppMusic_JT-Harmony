const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const trackController = require('../controllers/trackController')

router.post('/share', trackController.shareTrack);

module.exports = router