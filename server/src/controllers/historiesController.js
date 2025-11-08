const { ListeningHistory, User } = require('../models');

const GetAll = async (req, res) => {
  try {
    const histories = await ListeningHistory.findAll({
      include: [{ model: User, as: 'User' }]
    });
    console.log(histories)
    res.status(200).json({ message: 'Listening histories retrieved successfully', data: histories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ListeningHistory.findByPk(id, {
      include: [{ model: User, as: 'User' }]
    });
    if (!history) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử' });
    }
    res.status(200).json({ message: 'Listening history retrieved successfully', data: history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetByUserId = async (req, res) => {
  try {
    const histories = await ListeningHistory.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'User' }]
    });
    if (!histories || histories.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch sử của người dùng này' });
    }
    res.status(200).json({ message: 'Listening histories retrieved successfully', data: histories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const CreateOne = async (req, res) => {
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
    res.status(201).json({ message: 'Listening history created successfully', data: history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
module.exports = {
  GetAll,
  GetByPk,
  GetByUserId,
  CreateOne
};