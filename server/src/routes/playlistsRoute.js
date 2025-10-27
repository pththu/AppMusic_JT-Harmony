const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const playlistController = require('../controllers/playlistController')

router.post('/new', upload.single('image'), playlistController.createOne);

module.exports = router