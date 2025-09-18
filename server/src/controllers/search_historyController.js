const { SearchHistory } = require('../models');

exports.getAllSearchHistory = async (req, res) => {
  try {
    const rows = await SearchHistory.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSearchHistoryById = async (req, res) => {
  try {
    const row = await SearchHistory.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'SearchHistory not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSearchHistory = async (req, res) => {
  try {
    const row = await SearchHistory.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSearchHistory = async (req, res) => {
  try {
    const [updated] = await SearchHistory.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'SearchHistory not found' });
    const row = await SearchHistory.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  try {
    const deleted = await SearchHistory.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'SearchHistory not found' });
    res.json({ message: 'SearchHistory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


