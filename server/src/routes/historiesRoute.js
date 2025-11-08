const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historiesController');

router.get('/', historyController.GetAll);

router.get('/:id', historyController.GetByPk);
router.get('/user/me', historyController.GetByUserId);
router.post('/', historyController.CreateOne);


module.exports = router;