// routes/musicRoute.js
const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

// === SPOTIFY ROUTES ===

router.get('/search/playlists', musicController.findSpotifyPlaylist);
router.get('/playlist/:playlistId/tracks', musicController.getTracksFromPlaylist);
router.get('/album/:albumId/tracks', musicController.getTracksFromAlbum);
router.get('/search-album/:albumId', musicController.findAlbumById);

router.post('/search-track', musicController.searchTracks);
router.post('/top-50-tracks', musicController.searchTop50Tracks);
router.post('/playlist', musicController.findPlaylistById);

router.post('/search-playlist', musicController.searchPlaylists);
router.post('/search-album', musicController.searchAlbums);
router.post('/search-artist', musicController.searchArtists);
// === YOUTUBE ROUTE ===

// Ví dụ: GET /api/music/youtube/search?song=Shape%20of%20You&artist=Ed%20Sheeran
router.post('/search-video', musicController.findYoutubeVideo);

module.exports = router;