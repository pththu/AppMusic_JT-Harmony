const express = require('express')
const router = express.Router()
const controller = require('../controllers/followsController')
const { authenticateToken } = require('../middlewares/authentication');

router.get('/', controller.getAllFollows)

router.get('/users/:userId/followers', controller.getUserFollowers)
router.get('/users/:userId/following', controller.getUserFollowing)

router.get('/:id', controller.getFollowById)

router.post('/users/:userId/follow', authenticateToken, controller.toggleUserFollow)
router.post('/', controller.createFollow)
router.put('/update/:id', controller.updateFollow)
router.delete('/remove/:id', controller.deleteFollow)

module.exports = router