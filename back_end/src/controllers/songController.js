const { Song } = require('../models');

exports.getAllSong = async (req, res) => {
  try {
    const rows = await Song.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const row = await Song.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Song not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSong = async (req, res) => {
  try {
    const row = await Song.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSong = async (req, res) => {
  try {
    const [updated] = await Song.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Song not found' });
    const row = await Song.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const deleted = await Song.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Song not found' });
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArtistBySong = async (req, res) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    const artists = await song.getArtists();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve artists' });
  }
};