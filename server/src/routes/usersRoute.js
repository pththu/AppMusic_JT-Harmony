const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload');
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
router.put('/merge-account', authenticateToken, userController.mergeAccount)
router.post('/change-avatar', authenticateToken, upload.single('image'), userController.changeAvatar)

// admin authorization
router.delete('/remove/:id', authorizeRole, userController.deleteUser)

module.exports = router
