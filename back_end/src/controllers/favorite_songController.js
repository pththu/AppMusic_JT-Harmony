const { FavoriteSong } = require('../models');

exports.getAllFavoriteSong = async (req, res) => {
  try {
    const rows = await FavoriteSong.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavoriteSongById = async (req, res) => {
  try {
    const row = await FavoriteSong.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'FavoriteSong not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFavoriteSong = async (req, res) => {
  try {
    const row = await FavoriteSong.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFavoriteSong = async (req, res) => {
  try {
    const [updated] = await FavoriteSong.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'FavoriteSong not found' });
    const row = await FavoriteSong.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFavoriteSong = async (req, res) => {
  try {
    const deleted = await FavoriteSong.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'FavoriteSong not found' });
    res.json({ message: 'FavoriteSong deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


