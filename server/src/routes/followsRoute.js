const express = require('express')
const router = express.Router()
const controller = require('../controllers/followsController')
const { authenticateToken } = require('../middlewares/authentication');

router.get('/:userId/followed-artists', controller.GetArtistFollowedByUser);
router.post('/artist/follower', controller.GetFollowerOfArtist);
router.post('/follow-artist', authenticateToken, controller.CreateFollowArtist)
router.delete('/unfollow-artist/:id', authenticateToken, controller.DeleteFollowArtist)

router.post('/follow-user/:followeeId', authenticateToken, controller.CreateFollowUser)
router.delete('/unfollow-user', authenticateToken, controller.DeleteFollowUser)
router.get('/:userId/followees', controller.GetFollowees); // người được user theo dõi
router.get('/:userId/followers', controller.GetFollowers); // người theo dõi user
router.get('/:userId/profile-social', controller.GetUserProfileSocial);

module.exports = router