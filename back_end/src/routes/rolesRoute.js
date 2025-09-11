const express = require('express')
const router = express.Router()
const controller = require('../controllers/rolesController')

router.get('/', controller.getAllRole)
router.get('/:id', controller.getRoleById)
router.post('/', controller.createRole)
router.put('/update/:id', controller.updateRole)
router.delete('/remove/:id', controller.deleteRole)

module.exports = router


