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

exports.createPlaylist = async (req, res) => {
  try {
    const row = await Playlist.create(req.body);
    res.status(201).json(row);
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


