require('dotenv').config();
const axios = require('axios');
const { DATE } = require('sequelize');
const { format } = require('sequelize/lib/utils');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

let accessToken = null;

const formatTrack = (track) => ({
  id: track.id,
  name: track.name,
  artists: [
    ...track.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
    })),
  ],
  album: {
    id: track.album.id,
    name: track.album.name,
    imageUrl: track.album.images[0]?.url,
  },
  duration: track.duration_ms,
  href: track.href,
  type: track.type,
  explicit: track.explicit,
  trackNumber: track.track_number,
  uri: track.uri,
  externalUrl: track.external_urls.spotify,
});

const formatPlaylist = (playlist) => ({
  spotifyId: playlist.id,
  name: playlist.name,
  owner: playlist.owner.name,
  description: playlist.description,
  imageUrl: playlist.images[0]?.url,
  totalTracks: playlist.tracks.total,
  isPublic: playlist.public,
  type: playlist.type,
});

const formatAlbum = (album) => ({
  spotifyId: album.id,
  name: album.name,
  artists: [...album.artists.map(artist => artist.name)],
  imageUrl: album.images[0]?.url,
  releaseDate: album.release_date ? new Date(album.release_date).toISOString() : null,
  totalTracks: album.total_tracks,
  externalUrl: album.external_urls.spotify,
  type: album.type,
});

const formatArtist = (artist) => ({
  spotifyId: artist.id,
  name: artist.name,
  genres: artist.genres,
  imgUrl: artist.images[0]?.url,
  totalFollowers: artist.followers.total,
  type: artist.type,
});

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

/* Lấy token lần đầu và tự động làm mới sau mỗi 55 phút và Làm mới trước khi hết hạn (thường là 60 phút) */
getAccessToken();
setInterval(getAccessToken, 1000 * 60 * 55);

/* Hàm trợ giúp để thực hiện một yêu cầu GET đã được xác thực tới Spotify API */
const spotifyApiRequest = async (endpoint, params = {}) => {
  if (!accessToken) {
    throw new Error('Spotify access token is not available.');
  }

  console.log('params', params);
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      ...(params ? { params: params } : {})
    });
    return response.data;
  } catch (err) {
    console.error(`Error calling Spotify API endpoint ${endpoint}:`, err.response ? err.response.data : err.message);
    throw err;
  }
};

const findTrackById = async (trackId) => formatTrack(await spotifyApiRequest(`/tracks/${trackId}`));
const findArtistById = async (artistId) => formatArtist(await spotifyApiRequest(`/artists/${artistId}`));
const findAlbumById = async (albumId) => formatAlbum(await spotifyApiRequest(`/albums/${albumId}`));
const findPlaylistById = async (playlistId) => formatPlaylist(await spotifyApiRequest(`/playlists/${playlistId}`));

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
    const formattedTracks = tracksData.tracks.items.map(formatTrack);
    return formattedTracks;
  } catch (error) {
    console.error(`Error searching Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

/** Hàm để tìm id playlist từ tên playlist 
 * B1. Vòng lặp cho đến khi không còn trang tiếp theo (nextUrl không phải là null)
 * B2. Lọc bỏ các item null trong trang hiện tại
 * B3. Thêm các playlist hợp lệ vào mảng tổng
 * B4. Cập nhật nextUrl cho vòng lặp tiếp theo
 */
const searchPlaylists = async (query) => {
  let allPlaylists = [];
  let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`; // Bắt đầu với URL đầu tiên
  console.log(`Bắt đầu tìm kiếm tất cả playlist cho query: "${query}"`);

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
      console.log(`Đã lấy được ${validItems.length} playlist. Tổng cộng: ${allPlaylists.length}. Đang tải trang tiếp theo...`);
    }

    console.log(`Tìm kiếm hoàn tất! Tổng cộng tìm thấy ${allPlaylists.length} playlist.`);
    console.log(allPlaylists[0])
    return allPlaylists.map((playlist) => formatPlaylist(playlist));
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm playlist trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const searchAlbums = async (query) => {
  let allAlbums = [];
  let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=50`; // Bắt đầu với URL đầu tiên
  console.log(`Bắt đầu tìm kiếm tất cả album cho query: "${query}"`);

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
      console.log(`Đã lấy được ${validItems.length} album. Tổng cộng: ${allAlbums.length}. Đang tải trang tiếp theo...`);
    }

    console.log(`Tìm kiếm hoàn tất! Tổng cộng tìm thấy ${allAlbums.length} album.`);
    return allAlbums.map((album) => formatAlbum(album));
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm album trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchArtists = async (query) => {
  try {
    let allArtists = [];
    let nextUrl = `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=50`; // Bắt đầu với URL đầu tiên
    console.log(`Bắt đầu tìm kiếm tất cả nghệ sĩ cho query: "${query}"`);

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const artistPage = response.data.artists;
      const validItems = artistPage.items.filter(Boolean);
      allArtists = allArtists.concat(validItems);
      nextUrl = artistPage.next;
      console.log(`Đã lấy được ${validItems.length} nghệ sĩ. Tổng cộng: ${allArtists.length}. Đang tải trang tiếp theo...`);
    }

    return allArtists.map((artist) => formatArtist(artist));
  } catch (error) {
    console.error(`Error searching artists on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

// unfinished
const searchTop50Tracks = async (playlistId) => {
  try {
    console.log(playlistId)
    const tracksData = await axios.get(`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    console.log('tracksData.tracks', tracksData)
    // const formattedTracks = tracksData.tracks.items.map(formatTrack);
    return tracksData;
  } catch (error) {
    console.error(`Error searching top 50 tracks on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getPlaylistTracks = async (playlistId) => {
  try {
    const tracksData = await spotifyApiRequest(`/playlists/${playlistId}/tracks`);
    return tracksData.items.map(item => ({
      spotifyId: item.track.id,
      name: item.track.name,
      lyrics: "",
      externalUrl: item.track.external_urls.spotify,
      duration: item.track.duration_ms,
      artists: [...item.track.artists.map(artist => artist.name)],
      album: item.track.album.name,
      discNumber: item.track.disc_number,
      trackNumber: item.track.track_number,
      type: item.track.type,
      explicit: item.track.explicit,
      playCount: 0,
      shareCount: 0
    }));
  } catch (error) {
    console.error(`Error getting tracks from playlist on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAlbumTracks = async (albumId, albumName) => {
  try {
    const tracksData = await spotifyApiRequest(`/albums/${albumId}/tracks`);
    return tracksData.items.map(item => ({
      spotifyId: item.id,
      name: item.name,
      lyrics: "",
      externalUrl: item.external_urls.spotify,
      duration: item.duration_ms,
      artists: [...item.artists.map(artist => artist.name)],
      album: albumName,
      discNumber: item.disc_number,
      trackNumber: item.track_number,
      type: item.type,
      explicit: item.explicit,
      playCount: 0,
      shareCount: 0
    }));
  } catch (error) {
    console.error(`Error getting album tracks from Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

// unfinished
const getArtistTopTracks = async (artistId) => {
  return await spotifyApiRequest(`/artists/${artistId}/top-tracks`, {
    market: 'VN', // Bắt buộc phải có mã quốc gia
  });
};


module.exports = {
  searchTop50Tracks,
  searchTracks,
  searchAlbums,
  searchPlaylists,
  searchArtists,
  getArtistTopTracks,
  getPlaylistTracks,
  getAlbumTracks,
  findAlbumById
};