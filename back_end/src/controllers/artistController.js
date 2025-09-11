const { Artist } = require('../models');

exports.getAllArtist = async (req, res) => {
  try {
    const rows = await Artist.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const row = await Artist.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Artist not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createArtist = async (req, res) => {
  try {
    const row = await Artist.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const [updated] = await Artist.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Artist not found' });
    const row = await Artist.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const deleted = await Artist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Artist not found' });
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongByArtist = async (req, res) => {
  try {
    const artist = await Artist.findByPk(req.params.id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });

    const songs = await artist.getSongs();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve songs' });
  }
}