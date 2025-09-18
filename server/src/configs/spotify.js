import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Spotify Configuration
const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  API_URL: 'https://api.spotify.com/v1'
};

let spotifyToken = null;
let tokenExpiry = null;

exports.getSpotifyToken = async () => {
  try {
    // Kiểm tra token còn hiệu lực
    if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
      return spotifyToken;
    }

    const credentials = Buffer.from(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(SPOTIFY_CONFIG.TOKEN_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    spotifyToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Trừ 1 phút cho an toàn

    return spotifyToken;
  } catch (error) {
    console.error('Spotify token error:', error.response?.data || error.message);
    throw new Error('Không thể lấy Spotify token');
  }
};

exports.searchTrackPlaylist = async (query, type = 'track', limit = 10) => {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_CONFIG.API_URL}/search`, {
      params: {
        q: `${query} ${type}`,
        type: 'track',
        market: 'VN',
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.tracks?.items?.map(item => formatTrack(item)) || [];
  } catch (error) {
    console.error('Search track playlist error:', error.response?.data || error.message);
    return [];
  }
}

// Tìm kiếm playlist Vpop
exports.searchVpopPlaylists = async () => {
  try {
    const token = await getSpotifyToken();
    const queries = [
      'vpop vietnam top',
      'nhạc việt hot',
      'vietnamese pop trending',
      'vpop 2024'
    ];

    for (const query of queries) {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_URL}/search`, {
        params: {
          q: query,
          type: 'playlist',
          market: 'VN',
          limit: 5
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.playlists?.items?.length > 0) {
        return response.data.playlists.items;
      }
    }
    return [];
  } catch (error) {
    console.error('Search playlist error:', error.response?.data || error.message);
    return [];
  }
}

// Lấy tracks từ playlist
exports.getPlaylistTracks = async (playlistId, limit = 20) => {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_CONFIG.API_URL}/playlists/${playlistId}/tracks`, {
      params: {
        market: 'VN',
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.items?.map(item => formatTrack(item.track)) || [];
  } catch (error) {
    console.error('Get playlist tracks error:', error.response?.data || error.message);
    return [];
  }
}

// Tìm kiếm tracks Vpop trực tiếp
exports.searchVpopTracks = async (limit = 20) => {
  try {
    const token = await getSpotifyToken();
    const queries = [
      'genre:vietnam',
      'vpop vietnam',
      'vietnamese pop music',
      'nhạc việt'
    ];

    let allTracks = [];

    for (const query of queries) {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_URL}/search`, {
        params: {
          q: query,
          type: 'track',
          market: 'VN',
          limit: Math.ceil(limit / queries.length)
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.tracks?.items) {
        allTracks = allTracks.concat(response.data.tracks.items.map(track => formatTrack(track)));
      }
    }

    // Loại bỏ duplicate và sắp xếp
    const uniqueTracks = allTracks.filter((track, index, self) =>
      index === self.findIndex(t => t.id === track.id)
    );

    return uniqueTracks
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  } catch (error) {
    console.error('Search tracks error:', error.response?.data || error.message);
    return [];
  }
};

// Hàm search playlist theo query và quốc gia/châu lục
exports.searchPlaylists = async (queries = [], market = 'VN', limit = 15) => {
  try {
    const token = await getSpotifyToken();

    for (const query of queries) {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_URL}/search`, {
        params: {
          q: query,
          type: 'playlist',
          market,
          limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.playlists?.items?.length > 0) {
        return response.data.playlists.items;
      }
    }

    return [];
  } catch (error) {
    console.error('Search playlist error:', error.response?.data || error.message);
    return [];
  }
};


exports.formatTrack = (track) => {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists.map(artist => artist.name).join(', '),
    album: track.album.name,
    image: track.album.images[0]?.url || null,
    popularity: track.popularity,
    preview_url: track.preview_url,
    duration_ms: track.duration_ms,
    external_url: track.external_urls?.spotify
  };
}