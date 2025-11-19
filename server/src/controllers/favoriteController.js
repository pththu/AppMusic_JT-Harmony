const { FavoriteItem, User, Track, Album, Artist, Playlist } = require('../models');
const spotify = require('../configs/spotify');
const { redisClient } = require('../configs/redis');

const DEFAULT_TTL_SECONDS = 3600 * 2; // 2 giờ (cho dữ liệu Spotify ít đổi)
const ITEM_CACHE_TTL_SECONDS = 86400;

const formatTrack = (track, artist, album, videoId) => {
  return {
    id: track?.tempId || (track?.spotifyId && track.id ? track.id : null),
    spotifyId: track?.spotifyId || (!track?.spotifyId ? track.id : null) || null,
    videoId: videoId || null,
    name: track?.name || null,
    artists: [
      ...track?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist?.name || null,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null
      })) || artist || [],
    ],
    album: {
      spotifyId: track.album?.id || album?.spotifyId || null,
      name: track.album?.name || album?.name || null,
      imageUrl: track.album?.images?.[0]?.url || album?.imageUrl || null,
    },
    lyrics: track?.lyrics || null,
    duration: track?.duration_ms || track?.duration || 0,
    explicit: track?.explicit,
    trackNumber: track?.track_number || track?.trackNumber || null,
    discNumber: track?.disc_number || track?.discNumber || null,
    imageUrl: track?.album?.images?.[0]?.url || album?.imageUrl || null,
    playCount: track?.playCount || 0,
    shareCount: track?.shareCount || 0,
  }
};

const formatPlaylist = (playlist, owner) => {
  return {
    id: owner?.id ? playlist?.id : (!playlist?.spotifyId ? null : playlist?.id),
    spotifyId: owner?.id ? null : (!playlist?.spotifyId ? playlist?.id : playlist?.spotifyId),
    name: playlist.name,
    owner: {
      id: owner?.id || null,
      spotifyId: owner?.spotifyId || (!owner?.spotifyId ? playlist?.owner?.id : null) || null,
      name: playlist?.owner?.display_name || owner?.fullName || null,
    },
    description: playlist.description,
    imageUrl: playlist?.images?.[0]?.url || playlist?.imageUrl || null,
    totalTracks: playlist?.tracks?.total || playlist?.totalTracks || 0,
    isPublic: playlist?.public || playlist?.isPublic || false,
    type: playlist.type,
  }
}

const formatAlbum = (album, artists) => {
  return {
    id: album?.spotifyId && album.id ? album.id : null,
    spotifyId: album?.spotifyId || (!album?.spotifyId ? album.id : null) || null,
    name: album.name,
    artists: [
      ...album?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist.name,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null,
      })) || artists || [],
    ],
    imageUrl: album?.images?.[0]?.url || album?.imageUrl || null,
    releaseDate: album?.release_date ? new Date(album.release_date).toISOString() : null,
    totalTracks: album?.total_tracks || album?.totalTracks || 0,
    type: album.type,
  }
}

const formatArtist = (artist, genres) => {
  return {
    id: artist?.spotifyId && artist.id ? artist.id : null,
    spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
    name: artist.name,
    genres: genres || artist?.genres,
    imageUrl: artist?.images?.[0]?.url || artist?.imageUrl,
    type: artist?.type,
  }
}

