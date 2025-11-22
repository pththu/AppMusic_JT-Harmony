const express = require('express')
const router = express.Router()
const controller = require('../controllers/notificationController')

router.get('/', controller.getMyNotifications)
router.get('/unread/count', controller.getUnreadNotificationCount)
router.patch('/:id/read', controller.markNotificationRead)
router.post('/read-all', controller.markAllNotificationsRead)

module.exports = router


