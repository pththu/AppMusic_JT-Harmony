const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authentication');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.loginWithGoogle);
router.post('/facebook-login', authController.loginWithFacebook);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-otp', authController.verifyOtpEmail);
router.post('/send-otp', authController.sendOtpEmail);
router.post('/is-email-exist', authController.isEmailExist);

// Protected routes
router.get('/me', authenticateToken, authController.me);
router.get('/logout', authenticateToken, authController.logout);

module.exports = router;