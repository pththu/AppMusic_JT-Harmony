const express = require('express')
const router = express.Router()
const controller = require('../controllers/commentController')
const { authenticateToken, authorizeRole } = require('../middlewares/authentication')

router.get('/byPost/:postId', controller.getCommentsByPostId)
router.get('/byTrack/:trackId', controller.getCommentsByTrackId)

router.get('/', authenticateToken, controller.getAllComment)

// --- ADMIN ROUTES ---
router.get('/admin', authenticateToken, authorizeRole, controller.getCommentsAdmin)

router.get('/:id', authenticateToken, controller.getCommentById)
router.get('/byPostGuest/:postId', controller.getCommentsByPostIdForGuest)
router.post('/', authenticateToken, controller.createComment)
router.post('/:commentId/like', authenticateToken, controller.toggleCommentLike);
router.put('/update/:id', authenticateToken, controller.updateComment)
router.delete('/remove/:id',authenticateToken, controller.deleteComment)

module.exports = router