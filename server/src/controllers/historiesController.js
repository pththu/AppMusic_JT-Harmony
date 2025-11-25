const { ListeningHistory, User, Playlist } = require('../models');
const SearchHistory = require('../models/search_history');
const Op = require('sequelize').Op;
const spotify = require('../configs/spotify');
const youtube = require('../configs/youtube');
const Bottleneck = require('bottleneck');
const { redisClient } = require('../configs/redis');

const DEFAULT_TTL_SECONDS = 3600 * 2; // 2 giờ (cho dữ liệu Spotify ít đổi)
const SHORT_TTL_SECONDS = 1800;

const limiter = new Bottleneck({
  minTime: 500,
  maxConcurrent: 1 // Chỉ chạy 1 request cùng lúc để an toàn tuyệt đối
});

const callSpotify = async (fn) => {
  return limiter.schedule(async () => {
    try {
      return await fn();
    } catch (error) {
      if (error.body) {
        console.error("🔥 Spotify Error Body:", JSON.stringify(error.body));
      }
      if (error.statusCode === 429) {
        const retryAfter = error.headers?.['retry-after'] || 1;
        console.warn(`⚠️ Gặp lỗi 429. Spotify bắt đợi: ${retryAfter}s`);
      }
      throw error;
    }
  });
}

const formatTrack = (track, artist, album, videoId) => {
  return {
    id: track?.tempId || (track?.spotifyId && track.id ? track.id : null),
    spotifyId: track?.spotifyId || (!track?.spotifyId ? track.id : null) || null,
    videoId: videoId || null,
    name: track?.name || null,
    artists: artist || [
      ...track?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist?.name || null,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null
      })) || [],
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


