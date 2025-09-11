const express = require('express');
const router = express.Router();
const albumSongController = require('../controllers/album_songController');

router.get('/', albumSongController.getAllAlbumSong);
router.get('/albumId=:albumId&songId=:songId', albumSongController.getAlbumSongById);
router.post('/', albumSongController.createAlbumSong);
router.put('/update/albumId=:albumId&songId=:songId', albumSongController.updateAlbumSong);
router.delete('/remove/albumId=:albumId&songId=:songId', albumSongController.deleteAlbumSong);

module.exports = router;