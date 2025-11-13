const { ListeningHistory, User } = require('../models');
const SearchHistory = require('../models/search_history');
const Op = require('sequelize').Op;

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
    const histories = await ListeningHistory.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'User' }]
    });
    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử của người dùng này' });
    }
    res.status(200).json({ message: 'Listening histories retrieved successfully', data: histories, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const CreateOneListeningHistory = async (req, res) => {
  try {
    const { itemType, itemId, itemSpotifyId, durationListened } = req.body;
    if (!itemType && (!itemId || !itemSpotifyId)) {
      return res.status(400).json({ message: 'Thiếu thông tin lịch sử nghe' });
    }

    if (!durationListened) {
      durationListened = 0;
    }
    const history = await ListeningHistory.create({
      userId: req.user.id,
      itemType,
      itemId,
      itemSpotifyId,
      durationListened: durationListened
    });
    res.status(201).json({ message: 'Listening history created successfully', data: history, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const GetAllSearchHistories = async (req, res) => {
  try {
    // Chỉ nên dành cho Admin hoặc Dev Tool
    const histories = await SearchHistory.findAll({
      // Có thể include User nếu đã thiết lập Association
      // include: [{ model: User, as: 'User' }]
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

// --- HÀM LẤY LỊCH SỬ TÌM KIẾM THEO ID ---
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
    const userId = req.user.id;

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