const GetAllListeningHistories = async (req, res) => {
  try {
    const histories = await ListeningHistory.findAll({
      include: [{ model: User, as: 'User' }]
    });
    console.log(histories)
    res.status(200).json({ message: 'Listening histories retrieved successfully', data: histories, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetListeningHistoryByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ListeningHistory.findByPk(id, {
      include: [{ model: User, as: 'User' }]
    });
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử' });
    }
    res.status(200).json({ message: 'Listening history retrieved successfully', data: history, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetListeningHistoriesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    const cacheKey = `user:${userId}:histories:listening`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('CACHE HIT (getHistoriesListeningByUserId)');
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log('CACHE MISS (getHistoriesListeningByUserId)');

    let dataFormated = [];
    let itemFormatted = null;
    const histories = await ListeningHistory.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 100
    });
    if (!histories || histories.length === 0) {
      return res.status(200).json({
        message: 'Listening histories retrieved successfully',
        data: [],
        success: true
      });
    }

    for (const history of histories) {
      const itemType = history.itemType;
      if (history.itemSpotifyId) {
        switch (itemType) {
          case 'track':
            const track = await callSpotify(() => spotify.findTrackById(history.itemSpotifyId));
            if (!track) {
              break;
            }
            itemFormatted = formatTrack(track);
            dataFormated.push({
              ...history.toJSON(),
              item: itemFormatted
            })
            break;
          case 'album':
            const album = await callSpotify(() => spotify.findAlbumById(history.itemSpotifyId));
            if (!album) {
              break;
            }
            itemFormatted = formatAlbum(album);
            dataFormated.push({
              ...history.toJSON(),
              item: itemFormatted
            })
            break;
          case 'artist':
            const artist = await callSpotify(() => spotify.findArtistById(history.itemSpotifyId));
            if (!artist) {
              break;
            }
            itemFormatted = formatArtist(artist);
            dataFormated.push({
              ...history.toJSON(),
              item: itemFormatted
            })
            break;
          case 'playlist':
            const playlist = await callSpotify(() => spotify.findPlaylistById(history.itemSpotifyId));
            if (!playlist) {
              break;
            }
            itemFormatted = formatPlaylist(playlist);
            dataFormated.push({
              ...history.toJSON(),
              item: itemFormatted
            })
            break;
          default:
            console.log(`Loại mục không xác định: ${itemType}`);
        }
      } else {
        if (itemType === 'playlist') {
          const playlist = await Playlist.findByPk(history.itemId, {
            include: [{ model: User }]
          });
          itemFormatted = formatPlaylist(playlist, playlist.User);
          dataFormated.push({
            ...history.toJSON(),
            item: itemFormatted
          })
        }
      }
    }

    const response = {
      message: 'Listening histories retrieved successfully',
      data: dataFormated,
      success: true
    }

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: SHORT_TTL_SECONDS });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const CreateOneListeningHistory = async (req, res) => {
  try {
    const { itemType, itemId, itemSpotifyId, durationListened } = req.body;

    console.log(req.body)
    if (!itemType || !(itemId || itemSpotifyId)) {
      return res.status(400).json({ message: 'Thiếu thông tin lịch sử nghe' });
    }

    let existingHistory;
    if (itemSpotifyId) {
      existingHistory = await ListeningHistory.findOne({
        where: {
          userId: req.user.id,
          itemType,
          itemSpotifyId: itemSpotifyId
        }
      });
    } else if (itemId) {
      existingHistory = await ListeningHistory.findOne({
        where: {
          userId: req.user.id,
          itemType,
          itemId: itemId
        }
      });
    }

    if (existingHistory) {
      console.log(1000000)
      if (existingHistory.itemType === 'track') {
        existingHistory.durationListened = durationListened;
        existingHistory.playCount += 1;
        existingHistory.updatedAt = new Date();
        await existingHistory.save();
        return res.status(200).json({
          message: 'Listening history updated successfully',
          data: existingHistory,
          success: true,
          updated: true
        });
      } else {
        return res.status(200).json({
          message: 'Listening history already exists',
          data: existingHistory,
          success: false,
          updated: false
        });
      }
    }

    const history = await ListeningHistory.create({
      userId: req.user.id,
      itemType,
      itemId,
      itemSpotifyId,
      ... (durationListened !== undefined ? { durationListened } : {})
    });

    switch (itemType) {
      case 'track':
        console.log('track')
        const track = await callSpotify(() => spotify.findTrackById(history.itemSpotifyId));
        if (!track) {
          break;
        }
        itemFormatted = formatTrack(track);
        break;
      case 'album':
        console.log('album')
        const album = await callSpotify(() => spotify.findAlbumById(history.itemSpotifyId));
        if (!album) {
          break;
        }
        itemFormatted = formatAlbum(album);
        break;
      case 'artist':
        console.log('artist')
        const artist = await callSpotify(() => spotify.findArtistById(history.itemSpotifyId));
        if (!artist) {
          break;
        }
        itemFormatted = formatArtist(artist);
        break;
      case 'playlist':
        console.log('playlist')
        const playlist = await callSpotify(() => spotify.findPlaylistById(history.itemSpotifyId));
        if (!playlist) {
          break;
        }
        itemFormatted = formatPlaylist(playlist);
        break;
      default:
        console.log(`Loại mục không xác định: ${itemType}`);
    }

    res.status(201).json({
      message: 'Listening history created successfully',
      data: {
        ...history.toJSON(),
        item: itemFormatted
      },
      success: true,
      updated: false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const GetAllSearchHistories = async (req, res) => {
  try {
    const histories = await SearchHistory.findAll({
    });
    res.status(200).json({
      message: 'Search histories retrieved successfully',
      data: histories,
      success: true
    });
  } catch (error) {
    console.error("Error fetching all search histories:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetSearchHistoryByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await SearchHistory.findByPk(id);

    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử tìm kiếm' });
    }

    res.status(200).json({
      message: 'Search history retrieved successfully',
      data: history,
      success: true
    });
  } catch (error) {
    console.error("Error fetching search history by ID:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- HÀM LẤY LỊCH SỬ TÌM KIẾM THEO USER ---
// Thường dùng cho người dùng hiện tại (req.user.id)
const GetSearchHistoriesByUserId = async (req, res) => {
  try {
    // Sử dụng req.user.id từ middleware xác thực (authenticateToken)
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    const histories = await SearchHistory.findAll({
      where: { userId: userId },
      order: [
        ['searchedAt', 'DESC'] // Sắp xếp giảm dần theo thời gian tìm kiếm
      ],
      limit: 20 // Giới hạn số lượng hiển thị gần đây
    });

    // Trả về 200 OK dù danh sách có rỗng, để client biết không có lịch sử
    res.status(200).json({
      message: 'Search histories retrieved successfully',
      data: histories,
      success: true
    });
  } catch (error) {
    console.error("Error fetching user's search histories:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 *  kiểm tra nếu truy vấn đã tồn tại -> update searchedAt
 *  nếu chưa tồn tại -> tạo mới
 */
const CreateOneSearchHistory = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ message: 'Thiếu nội dung tìm kiếm (query)' });
    }

    const existingHistory = await SearchHistory.findOne({
      where: {
        userId: req.user.id,
        query: { [Op.iLike]: query }
      }
    });

    let history;
    if (existingHistory) {
      existingHistory.searchedAt = new Date();
      await existingHistory.save();
      history = existingHistory;
    } else {
      history = await SearchHistory.create({
        userId: req.user.id,
        query: query.trim(),
        searchedAt: new Date()
      });
    }

    res.status(201).json({
      message: existingHistory ? 'Search history updated successfully' : 'Search history created successfully',
      data: history,
      success: true,
      updated: !!existingHistory
    });
  } catch (error) {
    console.error("Error creating search history:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DeleteSearchHistoryByPk = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params)
    const deletedCount = await SearchHistory.destroy({
      where: {
        id: id,
        userId: req.user.id
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử tìm kiếm này hoặc bạn không có quyền xóa' });
    }

    res.status(200).json({ message: 'Search history deleted successfully', success: true });
  } catch (error) {
    console.error("Error deleting search history:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DeleteAllSearchHistoriesByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await SearchHistory.destroy({
      where: { userId: userId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử tìm kiếm để xóa' });
    }

    res.status(200).json({ message: 'All search histories deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  GetAllListeningHistories,
  GetListeningHistoryByPk,
  GetListeningHistoriesByUserId,
  CreateOneListeningHistory,

  GetAllSearchHistories,
  GetSearchHistoryByPk,
  GetSearchHistoriesByUserId,
  CreateOneSearchHistory,
  DeleteSearchHistoryByPk,
  DeleteAllSearchHistoriesByUserId
};