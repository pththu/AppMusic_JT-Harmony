const { Playlist } = require('../models');

exports.getAllPlaylist = async (req, res) => {
  try {
    const rows = await Playlist.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const row = await Playlist.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Playlist not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOne = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    let imageUrl = null;

    console.log(req.body);
    console.log(1)
    if (!req.file || !req.file.path) {
      console.log(2)
      imageUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/playlist_default.png';
    } else {
      console.log(3)
      imageUrl = req.file.path;
    }
    
    if (!name) {
      console.log(4)
      return res.status(400).json({ error: 'Tên là bắt buộc' });
    }
    
    if (description && description.length > 500) {
      console.log(5)
      return res.status(400).json({ error: 'Mô tả không được vượt quá 500 ký tự' });
    }
    
    console.log(6)
    const row = await Playlist.create({ name, description, imageUrl, isPublic, userId: req.user.id });
    console.log(7)
    res.status(201).json({
      message: 'Tạo danh sách phát thành công',
      playlist: row,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const [updated] = await Playlist.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Playlist not found' });
    const row = await Playlist.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const deleted = await Playlist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Playlist not found' });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


