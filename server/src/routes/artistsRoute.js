const express = require('express')
const router = express.Router()
const artistController = require('../controllers/artistController');
const { authorizeRole, authenticateToken } = require('../middlewares/authentication');

// admin routes
router.get('/', authenticateToken, authorizeRole, artistController.getAllArtist);
router.post('/', authenticateToken, authorizeRole, artistController.createArtist);


// users routes
router.post('/share', artistController.shareArtist);

module.exports = router;