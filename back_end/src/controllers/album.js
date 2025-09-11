const { Album } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const albums = await Album.findAll();
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Album.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Album not found' });
    const updatedAlbum = await Album.findByPk(req.params.id);
    res.json(updatedAlbum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Album.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Album not found' });
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
