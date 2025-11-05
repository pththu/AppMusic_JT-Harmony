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
      console.log(1)
      return res.status(400).json({ error: 'ID bài hát và ID Spotify là bắt buộc' });
    }

    console.log(2)
    if (!trackId) {
      console.log(3)
      const response = await Track.create({
        spotifyId: trackSpotifyId,
        shareCount: 1
      })

      console.log(4)
      if (!response) {
        console.log(5)
        return res.status(500).json({ error: 'Không thể tạo bài hát để chia sẻ' });
      }

      console.log(6)
      return res.status(200).json({
        message: 'Đã chia sẻ bài hát',
        data: { trackId: response.id },
        success: true
      });
    }

    console.log(7)
    const track = await Track.findByPk(trackId);
    console.log(8)
    if (!track) {
      console.log(9)
      return res.status(404).json({ error: 'Bài hát không tìm thấy' });
    }

    console.log(10)
    track.shareCount += 1;
    const row = await track.save();
    console.log(11)
    if (!row) {
      console.log(12)
      return res.status(500).json({ error: 'Không thể cập nhật số lần chia sẻ' });
    }

    console.log(13)
    return res.status(200).json({
      message: 'Đã chia sẻ bài hát',
      data: { trackId: track.id },
      success: true
    });
  } catch (error) {
    console.log(14)
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}