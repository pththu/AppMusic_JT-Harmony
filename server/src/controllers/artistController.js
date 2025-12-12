const { Artist, Genres } = require('../models');
const spotify = require('../configs/spotify');
const { redisClient } = require('../configs/redis');
const Op = require('sequelize').Op;
const sequelize = require('../configs/database');

const formatArtist = (artist) => {
  return {
    id: artist.id,
    name: artist.name,
    spotifyId: artist.spotifyId,
    imageUrl: artist.imageUrl,
    shareCount: artist.shareCount,
    totalFollowers: artist.totalFollowers
  }
}

const formatArtistGenres = (artist) => {
  return {
    id: artist.id,
    name: artist.name,
    spotifyId: artist.spotifyId,
    genres: [...artist.genres.map(genre => genre.name)],
    imageUrl: artist.imageUrl,
    shareCount: artist.shareCount,
    totalFollowers: artist.totalFollowers,
    createdAt: artist.createdAt,
  }
}

exports.getAllArtist = async (req, res) => {
  try {
    const cacheKey = 'all_artists';
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    const rows = await Artist.findAll({
      include: [
        { model: Genres, as: 'genres', through: { attributes: [] } }
      ]
    });

    // const dataFormatted = rows.map(artist => formatArtist(artist));
    const dataFormatted = rows.map(artist => formatArtistGenres(artist));
    const response = {
      message: 'Lấy tất cả nghệ sĩ thành công',
      data: dataFormatted,
      success: true
    };
    res.json(response);
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
    const row = await Artist.create({
      name: req.body.name,
      spotifyId: req.body.spotifyId,
      imageUrl: req.body.imageUrl,
      shareCount: req.body.shareCount || 0,
      totalFollowers: req.body.totalFollowers || 0,
    });

    if (!row) {
      return res.status(500).json({ error: 'Failed to create artist' });
    }

    const junctionTable = sequelize.models.artist_genres;

    const artistGenresToInsert = [];
    const genres = [];
    if (req.body.genresId) {
      for (let genreId of req.body.genresId) {
        let genre = await Genres.findByPk(genreId);
        if (!genre) {
          return res.status(400).json({ error: `Genre with ID ${genreId} not found` });
        }
        artistGenresToInsert.push({ artist_id: row.id, genre_id: genre.id });
        genres.push(genre);
      }

      await junctionTable.bulkCreate(artistGenresToInsert, { ignoreDuplicates: true });
    }

    const dataFormatted = formatArtistGenres({ genres: genres, ...row.toJSON() });
    res.status(201).json({
      message: 'Artist created successfully',
      data: dataFormatted,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err });
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
    if (!artistId && !artistSpotifyId) {
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

        if (!result) {
          return res.status(500).json({ error: 'Failed to create artist record' });
        }

        return res.status(200).json({
          message: 'Artist shared successfully',
          data: { artistId: result.id },
          success: true
        });
      }

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