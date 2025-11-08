// routes/musicRoute.js
const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

// === SPOTIFY ROUTES ===

router.get('/search/playlists', musicController.findSpotifyPlaylist);
router.get('/search-album/:albumId', musicController.findAlbumById);
router.post('/playlist', musicController.findPlaylistById);

router.get('/mine/playlists', musicController.getMyPlaylists);

router.get('/track/:trackSpotifyId/video-id', musicController.findVideoIdForTrack);

router.get('/album/:spotifyId/tracks', musicController.getTracksFromAlbum);

router.post('/playlist/:playlistId/tracks', musicController.getTracksFromPlaylist);
router.post('/playlist-for-you', musicController.getPlaylistsForYou);
router.post('/playlist/:playlistId/add-track', musicController.addTrackToPlaylist);
router.post('/playlist/:playlistId/add-track-confirm', musicController.addTrackToPlaylistAfterConfirm);
router.post('/playlist/add-tracks', musicController.addTracksToPlaylists);

router.post('/album-for-you', musicController.getAlbumsForYou);
router.post('/artist-for-you', musicController.getArtistsForYou);

router.post('/search-track', musicController.searchTracks);
router.post('/search-playlist', musicController.searchPlaylists);
router.post('/search-album', musicController.searchAlbums);
router.post('/search-artist', musicController.searchArtists);

// === TRACKS ROUTE ===
router.get('/tracks', musicController.getTracks);

// === YOUTUBE ROUTE ===

// Ví dụ: GET /api/music/youtube/search?song=Shape%20of%20You&artist=Ed%20Sheeran
router.post('/search-video', musicController.findYoutubeVideo);

router.delete('/playlist/:playlistId/remove-track/:playlistTrackId', musicController.removeTrackFromPlaylist);

module.exports = router;