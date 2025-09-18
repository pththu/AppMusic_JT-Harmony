const { AlbumSong } = require('../models');

exports.getAllAlbumSong = async (req, res) => {
  try {
    const rows = await AlbumSong.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlbumSongById = async (req, res) => {
  try {
    const { albumId, songId } = req.params;
    const row = await AlbumSong.findOne({ where: { albumId, songId } });
    if (!row) return res.status(404).json({ error: 'AlbumSong not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAlbumSong = async (req, res) => {
  try {
    const { albumId, orderIndex } = req.body;
    const isExisting = await AlbumSong.findOne({ where: { albumId, orderIndex } });
    if (isExisting) {
      return res.status(400).json({ error: 'AlbumSong already exists' });
    }
    const row = await AlbumSong.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlbumSong = async (req, res) => {
  try {
    const { albumId, songId, newOrderIndex } = req.body;
    const isExisting = await AlbumSong.findOne({ where: { albumId, orderIndex: newOrderIndex } });
    if (isExisting) {
      return res.status(400).json({ error: 'AlbumSong already exists' });
    }
    const [updated] = await AlbumSong.update({ orderIndex: newOrderIndex }, { where: { albumId, songId } });
    if (!updated) return res.status(404).json({ error: 'AlbumSong not found' });
    const row = await AlbumSong.findOne({ where: { albumId, songId } });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAlbumSong = async (req, res) => {
  try {
    const { albumId, songId } = req.params;
    const deleted = await AlbumSong.destroy({ where: { albumId, songId } });
    if (!deleted) return res.status(404).json({ error: 'AlbumSong not found' });
    res.json({ message: 'AlbumSong deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

