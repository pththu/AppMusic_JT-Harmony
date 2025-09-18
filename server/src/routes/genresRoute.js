const express = require('express')
const router = express.Router()
const controller = require('../controllers/genresController')

router.get('/search', controller.getGenresByName)

router.get('/', controller.getAllGenre)
// router.get('/:id', controller.getGenreById)
router.post('/', controller.createGenre)
router.put('/update/:id', controller.updateGenre)
router.delete('/remove/:id', controller.deleteGenre)


module.exports = router


