const { ListeningHistory, User, Playlist } = require('../models');
const SearchHistory = require('../models/search_history');
const Op = require('sequelize').Op;
const spotify = require('../configs/spotify');
const youtube = require('../configs/youtube');
const Bottleneck = require('bottleneck');
const { redisClient } = require('../configs/redis');
const { formatUser, formatTrack, formatPlaylist, formatAlbum, formatArtist, formatHisoryListening } = require('../utils/formatter');

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

const GetAllListeningHistories = async (req, res) => {
  try {
    // const cacheKey = `histories:listening:all`;
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   console.log('CACHE HIT (getAllListeningHistories)');
    //   return res.status(200).json(JSON.parse(cachedData));
    // }

    const histories = await ListeningHistory.findAll();

    if (!histories || histories.length === 0) {
      return res.status(200).json({
        message: 'Listening histories retrieved successfully',
        data: [],
        success: true
      });
    }


    console.log(histories)
    const response = {
      message: 'Listening histories retrieved successfully',
      data: histories,
      success: true
    };

    // await redisClient.set(cacheKey, JSON.stringify(response), { EX: DEFAULT_TTL_SECONDS });
    res.status(200).json(response);
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
      existingHistory.playCount += 1;
      existingHistory.updatedAt = new Date();
      if (existingHistory.itemType === 'track') {
        existingHistory.durationListened = durationListened;
      }
      await existingHistory.save();
      return res.status(200).json({
        message: 'Listening history updated successfully',
        data: existingHistory,
        success: true,
        updated: true
      });
    }

    const history = await ListeningHistory.create({
      userId: req?.user.id,
      itemType,
      itemId,
      itemSpotifyId,
      ... (durationListened !== undefined ? { durationListened } : {})
    });

    if (!history) {
      return res.status(500).json({ message: 'Không thể tạo lịch sử nghe' });
    }

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