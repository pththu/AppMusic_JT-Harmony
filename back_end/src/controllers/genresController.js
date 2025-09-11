const { Genre } = require('../models');
const { Op } = require('sequelize');

exports.getAllGenre = async (req, res) => {
  try {
    const rows = await Genre.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGenreById = async (req, res) => {
  try {
    const row = await Genre.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Genre not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const row = await Genre.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const [updated] = await Genre.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Genre not found' });
    const row = await Genre.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const deleted = await Genre.destroy({ where: { id: req.params.id } });
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

    const genres = await Genre.findAll({ where });
    return res.status(200).json(genres);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