const getFormattedTrack = async (favorite) => {
  const { id: favoriteId, itemId, itemSpotifyId, createdAt } = favorite;
  const cacheKey = `fav_item:track:${itemSpotifyId}`;

  // B1: Kiểm tra Item Cache
  try {
    const cachedItem = await redisClient.get(cacheKey);
    if (cachedItem) {
      const parsedItem = JSON.parse(cachedItem);
      // Thêm thông tin 'favoriteItem' (vì nó không được cache)
      parsedItem.favoriteItem = { id: favoriteId, createdAt };
      return parsedItem;
    }
  } catch (e) {
    console.error("Lỗi đọc item cache (track):", e.message);
  }

  // B2: Cache Miss, build lại
  let album = null;
  let artist = [];
  let track = null;

  if (itemSpotifyId) {
    track = await Track.findOne({
      where: { spotifyId: itemSpotifyId },
      include: [{ model: Album }, { model: Artist, as: 'artists' }]
    });
    const idTemp = track?.id || null;
    if (!track || !track.name) {
      track = await spotify.findTrackById(itemSpotifyId);
      if (idTemp) track.tempId = idTemp;
    } else {
      album = track.Album;
      artist = track.artists || [];
    }
  } else {
    track = await Track.findByPk(itemId, {
      include: [{ model: Album }, { model: Artist, as: 'artists' }]
    });
    album = track.Album;
    artist = track.artists || [];
  }

  if (!track) return null; // Không tìm thấy track

  const itemFormat = formatTrack(track, artist, album, track?.videoId || null);

  // B3: Lưu vào Item Cache (không lưu 'favoriteItem')
  try {
    await redisClient.set(cacheKey, JSON.stringify(itemFormat), { EX: ITEM_CACHE_TTL_SECONDS });
  } catch (e) {
    console.error("Lỗi ghi item cache (track):", e.message);
  }

  // B4: Thêm 'favoriteItem' và trả về
  itemFormat.favoriteItem = { id: favoriteId, createdAt };
  return itemFormat;
};

// --- (MỚI) HÀM HELPER LẤY ALBUM (CÓ CACHE TỪNG ITEM) ---
const getFormattedAlbum = async (favorite) => {
  const { id: favoriteId, itemId, itemSpotifyId, createdAt } = favorite;
  const cacheKey = `fav_item:album:${itemSpotifyId}`;

  // B1: Kiểm tra Item Cache
  try {
    const cachedItem = await redisClient.get(cacheKey);
    if (cachedItem) {
      const parsedItem = JSON.parse(cachedItem);
      parsedItem.favoriteItem = { id: favoriteId, createdAt };
      return parsedItem;
    }
  } catch (e) { console.error("Lỗi đọc item cache (album):", e.message); }

  // B2: Cache Miss
  let album = null;
  if (itemSpotifyId) {
    album = await spotify.findAlbumById(itemSpotifyId);
  } else {
    album = await Album.findByPk(itemId, { include: [{ model: Artist, as: 'artists' }] });
  }

  if (!album) return null;

  const itemFormat = formatAlbum(album, null);

  // B3: Lưu vào Item Cache
  try {
    await redisClient.set(cacheKey, JSON.stringify(itemFormat), { EX: ITEM_CACHE_TTL_SECONDS });
  } catch (e) { console.error("Lỗi ghi item cache (album):", e.message); }

  // B4: Trả về
  itemFormat.favoriteItem = { id: favoriteId, createdAt };
  return itemFormat;
};

// --- (MỚI) HÀM HELPER LẤY PLAYLIST (CÓ CACHE TỪNG ITEM) ---
const getFormattedPlaylist = async (favorite) => {
  const { id: favoriteId, itemId, itemSpotifyId, createdAt } = favorite;
  const cacheKey = `fav_item:playlist:${itemSpotifyId}`;

  // B1: Kiểm tra Item Cache
  try {
    const cachedItem = await redisClient.get(cacheKey);
    if (cachedItem) {
      const parsedItem = JSON.parse(cachedItem);
      parsedItem.favoriteItem = { id: favoriteId, createdAt };
      return parsedItem;
    }
  } catch (e) { console.error("Lỗi đọc item cache (playlist):", e.message); }

  // B2: Cache Miss
  let playlist = null;
  let owner = null;
  if (itemSpotifyId) {
    playlist = await spotify.findPlaylistById(itemSpotifyId);
  } else {
    playlist = await Playlist.findByPk(itemId, { include: [{ model: User }] });
    owner = playlist?.User || null;
  }

  if (!playlist) return null;

  const itemFormat = formatPlaylist(playlist, owner);

  // B3: Lưu vào Item Cache
  try {
    await redisClient.set(cacheKey, JSON.stringify(itemFormat), { EX: ITEM_CACHE_TTL_SECONDS });
  } catch (e) { console.error("Lỗi ghi item cache (playlist):", e.message); }

  // B4: Trả về
  itemFormat.favoriteItem = { id: favoriteId, createdAt };
  return itemFormat;
};



