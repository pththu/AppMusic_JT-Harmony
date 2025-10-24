// controllers/musicController.js
const { TOP_50_PLAYLIST_ID } = require('../configs/constants');
const spotify = require('../configs/spotify');
const youtube = require('../configs/youtube');
const { get } = require('../routes/musicRoute');

// Tìm kiếm playlist trên Spotify
const findSpotifyPlaylist = async (req, res) => {
  try {
    const { query } = req.query; // Lấy query từ URL, ví dụ: /spotify/playlists?query=lofi
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const data = await spotify.searchPlaylists(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search playlists' });
  }
};


// Lấy các bài hát hàng đầu của nghệ sĩ trên Spotify
const findArtistTopTracks = async (req, res) => {
  try {
    const { artistId } = req.params; // Lấy ID nghệ sĩ từ URL, ví dụ: /spotify/artists/06HL4z0CvFAxyc27GXpf02/top-tracks
    const data = await spotify.getArtistTopTracks(artistId);
    res.json(data.tracks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get artist top tracks' });
  }
};

// ví dụ: /youtube/search?song=Hello&artist=Adele
// Tìm kiếm video trên YouTube
const findYoutubeVideo = async (req, res) => {
  try {
    const { song, artist } = req.body;
    if (!song || !artist) {
      return res.status(400).json({ error: 'Song and artist parameters are required' });
    }
    const data = await youtube.searchVideo(song, artist);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search on YouTube' });
  }
};

const findAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const data = await spotify.findAlbumById(albumId);
    return res.status(200).json({
      message: 'Album retrieval successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to find album by ID on Spotify' });
  }
}

///////////////////////////////////////////////////////////////
/**
 * Tìm kiếm bài hát trên Spotify với các tham số linh hoạt
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const searchTracks = async (req, res) => {
  try {
    const query = {};
    const { artist, track, album, type, genre, limit } = req.body;
    if (track) query.track = track;
    if (album) query.album = album;
    if (artist) query.artist = artist;
    if (genre) query.genre = genre;
    // chuyển đổi thành chuỗi truy vấn
    const queryString = Object.entries(query).map(([key, value]) => `${key.toLowerCase()}:${String(value.toLowerCase()).replace(/ /g, '+') + '"'}`).join(' ');
    console.log(queryString);

    const data = await spotify.searchTracks(queryString, type || 'track', Number.parseInt(limit) || null);
    return res.status(200).json({
      message: 'Track search successful',
      data,
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search tracks on Spotify' });
  }
};

const searchTop50Tracks = async (req, res) => {
  try {
    const { market, genre } = req.body;
    const query = {};
    if (genre) query.genre = genre;
    if (market) query.market = market;

    console.log(1)
    if (!market || !TOP_50_PLAYLIST_ID[market]) {
      console.log(2)
      return res.status(400).json({ error: 'Invalid or missing market parameter' });
    }

    console.log(3)
    const tracks = await spotify.searchTop50Tracks('37i9dQZEVXbLdGSmz6xilI');
    console.log(4)
    return res.status(200).json({
      message: 'Top 50 tracks search successful',
      data: tracks,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search top 50 tracks on Spotify' });
  }
};

const findPlaylistById = async (req, res) => {
  try {
    const { market } = req.body;
    console.log(market)
    if (!market || !TOP_50_PLAYLIST_ID[market]) {
      return res.status(400).json({ error: 'Invalid or missing market parameter' });
    }

    const playlistData = await spotify.findPlaylistById(TOP_50_PLAYLIST_ID[market]);
    return res.status(200).json({
      message: 'Playlist retrieval successful',
      data: playlistData,
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to find playlist by ID on Spotify' });
  }
};

const searchPlaylists = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }
    const data = await spotify.searchPlaylists(name);
    return res.status(200).json({
      message: 'Playlist search successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search playlists on Spotify' });
  }
};

const searchAlbums = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }
    const data = await spotify.searchAlbums(name);
    return res.status(200).json({
      message: 'Album search successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search albums on Spotify: controller' });
  }
};

const searchArtists = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }
    const data = await spotify.searchArtists(name);
    return res.status(200).json({
      message: 'Artist search successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search artists on Spotify' });
  }
}

const getTracksFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const data = await spotify.getPlaylistTracks(playlistId);
    return res.status(200).json({
      message: 'Get tracks from playlist successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get tracks from playlist on Spotify' });
  }
};

const getTracksFromAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    console.log(albumId)
    const data = await spotify.getAlbumTracks(albumId);
    return res.status(200).json({
      message: 'Get tracks from album successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get tracks from album on Spotify' });
  }
};

const getPlaylistsForYou = async (req, res) => {
  try {
    const { playlistName, limit } = req.body;
    const playlists = [];

    if (playlistName?.length === 0) {
      return res.status(200).json({ message: 'Playlist name parameter is required', success: false });
    }

    for (const name of playlistName) {
      const responsePlaylist = await spotify.searchPlaylists(name, limit);
      playlists.push(...responsePlaylist);
    }

    console.log('tổng số playlist nhận được: ', playlists.length);

    return res.status(200).json({
      message: 'Get personalized playlists successful',
      data: playlists,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get personalized playlists on Spotify' });
  }
}

const getAlbumsForYou = async (req, res) => {
  try {
    const { albumName, limit } = req.body;
    const albums = [];

    if (albumName.length === 0) {
      return res.status(200).json({ message: 'Album name parameter is required', success: false });
    }

    for (const name of albumName) {
      const responseAlbum = await spotify.searchAlbums(name, limit);
      albums.push(...responseAlbum);
    }

    return res.status(200).json({
      message: 'Album search successful',
      data: albums,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get personalized albums on Spotify' });
  }
};

const getArtistsForYou = async (req, res) => {
  try {
    const { artistName, limit } = req.body;
    const artists = [];

    if (artistName.length === 0) {
      return res.status(200).json({ message: 'Artist name parameter is required', success: false });
    }

    for (const name of artistName) {
      const responseArtist = await spotify.searchArtists(name, limit);
      artists.push(...responseArtist);
    }

    return res.status(200).json({
      message: 'Get artist for you successful',
      data: artists,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get artist for you on Spotify' });
  }
};

module.exports = {
  findSpotifyPlaylist,
  findArtistTopTracks,
  findYoutubeVideo,
  findPlaylistById,
  findAlbumById,
  getTracksFromPlaylist,
  getTracksFromAlbum,
  getPlaylistsForYou,
  getAlbumsForYou,
  getArtistsForYou,
  searchTracks,
  searchTop50Tracks,
  searchPlaylists,
  searchAlbums,
  searchArtists
};