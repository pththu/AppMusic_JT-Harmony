const express = require('express')
const router = express.Router()
const controller = require('../controllers/notificationController')

router.get('/', controller.getAllNotification)
router.get('/:id', controller.getNotificationById)
router.post('/', controller.createNotification)
router.put('/update/:id', controller.updateNotification)
router.delete('/remove/:id', controller.deleteNotification)

module.exports = router


