const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historiesController');

// Listening History routes
router.get('/listening-all', historyController.GetAllListeningHistories);
router.get('/listening/:id', historyController.GetListeningHistoryByPk);
router.get('/listening/user/me', historyController.GetListeningHistoriesByUserId);
router.post('/listening', historyController.CreateOneListeningHistory);


// Search History routes
router.get('/search-all', historyController.GetAllSearchHistories);
router.get('/search/:id', historyController.GetSearchHistoryByPk);
router.get('/search/user/me', historyController.GetSearchHistoriesByUserId);
router.post('/search', historyController.CreateOneSearchHistory);
router.delete('/search/:id', historyController.DeleteSearchHistoryByPk);
router.delete('/search/user/me', historyController.DeleteAllSearchHistoriesByUserId);

module.exports = router;