const express = require('express')
const router = express.Router()
const controller = require('../controllers/recommendController')

router.get('/', controller.getAllRecommend)
router.get('/:id', controller.getRecommendById)
router.post('/', controller.createRecommend)
router.put('/update/:id', controller.updateRecommend)
router.delete('/remove/:id', controller.deleteRecommend)

module.exports = router


