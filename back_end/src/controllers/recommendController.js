const { Recommend } = require('../models');

exports.getAllRecommend = async (req, res) => {
  try {
    const rows = await Recommend.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendById = async (req, res) => {
  try {
    const row = await Recommend.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Recommend not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRecommend = async (req, res) => {
  try {
    const row = await Recommend.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRecommend = async (req, res) => {
  try {
    const [updated] = await Recommend.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Recommend not found' });
    const row = await Recommend.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecommend = async (req, res) => {
  try {
    const deleted = await Recommend.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Recommend not found' });
    res.json({ message: 'Recommend deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


