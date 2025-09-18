const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authentication');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login-google', authController.loginWithGoogle);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-otp', authController.verifyOtpEmail);
router.post('/resend-otp', authController.reSendOtpEmail);

// Protected routes
router.get('/me', authenticateToken, authController.me);
router.get('/logout', authenticateToken, authController.logout);

module.exports = router;