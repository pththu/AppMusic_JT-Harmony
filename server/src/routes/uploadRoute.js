const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');

// Upload single image
router.post('/single', upload.single('image'), uploadController.uploadSingleImage);

// Upload multiple images (max 10)
router.post('/multiple', upload.array('images', 10), uploadController.uploadMultipleImages);

router.post('/multiple-file', upload.array('files', 10), uploadController.uploadMultipleFiles);

// Delete image
router.delete('/delete', uploadController.deleteImage);

module.exports = router;