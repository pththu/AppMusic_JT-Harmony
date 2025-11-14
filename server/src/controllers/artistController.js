const { Artist } = require('../models');
const spotify = require('../configs/spotify');
const Op = require('sequelize').Op;

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

exports.shareArtist = async (req, res) => {
  try {
    const { artistId, artistSpotifyId } = req.body;
    console.log(req.body);

    if (!artistId && !artistSpotifyId) {
      console.log(1)
      return res.status(400).json({ error: 'artistId and artistSpotifyId are required' });
    }

    let artist = null;
    if (artistId || artistSpotifyId) {
      artist = await Artist.findOne({
        where: {
          [Op.or]: [
            { id: artistId },
            { spotifyId: artistSpotifyId }
          ]
        }
      })
      console.log(8)
      if (!artist) {
        const response = await spotify.findArtistById(artistSpotifyId);
        if (!response) {
          return res.status(404).json({ error: 'Artist not found on Spotify' });
        }

        const result = await Artist.create({
          name: response.name,
          spotifyId: artistSpotifyId,
          imageUrl: response.images[0]?.url || null,
          shareCount: 1
        });

        console.log(4)
        if (!result) {
          console.log(5)
          return res.status(500).json({ error: 'Failed to create artist record' });
        }

        return res.status(200).json({
          message: 'Artist shared successfully',
          data: { artistId: result.id },
          success: true
        });
      }

      console.log(10)
      artist.shareCount += 1;
      await artist.save();
      return res.status(200).json({
        message: 'Artist shared successfully',
        data: { artistId: artist.id },
        success: true
      });
    }

  } catch (error) {

  }
}