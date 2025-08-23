import { PlaylistSong, Song, Playlist } from "../models/index.js";

export const PlaylistSongController = {
  // Lấy tất cả bài hát trong playlist
  async getAllByPlaylist(req, res) {
    try {
      const playlistSongs = await PlaylistSong.findAll({
        where: { playlistId: req.params.playlistId },
        include: [{ model: Song, attributes: ["id", "title", "duration"] }],
      });
      res.json(playlistSongs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Thêm bài hát vào playlist
  async addSong(req, res) {
    try {
      const { playlistId, songId } = req.body;

      // Kiểm tra playlist tồn tại
      const playlist = await Playlist.findByPk(playlistId);
      if (!playlist) return res.status(404).json({ message: "Playlist not found" });

      // Thêm bài hát
      const playlistSong = await PlaylistSong.create({ playlistId, songId });
      res.status(201).json(playlistSong);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Xóa bài hát khỏi playlist
  async removeSong(req, res) {
    try {
      const { playlistId, songId } = req.body;
      const playlistSong = await PlaylistSong.findOne({ where: { playlistId, songId } });
      if (!playlistSong) return res.status(404).json({ message: "Song not found in playlist" });

      await playlistSong.destroy();
      res.json({ message: "Song removed from playlist" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
