require('dotenv').config();
const axios = require('axios');
const { response } = require('express');
const { CATEGORY_SEARCH_STRATEGIES, INVALID_NAMES, BAD_WORDS } = require('./constants');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';


/**
 * Kiểm tra xem chuỗi có chứa các từ cấm hoặc tên không hợp lệ không.
 * @param {string} name - Tên của mục (Track, Album,...)
 * @returns {boolean} True nếu chứa từ cấm hoặc tên không hợp lệ.
 */
const isBadWordFound = (name) => {
  if (!name) return true;
  const lowerCaseName = String(name).toLowerCase();

  // 1. Lọc tên không hợp lệ
  if (INVALID_NAMES.some(invalid => lowerCaseName.includes(invalid.toLowerCase()))) {
    return true;
  }

  // 2. Lọc từ cấm (bad words)
  return BAD_WORDS.some(word => lowerCaseName.includes(word.toLowerCase()));
};

let accessToken = null;

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

getAccessToken(); /* Lấy token lần đầu và tự động làm mới sau mỗi 55 phút và Làm mới trước khi hết hạn */
setInterval(getAccessToken, 1000 * 60 * 55);

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

const findTrackById = async (trackId) => {
  const data = await spotifyApiRequest(`/tracks/${trackId}`);
  
  if (isBadWordFound(data?.name)) {
    return null;
  }
  return data;
};

const findArtistById = async (artistId) => {
  const data = await spotifyApiRequest(`/artists/${artistId}`);
  if (isBadWordFound(data?.name)) {
    return null;
  }
  return data;
};
const findAlbumById = async (albumId) => {
  const data = await spotifyApiRequest(`/albums/${albumId}`);
  if (isBadWordFound(data?.name)) {
    return null;
  }
  return data;
};
const findPlaylistById = async (playlistId) => {
  const data = await spotifyApiRequest(`/playlists/${playlistId}`);
  if (isBadWordFound(data?.name) || isBadWordFound(data?.description)) {
    return null;
  }
  return data;
};

const searchTracks = async (query, type, limit = null) => {
  try {
    const tracksData = await spotifyApiRequest('/search', {
      q: query,
      type: type,
      ...(limit ? { limit: limit } : {})
    });
    const validItems = tracksData.tracks.items.filter(item => !isBadWordFound(item?.name));
    return validItems;
  } catch (error) {
    console.error(`Error searching Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchPlaylists = async (query, limit = null) => {
  try {
    const playlistsData = await spotifyApiRequest('/search', {
      q: query,
      type: 'playlist',
      ...(limit ? { limit: limit } : {})
    });

    const validItems = playlistsData.playlists.items.filter(item => {
      return !isBadWordFound(item?.name) && !isBadWordFound(item?.description);
    });
    return validItems;
  } catch (error) {
    console.log('error seach spotify: ', error.message);
    throw error;
  }
}

const searchAlbums = async (query, limit = 15) => {
  try {
    const albumsData = await spotifyApiRequest('/search', {
      q: query,
      type: 'album',
      limit: limit
    });
    const validItems = albumsData.albums.items.filter(item => !isBadWordFound(item?.name));
    return validItems;
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm album trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchArtists = async (query) => {
  try {
    let allArtists = [];
    let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=50`;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const artistPage = response.data.artists;
      const validItems = artistPage.items.filter(item => !isBadWordFound(item?.name));
      allArtists = allArtists.concat(validItems);
      nextUrl = artistPage.next;
    }

    return allArtists;

  } catch (error) {
    console.error(`Error searching artists on Spotify for query "${query}":`, error.response ? error.response.data : error.message);
    return [];
  }
}

