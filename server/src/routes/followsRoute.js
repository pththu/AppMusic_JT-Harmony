const express = require('express')
const router = express.Router()
const controller = require('../controllers/followsController')

router.get('/', controller.getAllFollows)
router.get('/:id', controller.getFollowById)
router.post('/', controller.createFollow)
router.put('/update/:id', controller.updateFollow)
router.delete('/remove/:id', controller.deleteFollow)

module.exports = router


