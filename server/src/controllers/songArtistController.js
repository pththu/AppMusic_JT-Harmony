const { SongArtist, Artist, Song } = require('../models');

exports.getAllSongArtist = async (req, res) => {
  try {
    const rows = await SongArtist.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongArtistById = async (req, res) => {
  try {
    const row = await SongArtist.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'SongArtist not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSongArtist = async (req, res) => {
  try {
    const [song, artist] = await Promise.all([
      Song.findByPk(req.body.songId),
      Artist.findByPk(req.body.artistId)
    ]);

    if (!song || !artist) {
      return res.status(404).json({ error: 'Song or Artist not found' });
    }

    song.addArtist(artist);
    artist.addSong(song);
    res.status(201).json({ message: 'SongArtist created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SongArtist' });
  }
};

exports.updateSongArtist = async (req, res) => {
  try {
    const [updated] = await SongArtist.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'SongArtist not found' });
    const row = await SongArtist.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSongArtist = async (req, res) => {
  try {
    const deleted = await SongArtist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'SongArtist not found' });
    res.json({ message: 'SongArtist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



