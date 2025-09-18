const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/mine', postController.getPostsByMe);
router.get('/search/:userId', postController.getPostsByUserId);

// CRUD basic
router.get('/', postController.getAllPost);
router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
router.put('/update/:id', postController.updatePost);
router.delete('/remove/:id', postController.deletePost);

module.exports = router;