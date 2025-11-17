const express = require('express')
const router = express.Router()
const controller = require('../controllers/recommendationController')

router.get('/me', controller.getAllByUser);

router.post('/generate-query', controller.generateMusicRecommendations);

module.exports = router;