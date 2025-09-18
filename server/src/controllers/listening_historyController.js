const { ListeningHistory } = require('../models');

exports.getAllListeningHistory = async (req, res) => {
  try {
    const rows = await ListeningHistory.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getListeningHistoryById = async (req, res) => {
  try {
    const row = await ListeningHistory.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'ListeningHistory not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createListeningHistory = async (req, res) => {
  try {
    const row = await ListeningHistory.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateListeningHistory = async (req, res) => {
  try {
    const [updated] = await ListeningHistory.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'ListeningHistory not found' });
    const row = await ListeningHistory.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteListeningHistory = async (req, res) => {
  try {
    const deleted = await ListeningHistory.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'ListeningHistory not found' });
    res.json({ message: 'ListeningHistory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


