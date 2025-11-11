const { Genres } = require('../models');
const { Op } = require('sequelize');

exports.getAllGenre = async (req, res) => {
  try {
    const genres = await Genres.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: 'Genres retrieved successfully',
      data: genres,
      success: true
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      message: error.message || 'Failed to get genres',
      success: false
    });
  }
}

exports.getGenreById = async (req, res) => {
  try {
    const row = await Genres.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Genre not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genres.findByPk(id);

    if (!genre) {
      return res.status(404).json({
        message: 'Genre not found',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Genre retrieved successfully',
      data: genre,
      success: true
    });
  } catch (error) {
    console.error('Get genre by ID error:', error);
    res.status(500).json({
      message: error.message || 'Failed to get genre',
      success: false
    });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const row = await Genres.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const [updated] = await Genres.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Genre not found' });
    const row = await Genre.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const deleted = await Genres.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Genre not found' });
    res.json({ message: 'Genre deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// search?name=:name
exports.getGenresByName = async (req, res) => {
  try {
    const { name } = req.query;
    console.log(name)
    const where = {};

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    const genres = await Genres.findAll({ where });
    return res.status(200).json(genres);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

