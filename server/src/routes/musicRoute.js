// routes/musicRoute.js
const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { authenticateToken } = require('../middlewares/authentication');

// ====== PUBLIC ROUTES ======
router.get('/track/:trackId', musicController.findTrackById);
router.get('/search/playlists', musicController.findSpotifyPlaylist);
router.get('/search-album/:albumId', musicController.findAlbumById);
router.post('/playlist', musicController.findPlaylistById);
router.get('/:userId/playlists', musicController.getMyPlaylists);
router.get('/track/:trackSpotifyId/video-id', musicController.findVideoIdForTrack);
router.get('/album/:spotifyId/tracks', musicController.getTracksFromAlbum);
router.get('/artist/:artistId/top-tracks', musicController.getTopTrackFromArtist);
router.get('/artist/:artistId/albums', musicController.getAlbumsFromArtist);
router.post('/playlist/:playlistId/tracks', musicController.getTracksFromPlaylist);
router.post('/playlist-for-you', musicController.getPlaylistsForYou);

router.post('/album-for-you', musicController.getAlbumsForYou);
router.post('/artist-for-you', musicController.getArtistsForYou);
router.post('/search-track', musicController.searchTracks);
router.post('/search-playlist', musicController.searchPlaylists);
router.post('/search-album', musicController.searchAlbums);
router.post('/search-artist', musicController.searchArtists);
router.post('/get-tracks', musicController.getTracks);
router.post('/search-all', musicController.searchAll);
router.get('/search-suggestions', musicController.getSearchSuggestions);
router.get('/category/:category', musicController.getCategoryContent);
router.get('/track-for-cover', musicController.getTracksForCover);
router.post('/track-by-name-artist', musicController.findTrackByNameAndArtist);
router.post('/tracks-from-recommend', musicController.getTracksFromRecommend);

// ====== PROTECTED ROUTES ======
router.post('/playlist/:playlistId/add-track', authenticateToken, musicController.addTrackToPlaylist);
router.post('/playlist/:playlistId/add-track-confirm', authenticateToken, musicController.addTrackToPlaylistAfterConfirm);
router.post('/playlist/add-tracks', authenticateToken, musicController.addTracksToPlaylists);
router.delete('/playlist/:playlistId/remove-track/:playlistTrackId', authenticateToken, musicController.removeTrackFromPlaylist);

// === YOUTUBE ROUTE ===

module.exports = router;