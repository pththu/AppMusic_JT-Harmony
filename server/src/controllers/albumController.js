const { Album } = require('../models');
const Op = require('sequelize').Op;
const spotify = require('../configs/spotify');

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

exports.createOne = async (req, res) => {
  try {
    const { title, artist, releaseDate } = req.body;
    let imageUrl = null;
    if (!req.file || !req.file.path) {
      imageUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/album_default.png';
    } else {
      imageUrl = req.file.path;
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const row = await Album.create({ title, artist, releaseDate, imageUrl });
    res.status(201).json({
      message: 'Album created successfully',
      album: row,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.shareAlbum = async (req, res) => {
  try {
    const { albumId, albumSpotifyId } = req.body;

    console.log(req.body);

    if (!albumId && !albumSpotifyId) {
      return res.status(400).json({ error: 'albumId and albumSpotifyId are required' });
    }

    if (!albumId) {
      const response = await Album.create({
        spotifyId: albumSpotifyId,
        shareCount: 1
      });

      if (!response) {
        return res.status(500).json({ error: 'Failed to create album record' });
      }

      return res.status(201).json({
        message: 'Album shared successfully',
        data: { albumId: response.id },
        success: true
      });
    }

    const album = await Album.findByPk(albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    album.shareCount += 1;
    await album.save();

    res.status(200).json({
      message: 'Album shared successfully',
      data: { albumId: album.id },
      success: true
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}