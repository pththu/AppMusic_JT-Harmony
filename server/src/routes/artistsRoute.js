const express = require('express')
const router = express.Router()
const artistController = require('../controllers/artistController');
const { authorizeRole } = require('../middlewares/authentication');

// admin routes
router.get('/', authorizeRole, artistController.getAllArtist);


// users routes
router.post('/share', artistController.shareArtist);

module.exports = router;