const express = require('express')
const router = express.Router()
const controller = require('../controllers/recommendationController')

router.post('/generate-query', controller.generateMusicRecommendations);

module.exports = router;