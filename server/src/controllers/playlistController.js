const { Playlist, PlaylistTrack } = require('../models');

exports.getAllPlaylist = async (req, res) => {
  try {
    const rows = await Playlist.findAll();
    res.json(rows);
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
      console.log(2)
      imageUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/playlist_default.png';
    } else {
      console.log(3)
      imageUrl = req.file.path;
    }

    if (!name) {
      console.log(4)
      return res.status(400).json({ error: 'Tên là bắt buộc' });
    }

    if (description && description.length > 500) {
      console.log(5)
      return res.status(400).json({ error: 'Mô tả không được vượt quá 500 ký tự' });
    }

    console.log(6)
    const row = await Playlist.create({ name, description, imageUrl, isPublic, userId: req.user.id });
    console.log(7)
    res.status(201).json({
      message: 'Tạo danh sách phát thành công',
      playlist: row,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.GetTracksFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const data = await Playlist.findByPk(playlistId, {
      include: [
        {
          model: PlaylistTrack,
          attributes: ['id', 'playlistId', 'trackId', 'trackSpotifyId'],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!data) {
      return res.status(200).json({ message: 'Không tìm thấy bài hát nào trong playlist này', success: false });
    }

    res.status(200).json({
      message: 'Lấy danh sách bài hát trong playlist thành công',
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get tracks from playlist on Spotify' });
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
    console.log('playlist', playlist)

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

exports.deletePlaylist = async (req, res) => {
  try {
    const deleted = await Playlist.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Danh sách phát không tìm thấy' });
    res.status(200).send({ message: 'Đã xóa danh sách phát', success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


