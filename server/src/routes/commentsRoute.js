const express = require('express')
const router = express.Router()
const controller = require('../controllers/commentController')
const { authenticateToken, authorizeRole } = require('../middlewares/authentication')

router.get('/byPost/:postId', controller.getCommentsByPostId)
router.get('/byTrack/:trackId', controller.getCommentsByTrackId)

router.get('/', controller.getAllComment)

// --- ADMIN ROUTES ---
router.get('/admin', authenticateToken, authorizeRole, controller.getCommentsAdmin)

router.get('/:id', controller.getCommentById)
router.post('/', controller.createComment)
router.post('/:commentId/like', controller.toggleCommentLike);
router.put('/update/:id', controller.updateComment)
router.delete('/remove/:id', controller.deleteComment)

module.exports = router