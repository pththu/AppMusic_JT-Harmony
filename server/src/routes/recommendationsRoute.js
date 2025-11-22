const express = require('express')
const router = express.Router()
const controller = require('../controllers/recommendationController');
const { authenticateToken } = require('../middlewares/authentication');

router.get('/me', controller.getAllByUser);

router.get('/generate-from-time-of-day', controller.GenerateRecommendationsFromTimeOfDay);
router.post('/generate-query', controller.generateMusicRecommendations);
router.post('/generate-from-activity', controller.GenerateRecommendationsFromActivity);
router.post('/generate-from-mood', controller.GenerateRecommendationsFromMood);
router.post('/generate-from-histories', authenticateToken, controller.GenerateRecommendationsFromHistories);
router.post('/generate-from-followed-artists', authenticateToken, controller.GenerateRecommendationsFromFollowedArtists);
router.post('/generate-from-favorites', authenticateToken, controller.GenerateRecommendationsFromFavorites);
router.post('/generate-from-genres', authenticateToken, controller.GenerateRecommendationsFromGenres);

module.exports = router;