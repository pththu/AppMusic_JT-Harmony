import { Playlist, User } from "../models/index.js";

export const PlaylistController = {
  // Lấy tất cả playlist
  async getAll(req, res) {
    try {
      const playlists = await Playlist.findAll({
        include: [{ model: User, attributes: ["id", "username", "email"] }],
      });
      res.json(playlists);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lấy playlist theo id
  async getById(req, res) {
    try {
      const playlist = await Playlist.findByPk(req.params.id, {
        include: [{ model: User, attributes: ["id", "username"] }],
      });
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });
      res.json(playlist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Tạo playlist mới
  async create(req, res) {
    try {
      const { name, description, userId } = req.body;
      const newPlaylist = await Playlist.create({ name, description, userId });
      res.status(201).json(newPlaylist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Cập nhật playlist
  async update(req, res) {
    try {
      const { name, description } = req.body;
      const playlist = await Playlist.findByPk(req.params.id);
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });

      playlist.name = name || playlist.name;
      playlist.description = description || playlist.description;
      await playlist.save();

      res.json(playlist);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa playlist
  async delete(req, res) {
    try {
      const playlist = await Playlist.findByPk(req.params.id);
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });

      await playlist.destroy();
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
