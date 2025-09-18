const e = require('express');
const { Follow } = require('../models');

exports.getAllFollows = async (req, res) => {
  try {
    const rows = await Follow.findAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowById = async (req, res) => {
  try {
    const row = await Follow.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Follow not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFollowByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const follows = await Follow.findAll({ where: { userId } });
    if (!follows) return res.status(404).json({ error: 'No Follow found for this user' });
    res.json(follows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowByArtistFolloweeId = async (req, res) => {
  try {
    const artistFolloweeId = req.params.artistFolloweeId;
    const follows = await Follow.findAll({ where: { artistFolloweeId } });
    if (!follows) return res.status(404).json({ error: 'No follows found for this artist' });
    res.json(follows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowByUserFolloweeId = async (req, res) => {
  try {
    const userFolloweeId = req.params.userFolloweeId;
    const follows = await Follow.findAll({ where: { userFolloweeId } });
    if (!follows) return res.status(404).json({ error: 'No follows found for this user' });
    res.json(follows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFollow = async (req, res) => {
  try {
    const row = await Follow.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFollow = async (req, res) => {
  try {
    const [updated] = await Follow.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Follows not found' });
    const row = await Follow.findByPk(req.params.id);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFollow = async (req, res) => {
  try {
    const deleted = await Follow.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Follows not found' });
    res.json({ message: 'Follows deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


