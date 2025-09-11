const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authentication');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authController.me);
router.get('/logout', authController.logout);

module.exports = router;