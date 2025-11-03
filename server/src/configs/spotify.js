require('dotenv').config();
const axios = require('axios');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

let accessToken = null;

/** Lấy Access Token từ Spotify để xác thực các yêu cầu API. */
const getAccessToken = async () => {
  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    accessToken = response.data.access_token;
    console.log('Spotify access token has been refreshed!');
  } catch (err) {
    console.error('Error retrieving Spotify access token:', err.response ? err.response.data : err.message);
    accessToken = null;
  }
};

/* Lấy token lần đầu và tự động làm mới sau mỗi 55 phút và Làm mới trước khi hết hạn */
getAccessToken();
setInterval(getAccessToken, 1000 * 60 * 55);

/* Hàm trợ giúp để thực hiện một yêu cầu GET đã được xác thực tới Spotify API */
const spotifyApiRequest = async (endpoint, params = {}) => {
  if (!accessToken) {
    throw new Error('Spotify access token is not available.');
  }

  try {
    const response = await axios.get(`${SPOTIFY_API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      ...(params ? { params: params } : {})
    });
    return response.data;
  } catch (err) {
    console.error(`Error calling Spotify API endpoint ${endpoint}:`, err.response ? err.response.data : err.message);
    throw err;
  }
};

const findTrackById = async (trackId) => await spotifyApiRequest(`/tracks/${trackId}`);
const findArtistById = async (artistId) => await spotifyApiRequest(`/artists/${artistId}`);
const findAlbumById = async (albumId) => await spotifyApiRequest(`/albums/${albumId}`);
const findPlaylistById = async (playlistId) => await spotifyApiRequest(`/playlists/${playlistId}`);

/**
 * Tìm kiếm bài hát hoặc nhiều bài hát trên Spotify
 * @param {*} query: string
 * @param {*} type: string
 * @param {*} limit: number | null
 * @returns list bài hát đã được format
 */
const searchTracks = async (query, type, limit = null) => {
  try {
    const tracksData = await spotifyApiRequest('/search', {
      q: query,
      type: type,
      ...(limit ? { limit: limit } : {})
    });
    return tracksData.tracks.items;
  } catch (error) {
    console.error(`Error searching Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchPlaylists = async (searchParams, limit) => {
  const { name, artist } = searchParams;
  let queryParts = [];
  if (name) queryParts.push(`playlist:${name}`);
  if (artist) {
    if (Array.isArray(artist)) {
      artist.forEach(art => queryParts.push(`artist:${art}`));
    } else {
      queryParts.push(`artist:${artist}`);
    }
  }

  const query = queryParts.join(' ');

  let allPlaylists = [];
  let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`; // Bắt đầu với URL đầu tiên

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const playlistsPage = response.data.playlists;
      const validItems = playlistsPage.items.filter(Boolean);
      allPlaylists = allPlaylists.concat(validItems);
      nextUrl = playlistsPage.next;
      if (allPlaylists.length >= 3) {
        break;
      }
    }

    return shuffle(allPlaylists).slice(0, 20).map((playlist) => playlist);
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm playlist trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const searchAlbums = async (searchParams) => {
  const { name, artist } = searchParams;
  let queryParts = [];
  if (name) queryParts.push(`album:${name}`);
  if (artist) queryParts.push(`artist:${artist}`);

  const query = queryParts.join(' ');

  let allAlbums = [];
  let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=25`; // Bắt đầu với URL đầu tiên

  try {
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const albumPage = response.data.albums;
      const validItems = albumPage.items.filter(Boolean);
      allAlbums = allAlbums.concat(validItems);
      nextUrl = albumPage.next;
      if (allAlbums.length >= 3) {
        break;
      }
    }

    return shuffle(allAlbums).slice(0, 20).map((album) => album);
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm album trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchArtists = async (query) => {
  try {
    let allArtists = [];
    let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=30`; // Bắt đầu với URL đầu tiên

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const artistPage = response.data.artists;
      const validItems = artistPage.items.filter(item => {
        const invalidNames = ["Object Object", "[object Object]"];
        if (!item) return false;

        const itemName = item.name;
        if (!itemName) return false;

        const lowerCaseName = String(itemName).toLowerCase();
        const isInvalid = invalidNames.some(invalid => lowerCaseName.includes(invalid.toLowerCase()));

        return !isInvalid;
      });

      allArtists = allArtists.concat(validItems);
      nextUrl = artistPage.next;
      if (allArtists.length >= 3) {
        break;
      }
    }

    return allArtists.slice(0, 12).map((artist) => artist);
  } catch (error) {
    console.error(`Error searching artists on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const getPlaylistTracks = async (playlistId) => {
  let allTracks = [];
  let nextUrl = `/playlists/${playlistId}/tracks?limit=100`;
  try {
    while (nextUrl) {
      const tracksPage = await spotifyApiRequest(nextUrl);

      const validTracks = tracksPage.items
        .filter(item => item && item.track && item.track.name)
        .map(item => item.track);

      allTracks = allTracks.concat(validTracks);
      nextUrl = tracksPage.next ? tracksPage.next.replace('https://api.spotify.com/v1', '') : null;

    }
    return allTracks;
  } catch (error) {
    console.error(`Error getting tracks from playlist on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAlbumTracks = async (albumId) => {
  try {
    const tracksData = await spotifyApiRequest(`/albums/${albumId}/tracks`);
    return tracksData.items.map(item => item);
  } catch (error) {
    console.error(`Error getting album tracks from Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }
  return array;
}

module.exports = {
  searchTracks,
  searchAlbums,
  searchPlaylists,
  searchArtists,
  getPlaylistTracks,
  getAlbumTracks,
  findAlbumById,
  findPlaylistById,
  findTrackById,
  findArtistById
};