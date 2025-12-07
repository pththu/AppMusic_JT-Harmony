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

exports.shareTrack = async (req, res) => {
  try {
    const { trackId, trackSpotifyId } = req.body;
    console.log(req.body)
    if (!trackId && !trackSpotifyId) {
      return res.status(400).json({ error: 'ID bài hát và ID Spotify là bắt buộc' });
    }

    if (!trackId) {
      if (trackSpotifyId) {
        const existingTrack = await Track.findOne({ where: { spotifyId: trackSpotifyId } });
        if (existingTrack) {
          existingTrack.shareCount += 1;
          const row = await existingTrack.save();
          if (!row) {
            return res.status(500).json({ error: 'Không thể cập nhật số lần chia sẻ' });
          }
          return res.status(200).json({
            message: 'Đã chia sẻ bài hát',
            data: { trackId: existingTrack.id },
            success: true
          });
        }
      }
      const response = await Track.create({
        spotifyId: trackSpotifyId,
        shareCount: 1
      })
      if (!response) {
        return res.status(500).json({ error: 'Không thể tạo bài hát để chia sẻ' });
      }

      return res.status(200).json({
        message: 'Đã chia sẻ bài hát',
        data: { trackId: response.id },
        success: true
      });
    }

    const track = await Track.findByPk(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Bài hát không tìm thấy' });
    }

    track.shareCount += 1;
    const row = await track.save();
    if (!row) {
      return res.status(500).json({ error: 'Không thể cập nhật số lần chia sẻ' });
    }

    return res.status(200).json({
      message: 'Đã chia sẻ bài hát',
      data: { trackId: track.id },
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}

exports.createTrack = async (req, res) => {
  try {
    const row = await Track.create(req.body);
    if (!row) {
      return res.status(500).json({ error: 'Failed to create track' });
    }
    res.status(201).json({
      message: 'Track created successfully',
      data: row,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}