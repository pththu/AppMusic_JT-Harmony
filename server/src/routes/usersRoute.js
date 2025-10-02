const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authorizeRole, authenticateToken } = require('../middlewares/authentication')

router.get('/', userController.getAllUser)
router.get('/search', userController.search)
router.get('/:id', userController.getUserById)

router.post('/', userController.createUser)
router.put('/update-profile', authenticateToken, userController.updateInforUser)
router.put('/change-password', authenticateToken, userController.changePassword)

// admin authorization
router.delete('/remove/:id', authorizeRole, userController.deleteUser)

module.exports = router
