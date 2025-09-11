const express = require('express')
const router = express.Router()
const controller = require('../controllers/commentController')

router.get('/', controller.getAllComment)
router.get('/:id', controller.getCommentById)
router.post('/', controller.createComment)
router.put('/update/:id', controller.updateComment)
router.delete('/remove/:id', controller.deleteComment)

module.exports = router


