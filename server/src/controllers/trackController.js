const { Track } = require('../models');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require('../configs/cloudinary');

exports.getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.findAll();
    res.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.getTrackByName = async (req, res) => {
  try {
    const { name } = req.body;
    const track = await Track.findOne({ where: { name } });
    if (!track) {
      return res.status(200).json({ message: "Không có dữ liệu", success: false });
    }
    res.status(200).json({
      message: "Track found",
      success: true,
      track
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.getTracksByName = async (req, res) => {
  try {
    const { name } = req.body;
    const tracks = await Track.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`
        }
      }
    });
    if (tracks.length === 0) {
      return res.status(200).json({ message: "Không có dữ liệu", success: false });
    }
    res.status(200).json({
      message: "Tracks found",
      success: true,
      tracks
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
