const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload');
const userController = require('../controllers/userController')
const { authorizeRole, authenticateToken } = require('../middlewares/authentication')

router.get('/', userController.GetAllUser)
router.get('/search', userController.Search)
router.get('/:id', userController.GetUserById)

router.post('/', userController.CreateUser)
router.post('/link-social-account', authenticateToken, userController.LinkSocialAccount)
router.put('/update-profile', authenticateToken, userController.UpdateInforUser)
router.put('/change-password', authenticateToken, userController.ChangePassword)
router.put('/self-lock', authenticateToken, userController.SelfLockAccount)
router.put('/merge-account', authenticateToken, userController.MergeAccount)
router.post('/change-avatar', authenticateToken, upload.single('image'), userController.ChangeAvatar)
router.post('/add-favorite-genres', authenticateToken, userController.AddFavoriteGenres);
router.put('/completed-onboarding', authenticateToken, userController.UpdateCompletedOnboarding);

// 1. LẤY PROFILE CHI TIẾT CHO MÀN HÌNH SOCIAL (Gồm isFollowing)
router.get('/:userId/profile', authenticateToken, userController.GetUserProfileSocial);

// 2. TOGGLE THEO DÕI / HỦY THEO DÕI
// router.post('/:userId/follow', authenticateToken, userController.toggleFollow);

// admin authorization
router.delete('/remove/:id', authorizeRole, userController.DeleteUser)

router.get('/search', authenticateToken, userController.SearchUsers);
router.post('/search-all', userController.Search);

module.exports = router