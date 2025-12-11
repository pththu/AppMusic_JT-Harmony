const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload')
const trackController = require('../controllers/trackController');
const { authenticateToken, authorizeRole } = require('../middlewares/authentication');

router.post('/share', authenticateToken, trackController.shareTrack);

router.post('/', authenticateToken, authorizeRole, trackController.createTrack);

module.exports = router