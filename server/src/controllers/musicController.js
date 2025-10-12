// controllers/musicController.js
import spotifyService from '../services/spotifyService.js';
import youtubeService from '../services/youtubeService.js';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Config ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

const unlinkAsync = promisify(fs.unlink);

// ===== SEARCH & GET MUSIC INFO =====

// Tìm kiếm bài hát và lấy đầy đủ thông tin
export const searchMusic = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    // Tìm kiếm trên Spotify
    const spotifyTracks = await spotifyService.searchTrackPlaylist(query, 'track', limit);

    // Lấy thông tin YouTube cho mỗi track
    const tracksWithYouTube = await Promise.all(
      spotifyTracks.map(async (track) => {
        const youtubeInfo = await youtubeService.searchYouTubeVideo(track.name, track.artist);
        return {
          ...track,
          youtube: youtubeInfo
        };
      })
    );

    res.status(200).json({
      success: true,
      data: tracksWithYouTube,
      total: tracksWithYouTube.length
    });
  } catch (error) {
    console.error('Search music error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm bài hát',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết một bài hát
export const getMusicDetail = async (req, res) => {
  try {
    const { trackName, artist } = req.query;

    if (!trackName || !artist) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên bài hát và nghệ sĩ'
      });
    }

    // Search Spotify
    const spotifyTracks = await spotifyService.searchTrackPlaylist(`${trackName} ${artist}`, 'track', 1);
    
    if (!spotifyTracks || spotifyTracks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    const spotifyTrack = spotifyTracks[0];

    // Search YouTube
    const youtubeInfo = await youtubeService.searchYouTubeVideo(spotifyTrack.name, spotifyTrack.artist);

    res.status(200).json({
      success: true,
      data: {
        ...spotifyTrack,
        youtube: youtubeInfo
      }
    });
  } catch (error) {
    console.error('Get music detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin bài hát',
      error: error.message
    });
  }
};

// ===== VPOP TRACKS =====

// Lấy danh sách Vpop trending
export const getVpopTracks = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Tìm kiếm Vpop tracks
    const vpopTracks = await spotifyService.searchVpopTracks(parseInt(limit));

    // Lấy thông tin YouTube
    const tracksWithYouTube = await Promise.all(
      vpopTracks.slice(0, 10).map(async (track) => { // Giới hạn 10 để tránh quá nhiều API calls
        const youtubeInfo = await youtubeService.searchYouTubeVideo(track.name, track.artist);
        return {
          ...track,
          youtube: youtubeInfo
        };
      })
    );

    res.status(200).json({
      success: true,
      data: tracksWithYouTube,
      total: tracksWithYouTube.length
    });
  } catch (error) {
    console.error('Get Vpop tracks error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách Vpop',
      error: error.message
    });
  }
};

// ===== PLAYLIST =====

// Lấy tracks từ playlist
export const getPlaylistTracks = async (req, res) => {
  try {
    const { playlistId, limit = 20 } = req.query;

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp playlistId'
      });
    }

    const tracks = await spotifyService.getPlaylistTracks(playlistId, parseInt(limit));

    // Lấy thông tin YouTube cho 5 bài đầu
    const tracksWithYouTube = await Promise.all(
      tracks.slice(0, 5).map(async (track) => {
        const youtubeInfo = await youtubeService.searchYouTubeVideo(track.name, track.artist);
        return {
          ...track,
          youtube: youtubeInfo
        };
      })
    );

    // Tracks còn lại không có YouTube info
    const remainingTracks = tracks.slice(5).map(track => ({
      ...track,
      youtube: null
    }));

    res.status(200).json({
      success: true,
      data: [...tracksWithYouTube, ...remainingTracks],
      total: tracks.length
    });
  } catch (error) {
    console.error('Get playlist tracks error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài hát từ playlist',
      error: error.message
    });
  }
};

