const { Album, AlbumSong, Song } = require('../models');

exports.getAllAlbum = async (req, res) => {
  try {
    const rows = await Album.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const row = await Album.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Album not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const row = await Album.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const [updated] = await Album.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Album not found' });
    const row = await Album.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const deleted = await Album.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Album not found' });
    res.json({ message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongByAlbumId = async (req, res) => {
  try {
    const albumId = req.params.albumId;
    const songs = await AlbumSong.findAll({ where: { albumId } });
    if (!songs) return res.status(404).json({ error: 'No songs found for this album' });
    const songData = await Promise.all(songs.map(async song => {
      return await Song.findByPk(song.songId);
    }));
    res.json(songData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}