const searchArtistsAdvanced = async (category, limit = 50) => {
  try {
    const categoryUpper = category.toUpperCase();
    const strategy = CATEGORY_SEARCH_STRATEGIES[categoryUpper];

    if (!strategy) {
      return await searchArtists(category);
    }

    let allArtists = [];
    const seenIds = new Set();

    const filterAndAddArtists = (artists) => {
      const filtered = artists.filter(item => {
        if (!item || !item.id || seenIds.has(item.id)) return false;
        if (isBadWordFound(item.name)) return false; // Lọc tên nghệ sĩ
        seenIds.add(item.id);
        return true;
      });
      allArtists.push(...filtered);
    };

    if (strategy.useGenreFilter) {
      for (const genreFilter of strategy.genreFilters) {
        try {
          const query = `genre:"${genreFilter}"`;
          console.log(`Searching with genre filter: ${query}`);

          const response = await axios.get(
            `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }
          );
          filterAndAddArtists(response.data.artists.items);
        } catch (err) {
          console.error(`Genre filter failed for "${genreFilter}":`, err.message);
        }
      }
    }

    // Strategy 2: Text search (always do this for more results)
    for (const searchQuery of strategy.searchQueries) {
      try {
        console.log(`Searching with text: ${searchQuery}`);

        const response = await axios.get(
          `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=${limit}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );
        filterAndAddArtists(response.data.artists.items);
      } catch (err) {
        console.error(`Text search failed for "${searchQuery}":`, err.message);
      }
    }

    // Strategy 3: Filter by genre match (post-processing)
    const filteredArtists = allArtists.filter(artist => {
      if (!artist.genres || artist.genres.length === 0) return true;
      return artist.genres.some(g => {
        const genreLower = g.toLowerCase();
        return strategy.searchQueries.some(q =>
          genreLower.includes(q.toLowerCase())
        ) || strategy.genreFilters.some(gf =>
          genreLower.includes(gf.toLowerCase())
        );
      });
    });

    return filteredArtists.sort((a, b) =>
      (b.popularity || 0) - (a.popularity || 0)
    ).slice(0, limit);

  } catch (error) {
    console.error(`Error in searchArtistsAdvanced:`, error.message);
    return [];
  }
};

const getPlaylistTracks = async (playlistId) => {
  let allTracks = [];
  let nextUrl = `/playlists/${playlistId}/tracks?limit=100`;
  try {
    while (nextUrl) {
      const tracksPage = await spotifyApiRequest(nextUrl);

      const validTracks = tracksPage.items
        .filter(item => item && item.track && !isBadWordFound(item.track.name))
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
    return tracksData.items.filter(item => !isBadWordFound(item.name));
  } catch (error) {
    console.error(`Error getting album tracks from Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const getArtistTopTracks = async (artistId) => {
  try {
    const response = await spotifyApiRequest(`/artists/${artistId}/top-tracks`, { market: 'VN' });
    return response.tracks.filter(track => !isBadWordFound(track.name));
  } catch (error) {
    console.error(`Error getting top tracks for artist ${artistId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getArtistAlbums = async (artistId) => {
  let allAlbums = [];
  let nextUrl = `/artists/${artistId}/albums?include_groups=album,single&limit=50`;

  try {
    for (let i = 0; i < 2; i++) {
      if (!nextUrl) break;
      const response = await spotifyApiRequest(nextUrl);

      if (response.items && response.items) {
        const validAlbums = response.items.filter(album => !isBadWordFound(album.name));
        allAlbums = allAlbums.concat(validAlbums);
      }
      nextUrl = response.next ? response.next.replace('https://api.spotify.com/v1', '') : null;
    }

    return allAlbums;
  } catch (error) {
    console.error(`Error getting albums for artist ${artistId}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};


module.exports = {
  searchTracks,
  searchAlbums,
  searchPlaylists,
  searchArtists,
  getPlaylistTracks,
  getAlbumTracks,
  getArtistTopTracks,
  getArtistAlbums,
  findAlbumById,
  findPlaylistById,
  findTrackById,
  findArtistById,
  searchArtistsAdvanced,
};