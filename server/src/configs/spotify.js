require('dotenv').config();
const axios = require('axios');
const { DATE } = require('sequelize');
const { format } = require('sequelize/lib/utils');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

let accessToken = null;

const formatTrack = (track) => ({
  spotifyId: track.id,
  videoId: null,
  name: track.name,
  artists: [
    ...track.artists.map(artist => ({
      spotifyId: artist.id,
      name: artist.name,
    })),
  ],
  album: {
    spotifyId: track.album.id,
    name: track.album.name,
    imageUrl: track.album.images[0]?.url,
  },
  duration: track.duration_ms,
  href: track.href,
  type: track.type,
  explicit: track.explicit,
  trackNumber: track.track_number,
  discNumber: track.disc_number,
  uri: track.uri,
  externalUrl: track.external_urls.spotify,
  imageUrl: track.album.images[0]?.url,
  playCount: 0,
  shareCount: 0,
});

const formatPlaylist = (playlist) => ({
  id: null,
  spotifyId: playlist.id,
  name: playlist.name,
  owner: {
    spotifyId: playlist.owner.id,
    name: playlist.owner.display_name,
  },
  description: playlist.description,
  imageUrl: playlist.images[0]?.url,
  totalTracks: playlist.tracks.total,
  isPublic: playlist.public,
  type: playlist.type,
});

const formatAlbum = (album) => ({
  spotifyId: album.id,
  name: album.name,
  artists: [
    ...album.artists.map(artist => ({
      spotifyId: artist.id,
      name: artist.name
    })),
  ],
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
const searchPlaylists = async (query, limit) => {
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
      if (allPlaylists.length >= 3) {
        console.log('Đã đủ số lượng, dừng tìm kiếm thêm.');
        break;
      }
    }

    console.log(`Tìm kiếm hoàn tất! Tổng cộng tìm thấy ${allPlaylists.length} playlist.`);
    console.log(allPlaylists[0])
    return shuffle(allPlaylists).slice(0, limit).map((playlist) => formatPlaylist(playlist));
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm playlist trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const searchAlbums = async (query, limit) => {
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
      if (allAlbums.length >= 3) {
        console.log('Đã đủ số lượng, dừng tìm kiếm thêm.');
        break;
      }
    }

    console.log(`Tìm kiếm hoàn tất! Tổng cộng tìm thấy ${allAlbums.length} album.`);
    return shuffle(allAlbums).slice(0, limit).map((album) => formatAlbum(album));
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm album trên Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchArtists = async (query, limit) => {
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
      if (allArtists.length >= limit) {
        console.log('Đã đủ số lượng, dừng tìm kiếm thêm.');
        break;
      }
    }

    return allArtists.slice(0, limit).map((artist) => formatArtist(artist));
  } catch (error) {
    console.error(`Error searching artists on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
}

const getPlaylistTracks = async (playlistId) => {
  try {
    const tracksData = await spotifyApiRequest(`/playlists/${playlistId}/tracks`);
    return tracksData.items.map(item => formatTrack(item.track));
  } catch (error) {
    console.error(`Error getting tracks from playlist on Spotify:`, error.response ? error.response.data : error.message);
    throw error;
  }
};

const getAlbumTracks = async (albumId) => {
  try {
    const tracksData = await spotifyApiRequest(`/albums/${albumId}/tracks`);
    return tracksData.items.map(item => ({
      spotifyId: item.id,
      name: item.name,
      lyrics: "",
      externalUrl: item.external_urls.spotify,
      duration: item.duration_ms,
      artists: [
        ...item.artists.map(artist => ({
          spotifyId: artist.id,
          name: artist.name,
        })),
      ],
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

const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  // Lặp khi vẫn còn phần tử để xáo trộn
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Và hoán đổi nó với phần tử hiện tại
    // (Sử dụng cú pháp ES6 để hoán đổi)
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
  findAlbumById
};