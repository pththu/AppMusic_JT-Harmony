const { Artist } = require('../models');

// Lấy tất cả artist
exports.getAll = async (req, res) => {
  try {
    const artists = await Artist.findAll();
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy artist theo id
exports.getById = async (req, res) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo artist mới
exports.create = async (req, res) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật artist
exports.update = async (req, res) => {
  try {
    const [updated] = await Artist.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Artist not found' });
    const updatedArtist = await Artist.findByPk(req.params.id);
    res.json(updatedArtist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa artist
exports.delete = async (req, res) => {
  try {
    const deleted = await Artist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Artist not found' });
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
