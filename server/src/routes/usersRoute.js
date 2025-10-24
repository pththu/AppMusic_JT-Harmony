const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authorizeRole, authenticateToken } = require('../middlewares/authentication')

router.get('/', userController.getAllUser)
router.get('/search', userController.search)
router.get('/:id', userController.getUserById)

router.post('/', userController.createUser)
router.post('/link-social-account', authenticateToken, userController.linkSocialAccount)
router.put('/update-profile', authenticateToken, userController.updateInforUser)
router.put('/change-password', authenticateToken, userController.changePassword)
router.put('/self-lock', authenticateToken, userController.selfLockAccount)

// 1. LẤY PROFILE CHI TIẾT CHO MÀN HÌNH SOCIAL (Gồm isFollowing)
router.get('/:userId/profile', authenticateToken, userController.getUserProfileSocial);

// 2. TOGGLE THEO DÕI / HỦY THEO DÕI
router.post('/:userId/follow', authenticateToken, userController.toggleFollow);

// admin authorization
router.delete('/remove/:id', authorizeRole, userController.deleteUser)

module.exports = router