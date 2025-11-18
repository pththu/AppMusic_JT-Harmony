const express = require('express')
const router = express.Router()
const controller = require('../controllers/recommendationController')

router.get('/me', controller.getAllByUser);

router.post('/generate-query', controller.generateMusicRecommendations);
router.post('/generate-from-activity', controller.GenerateRecommendationsFromActivity);
router.post('/generate-from-mood', controller.GenerateRecommendationsFromMood);

module.exports = router;