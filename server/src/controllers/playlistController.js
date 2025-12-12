const { Playlist, PlaylistTrack, Track, User } = require('../models');
const Op = require('sequelize').Op;
const spotify = require('../configs/spotify');
const { redisClient } = require('../configs/redis');

exports.getAllPlaylist = async (req, res) => {
  try {
    const rows = await Playlist.findAll();
    const response = {
      message: 'Lấy tất cả danh sách phát thành công',
      data: rows,
      success: true
    }
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const row = await Playlist.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Playlist not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOne = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    let imageUrl = null;

    if (!req.file || !req.file.path) {
      imageUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/playlist_default.png';
    } else {
      imageUrl = req.file.path;
    }

    if (!name) {
      return res.status(400).json({ error: 'Tên là bắt buộc' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Mô tả không được vượt quá 500 ký tự' });
    }

    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    let isAdmin = false;
    if (user.roleId === 1) {
      isAdmin = true;
    }
    let totalTracks = 0;
    let sharedCount = 0;
    if (req.body?.totalTracks) totalTracks = req.body.totalTracks;
    if (req.body?.sharedCount) sharedCount = req.body.sharedCount;

    // invalid cache
    await redisClient.del(`user:${req.user?.id}:playlists`);
    const row = await Playlist.create({
      name,
      description, imageUrl,
      isPublic,
      userId: isAdmin ? req.body.userId : userId,
      totalTracks: totalTracks,
      shareCount: sharedCount
    });

    res.status(201).json({
      message: 'Tạo danh sách phát thành công',
      playlist: row,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOne = async (req, res) => {
  try {
    const { id, name, description, isPublic } = req.body;
    let imageUrl = null;

    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Mô tả không được vượt quá 500 ký tự' });
    }

    if (!id) {
      return res.status(400).json({ error: 'ID danh sách phát là bắt buộc' });
    }

    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      return res.status(404).json({ error: 'Không tìm thấy playlist' });
    }

    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;

    if (imageUrl) {
      playlist.imageUrl = imageUrl;
    }

    const updated = await playlist.save();

    if (!updated) return res.status(404).json({ error: 'Không tìm thấy playlist' });
    res.status(200).json({
      message: 'Cập nhật danh sách phát thành công',
      playlist: updated,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sharePlaylist = async (req, res) => {
  try {
    const { playlistId, playlistSpotifyId } = req.body;

    if (!playlistId && !playlistSpotifyId) {
      return res.status(400).json({ error: 'ID danh sách phát và ID Spotify là bắt buộc' });
    }

    if (!playlistId) {
      const response = await Playlist.create({
        spotifyId: playlistSpotifyId,
        shareCount: 1
      })

      if (!response) {
        return res.status(500).json({ error: 'Không thể tạo danh sách phát để chia sẻ' });
      }

      return res.status(200).json({
        message: 'Đã chia sẻ danh sách phát',
        data: { playlistId: response.id },
        success: true
      });
    }

    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Danh sách phát không tìm thấy' });
    }

    playlist.shareCount += 1;
    const row = await playlist.save();

    if (!row) {
      return res.status(500).json({ error: 'Không thể cập nhật số lần chia sẻ' });
    }

    return res.status(200).json({
      message: 'Đã chia sẻ danh sách phát',
      data: { playlistId: playlist.id },
      success: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.updatePrivacy = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Danh sách phát không tìm thấy' });
    }

    playlist.isPublic = !playlist.isPublic;
    const row = await playlist.save();
    if (!row) {
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái danh sách phát' });
    }

    res.status(200).json({
      message: 'Đã cập nhật trạng thái danh sách phát',
      isPublic: playlist.isPublic,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.deletePlaylist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    let isAdmin = false;
    if (user.roleId === 1) {
      isAdmin = true;
    }

    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Danh sách phát không tìm thấy' });
    }

    if (!isAdmin && userId !== playlist.userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa danh sách phát này' });
    }

    const deleted = await Playlist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Danh sách phát không tìm thấy' });
    await redisClient.del(`user:${req.user?.id}:playlists`);
    res.status(200).send({ message: 'Đã xóa danh sách phát', success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMultiplePlaylists = async (req, res) => {
  try {
    const playlistIds = req.body;

    console.log('playlistIds', playlistIds)

    const userId = req.user?.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    if (playlistIds.length === 0) {
      return res.status(400).json({ error: 'Danh sách ID danh sách phát không hợp lệ' });
    }

    let isAdmin = false;
    if (user.roleId === 1) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return res.status(403).json({ error: 'Chỉ quản trị viên mới có thể xóa nhiều danh sách phát' });
    }

    const deleted = await Playlist.destroy({ where: { id: { [Op.in]: playlistIds } } });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Không tìm thấy danh sách phát để xóa' });
    }
    await redisClient.del(`user:${req.user?.id}:playlists`);
    res.status(200).send({ message: 'Đã xóa danh sách phát', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}