const GetAll = async (req, res) => {
  try {
    const favorites = await FavoriteItem.findAll({
      include: [{ model: User, as: 'User' }]
    });
    console.log(favorites)
    res.status(200).json({ message: 'Favorites retrieved successfully', data: favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get by pk
const GetByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const favorite = await FavoriteItem.findByPk(id, {
      include: [{ model: User, as: 'User' }]
    });
    if (!favorite) {
      return res.status(404).json({ message: 'Không tìm thấy mục yêu thích' });
    }
    res.status(200).json({ message: 'Favorite retrieved successfully', data: favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get by user id
const GetByUserId = async (req, res) => {
  try {
    const favorites = await FavoriteItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'User' }]
    });
    if (!favorites || favorites.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mục yêu thích của người dùng này' });
    }
    res.status(200).json({ message: 'Favorites retrieved successfully', data: favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// const GetItemsGroupedByType = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const favorites = await FavoriteItem.findAll({
//       where: { userId },
//       order: [['updatedAt', 'DESC']],
//       limit: 50
//     });

//     if (favorites.length === 0) {
//       return res.status(200).json({ message: 'Danh sách yêu thích trống', data: [] });
//     }

//     const itemIdsByType = { track: [], album: [], playlist: [] };

//     for (const favorite of favorites) {
//       const itemType = favorite.itemType;
//       if (itemType) {
//         itemIdsByType[itemType].push({
//           id: favorite.id,
//           itemId: favorite.itemId,
//           itemSpotifyId: favorite.itemSpotifyId,
//           createdAt: favorite.createdAt
//         });
//       }
//     }

//     const dataFormated = { tracks: [], albums: [], playlists: [] };

//     if (itemIdsByType.track) {
//       for (const item of itemIdsByType.track) {
//         const spotifyId = item?.itemSpotifyId;
//         const itemId = item?.itemId;
//         const uniqueFavoriteId = item?.id;
//         const createdAt = item?.createdAt;

//         let album = null;
//         let artist = [];
//         let track = null;
//         if (spotifyId) {
//           track = await Track.findOne({
//             where: { spotifyId },
//             include: [
//               { model: Album },
//               { model: Artist, as: 'artists' }
//             ]
//           });

//           const idTemp = track?.id || null;

//           if (!track || !track.name) {
//             track = await spotify.findTrackById(spotifyId);
//             if (idTemp) {
//               track.tempId = idTemp;
//             }
//           } else {
//             album = track.Album;
//             artist = [];
//             for (const a of track.artists) {
//               artist.push(a);
//             }
//           }
//           const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
//           itemFormat.favoriteItem = {
//             id: uniqueFavoriteId,
//             createdAt: createdAt
//           };
//           dataFormated.tracks.push(itemFormat);
//         } else {
//           track = await Track.findByPk(itemId, {
//             include: [
//               { model: Album },
//               { model: Artist, as: 'artists' }
//             ]
//           });

//           album = track.Album;
//           artist = [];
//           for (const a of track.artists) {
//             artist.push(a);
//           }

//           const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
//           itemFormat.favoriteItem = {
//             id: uniqueFavoriteId,
//             createdAt: createdAt
//           };
//           dataFormated.tracks.push(itemFormat);
//         }
//       }
//     }

//     if (itemIdsByType.album) {
//       for (const item of itemIdsByType.album) {
//         const spotifyId = item?.itemSpotifyId;
//         const itemId = item?.itemId;
//         const uniqueFavoriteId = item?.id;

//         if (spotifyId) {
//           const spotifyId = item.itemSpotifyId;
//           const uniqueFavoriteId = item.id;
//           const createdAt = item?.createdAt;

//           const album = await spotify.findAlbumById(spotifyId);
//           if (album) {
//             const itemFormat = formatAlbum(album, null);
//             itemFormat.favoriteItem = {
//               id: uniqueFavoriteId,
//               createdAt: createdAt
//             };
//             dataFormated.albums.push(itemFormat);
//           }
//         } else {
//           const album = await Album.findByPk(itemId, {
//             include: [
//               { model: Artist, as: 'artists' }
//             ]
//           });

//           if (album) {
//             const itemFormat = formatAlbum(album, null);
//             itemFormat.favoriteItem = {
//               id: uniqueFavoriteId,
//               createdAt: createdAt
//             };
//             dataFormated.albums.push(itemFormat);
//           }
//         }
//       }
//     }

//     if (itemIdsByType.playlist) {
//       for (const item of itemIdsByType.playlist) {
//         const spotifyId = item?.itemSpotifyId;
//         const itemId = item?.itemId;
//         const uniqueFavoriteId = item?.id;
//         const createdAt = item?.createdAt;
//         if (spotifyId) {
//           const playlist = await spotify.findPlaylistById(spotifyId);
//           if (playlist) {
//             const itemFormat = formatPlaylist(playlist, null);
//             itemFormat.favoriteItem = {
//               id: uniqueFavoriteId,
//               createdAt: createdAt
//             };
//             dataFormated.playlists.push(itemFormat);
//           }
//         } else {
//           const playlist = await Playlist.findByPk(itemId, { include: [{ model: User }] });
//           if (playlist) {
//             const itemFormat = formatPlaylist(playlist, playlist.User);
//             itemFormat.favoriteItem = {
//               id: uniqueFavoriteId,
//               createdAt: createdAt
//             };
//             dataFormated.playlists.push(itemFormat);
//           }
//         }
//       }
//     }

//     const trackMap = new Map(dataFormated.tracks.map(t => [t.favoriteItem.id, t]));
//     const albumMap = new Map(dataFormated.albums.map(a => [a.favoriteItem.id, a]));
//     const playlistMap = new Map(dataFormated.playlists.map(a => [a.favoriteItem.id, a]));

//     const combinedHistory = favorites.map(favorites => {
//       let itemDetail = null;
//       const id = favorites.id;

//       if (favorites.itemType === 'track') {
//         itemDetail = trackMap.get(id);
//       } else if (favorites.itemType === 'album') {
//         itemDetail = albumMap.get(id);
//       } else if (favorites.itemType === 'playlist') {
//         itemDetail = playlistMap.get(id);
//       }

//       if (itemDetail) {
//         return {
//           ...favorites.toJSON(),
//           item: itemDetail
//         };
//       }
//       return null;
//     }).filter(item => item !== null);

//     return res.status(200).json({
//       message: 'Danh sách yêu thích retrieved successfully',
//       data: combinedHistory,
//       success: true
//     });

//   } catch (error) {
//     console.error("Error retrieving grouped history:", error);
//     return res.status(500).json({ message: 'Internal server error.' });
//   }
// }


const GetItemsGroupedByType = async (req, res) => {
  const userId = req.user.id;
  // --- (CẬP NHẬT) Logic Đọc Cache (Lớp 1: Group Cache) ---
  const cacheKey = `favorites:grouped:${userId}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (LỚP 1 - GROUP): GetItemsGroupedByType');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (LỚP 1 - GROUP): GetItemsGroupedByType');
    // --- (HẾT) Logic Đọc Cache ---

    // --- (CẬP NHẬT) Logic Build Lại (Sử dụng Lớp 2: Item Cache) ---
    const favorites = await FavoriteItem.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 50
    });

    if (favorites.length === 0) {
      return res.status(200).json({ message: 'Danh sách yêu thích trống', data: [] });
    }

    // Phân loại task
    const trackTasks = [];
    const albumTasks = [];
    const playlistTasks = [];

    for (const favorite of favorites) {
      if (favorite.itemType === 'track') {
        trackTasks.push(getFormattedTrack(favorite));
      } else if (favorite.itemType === 'album') {
        albumTasks.push(getFormattedAlbum(favorite));
      } else if (favorite.itemType === 'playlist') {
        playlistTasks.push(getFormattedPlaylist(favorite));
      }
    }

    // Thực thi song song
    const [tracks, albums, playlists] = await Promise.all([
      Promise.all(trackTasks),
      Promise.all(albumTasks),
      Promise.all(playlistTasks),
    ]);

    // Lọc bỏ các kết quả null (nếu có lỗi)
    const dataFormated = {
      tracks: tracks.filter(Boolean),
      albums: albums.filter(Boolean),
      playlists: playlists.filter(Boolean)
    };

    // Tạo Map để sắp xếp lại (vì Promise.all không giữ thứ tự gốc)
    const itemMap = new Map();
    [...dataFormated.tracks, ...dataFormated.albums, ...dataFormated.playlists].forEach(item => {
      itemMap.set(item.favoriteItem.id, item);
    });

    // Sắp xếp lại theo thứ tự 'favorites' ban đầu (đã order 'updatedAt')
    const combinedHistory = favorites
      .map(favorite => {
        const itemDetail = itemMap.get(favorite.id);
        if (itemDetail) {
          return {
            ...favorite.toJSON(),
            item: itemDetail
          };
        }
        return null;
      })
      .filter(item => item !== null);

    // --- (CẬP NHẬT) Logic Viết Cache (Lớp 1: Group Cache) ---
    const responseData = {
      message: 'Danh sách yêu thích retrieved successfully',
      data: combinedHistory,
      success: true
    };
    // Cache lại kết quả tổng hợp
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // --- (HẾT) Logic Viết Cache ---

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Error retrieving grouped history:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


// const GetPlaylistFavorite = async (req, res) => {
//   try {
//     const dataFormated = [];

//     const favorites = await FavoriteItem.findAll({
//       where: { userId: req.user.id, itemType: 'playlist' }
//     });

//     if (!favorites || favorites.length === 0) {
//       return res.status(200).json({ message: 'Không tìm thấy mục yêu thích của người dùng này', success: true, data: [] });
//     }

//     for (const favorite of favorites) {
//       if (favorite?.itemSpotifyId) {
//         const playlist = await spotify.findPlaylistById(favorite.itemSpotifyId);
//         if (playlist) {
//           const playlistFormat = formatPlaylist(playlist, null);
//           dataFormated.push(playlistFormat);
//         }
//       } else if (favorite?.itemId) {
//         const playlist = await Playlist.findByPk(favorite.itemId, {
//           include: [{ model: User }]
//         });
//         if (playlist) {
//           const playlistFormat = formatPlaylist(playlist, playlist.User);
//           dataFormated.push(playlistFormat);
//         }
//       }
//     }

//     return res.status(200).json({
//       message: 'Danh sách yêu thích retrieved successfully',
//       success: true,
//       data: dataFormated
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const GetPlaylistFavorite = async (req, res) => {
  const userId = req.user.id;
  // --- (CẬP NHẬT) Logic Đọc Cache (Lớp 1: Group Cache) ---
  const cacheKey = `favorites:playlists:${userId}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (LỚP 1 - GROUP): GetPlaylistFavorite');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (LỚP 1 - GROUP): GetPlaylistFavorite');
    // --- (HẾT) Logic Đọc Cache ---

    // --- (CẬP NHẬT) Logic Build Lại (Sử dụng Lớp 2: Item Cache) ---
    const favorites = await FavoriteItem.findAll({
      where: { userId: req.user.id, itemType: 'playlist' }
    });

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({ message: 'Không tìm thấy mục yêu thích của người dùng này', success: true, data: [] });
    }

    // Tạo tasks
    const tasks = favorites.map(fav => getFormattedPlaylist(fav));
    // Thực thi song song
    const results = await Promise.all(tasks);
    // Lọc bỏ null và chỉ lấy phần 'item'
    const dataFormated = results.filter(Boolean).map(favItem => favItem.item);

    // --- (CẬP NHẬT) Logic Viết Cache (Lớp 1: Group Cache) ---
    const responseData = {
      message: 'Danh sách yêu thích retrieved successfully',
      success: true,
      data: dataFormated
    };
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: DEFAULT_TTL_SECONDS });
    // --- (HẾT) Logic Viết Cache ---

    return res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const CreateOne = async (req, res) => {
  try {
    const { itemType, itemId, itemSpotifyId } = req.body;
    const dataFormated = []
    let album = null;
    let track = null;
    let playlist = null;
    let artist = [];
    if (!itemType && (!itemId || !itemSpotifyId)) {
      console.log('thieu')
      return res.status(400).json({ message: 'Thiếu thông tin yêu thích' });
    }

    const favorite = await FavoriteItem.create({
      userId: req.user.id,
      itemType,
      itemId,
      itemSpotifyId
    });

    if (!favorite) {
      return res.status(500).json({ message: 'Thêm vào mục yêu thích thất bại' });
    }

    switch (itemType) {
      case 'track':
        artist = [];
        if (itemSpotifyId) {
          track = await Track.findOne({
            where: { spotifyId: itemSpotifyId },
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          const idTemp = track?.id || null;

          if (!track || !track.name) {
            track = await spotify.findTrackById(itemSpotifyId);
            if (idTemp) {
              track.tempId = idTemp;
            }
          } else {
            if (!track.Album) {
              console.log('teadsga')
              album = null;
              const albumSpotify = await spotify.findAlbumById(track.spotifyAlbumId);
              if (albumSpotify) {
                album = formatAlbum(albumSpotify, null);
              }
            } else {
              album = track.Album ? track.Album.toJSON() : null;
            }
            if (!track.artists || track.artists.length === 0) {
              artist = [];
              for (const artistSpotifyId of track.spotifyArtistIds || []) {
                const artistSpotify = await spotify.findArtistById(artistSpotifyId);
                if (artistSpotify) {
                  artist.push(formatArtist(artistSpotify, null));
                  console.log(artistSpotify.name)
                }
              }
            } else {
              artist = [];
              for (const a of track.artists) {
                artist.push(a);
              }
            }
          }
          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        } else {
          track = await Track.findByPk(itemId, {
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          album = track.Album;
          artist = [];
          for (const a of track.artists) {
            artist.push(a);
          }

          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      case 'album':
        album = await spotify.findAlbumById(itemSpotifyId);
        if (album) {
          const itemFormat = formatAlbum(album, null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      case 'playlist':
        playlist = await spotify.findPlaylistById(itemSpotifyId);
        if (playlist) {
          const itemFormat = formatPlaylist(playlist, null);
          itemFormat.favoriteItem = { id: favorite.id };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      default:
        return res.status(400).json({ message: 'Loại mục yêu thích không hợp lệ' });
    }

    const cacheKeyGrouped = `favorites:grouped:${req.user.id}`;
    const cacheKeyPlaylists = `favorites:playlists:${req.user.id}`;
    await redisClient.del(cacheKeyGrouped);
    if (itemType === 'playlist') {
      await redisClient.del(cacheKeyPlaylists);
    }
    console.log(`CACHE INVALIDATED (GROUP) for user: ${req.user.id}`);

    return res.status(201).json({
      message: 'Favorite created successfully',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DeleteOne = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const favorite = await FavoriteItem.findOne({ where: { id } });

    console.log(1)
    if (!favorite) {
      console.log(2)
      return res.status(404).json({ message: 'Không tìm thấy mục yêu thích', success: false });
    }

    console.log(3)
    // Lấy thông tin để Hủy Item Cache (Lớp 2)
    const { itemType, itemId, itemSpotifyId } = favorite;

    const row = await FavoriteItem.destroy({ where: { id } });
    if (!row) {
      console.log(4)
      return res.status(500).json({ message: 'Xóa mục yêu thích thất bại', success: false });
    }

    console.log(5)
    // --- (CẬP NHẬT) Logic Hủy Cache (Cả 2 Lớp) ---
    // 1. Hủy Group Cache (Lớp 1)
    const cacheKeyGrouped = `favorites:grouped:${userId}`;
    const cacheKeyPlaylists = `favorites:playlists:${userId}`;
    console.log(6)
    await redisClient.del(cacheKeyGrouped);
    console.log(7)
    if (itemType === 'playlist') {
      console.log(8)
      await redisClient.del(cacheKeyPlaylists);
    }
    console.log(9)
    console.log(`CACHE INVALIDATED (GROUP) for user: ${userId}`);

    console.log(10)
    // 2. Hủy Item Cache (Lớp 2)
    let itemCacheKey = null;
    if (itemType === 'track') {
      console.log(11)
      itemCacheKey = `fav_item:track:${itemSpotifyId}`;
    } else if (itemType === 'album') {
      console.log(12)
      itemCacheKey = `fav_item:album:${itemSpotifyId}`;
    } else if (itemType === 'playlist') {
      console.log(13)
      itemCacheKey = `fav_item:playlist:${itemSpotifyId}`;
    }

    console.log(14)
    if (itemCacheKey) {
      console.log(15)
      await redisClient.del(itemCacheKey);
      console.log(`CACHE INVALIDATED (ITEM) for: ${itemCacheKey}`);
    }
    // --- (HẾT) Logic Hủy Cache ---

    console.log(16)
    return res.status(201).json({ message: 'Đã xóa khỏi mục yêu thích', success: true });
  } catch (error) {
    console.log(17)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  GetAll,
  GetByPk,
  GetByUserId,
  GetItemsGroupedByType,
  GetPlaylistFavorite,
  CreateOne,
  DeleteOne,
};