// Tìm kiếm playlists
export const searchPlaylists = async (req, res) => {
  try {
    const { query, market = 'VN', limit = 15 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const queries = [query];
    const playlists = await spotifyService.searchPlaylists(queries, market, parseInt(limit));

    res.status(200).json({
      success: true,
      data: playlists,
      total: playlists.length
    });
  } catch (error) {
    console.error('Search playlists error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm playlist',
      error: error.message
    });
  }
};

// ===== YOUTUBE VIDEO INFO =====

// Lấy thông tin video YouTube
export const getYouTubeInfo = async (req, res) => {
  try {
    const { trackName, artist } = req.query;

    if (!trackName || !artist) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên bài hát và nghệ sĩ'
      });
    }

    const youtubeInfo = await youtubeService.searchYouTubeVideo(trackName, artist);

    if (!youtubeInfo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video trên YouTube'
      });
    }

    res.status(200).json({
      success: true,
      data: youtubeInfo
    });
  } catch (error) {
    console.error('Get YouTube info error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin YouTube',
      error: error.message
    });
  }
};

// ===== DOWNLOAD & CONVERT MP3 =====

// Kiểm tra video có thể download không
export const checkVideoAvailability = async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId'
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    res.status(200).json({
      success: true,
      available: audioFormats.length > 0,
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      formats: audioFormats.map(f => ({
        quality: f.quality,
        container: f.container,
        bitrate: f.bitrate
      }))
    });
  } catch (error) {
    console.error('Check video availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể kiểm tra video',
      error: error.message
    });
  }
};

// Download và convert sang MP3
export const downloadAndConvertToMP3 = async (req, res) => {
  try {
    const { videoId, quality = 'highestaudio' } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId'
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Lấy thông tin video
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special chars
    
    // Tạo tên file
    const timestamp = Date.now();
    const tempAudioPath = path.join(__dirname, '../temp', `${timestamp}_audio.webm`);
    const outputPath = path.join(__dirname, '../temp', `${timestamp}_${title}.mp3`);

    // Tạo thư mục temp nếu chưa có
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }

    // Download audio
    const audioStream = ytdl(videoUrl, {
      quality: quality,
      filter: 'audioonly'
    });

    const writeStream = fs.createWriteStream(tempAudioPath);
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Convert sang MP3 bằng ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempAudioPath)
        .toFormat('mp3')
        .audioBitrate(320)
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // Xóa file temp audio
    await unlinkAsync(tempAudioPath);

    // Gửi file về client
    res.download(outputPath, `${title}.mp3`, async (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      // Xóa file sau khi download xong
      try {
        await unlinkAsync(outputPath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    });

  } catch (error) {
    console.error('Download and convert error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi download và convert MP3',
      error: error.message
    });
  }
};

// Stream MP3 trực tiếp (không cần download)
export const streamMP3 = async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId'
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${info.videoDetails.title}.mp3"`);

    const audioStream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    ffmpeg(audioStream)
      .toFormat('mp3')
      .audioBitrate(320)
      .on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Lỗi khi stream MP3',
            error: err.message
          });
        }
      })
      .pipe(res, { end: true });

  } catch (error) {
    console.error('Stream MP3 error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi stream MP3',
        error: error.message
      });
    }
  }
};

// Lấy audio stream URL (cho React Native)
export const getAudioStreamUrl = async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId'
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    // Lấy format audio tốt nhất
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const bestAudio = audioFormats.reduce((best, format) => {
      return format.bitrate > (best?.bitrate || 0) ? format : best;
    }, null);

    if (!bestAudio) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy audio stream'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        streamUrl: bestAudio.url,
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        quality: bestAudio.quality,
        bitrate: bestAudio.bitrate,
        container: bestAudio.container
      }
    });
  } catch (error) {
    console.error('Get audio stream URL error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy audio stream URL',
      error: error.message
    });
  }
};

export default {
  searchMusic,
  getMusicDetail,
  getVpopTracks,
  getPlaylistTracks,
  searchPlaylists,
  getYouTubeInfo,
  checkVideoAvailability,
  downloadAndConvertToMP3,
  streamMP3,
  getAudioStreamUrl
};