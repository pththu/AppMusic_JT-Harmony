const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historiesController');
const { authenticateToken, authorizeRole } = require('../middlewares/authentication');

// admin routes
router.get('/listening-all', authenticateToken, authorizeRole, historyController.GetAllListeningHistories);
router.get('/search-all', authenticateToken, authorizeRole, historyController.GetAllSearchHistories);

// user routes
router.get('/search/user/:userId', historyController.GetSearchHistoriesByUserId);
router.get('/listening/user/:userId', historyController.GetListeningHistoriesByUserId);

// Listening History routes
router.get('/listening/:id', historyController.GetListeningHistoryByPk);
router.post('/listening', authenticateToken, historyController.CreateOneListeningHistory);

// Search History routes
router.get('/search/:id', historyController.GetSearchHistoryByPk);
router.post('/search', authenticateToken, historyController.CreateOneSearchHistory);
router.delete('/search/:id', authenticateToken, historyController.DeleteSearchHistoryByPk);
router.delete('/search/user/me', authenticateToken, historyController.DeleteAllSearchHistoriesByUserId);

module.exports = router;