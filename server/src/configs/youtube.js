// configs/youtube.js
require('dotenv').config();
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

const formatVideo = (video) => ({
  videoId: video.id.videoId || video.id,
  title: video.snippet.title,
  description: video.snippet.description,
});

const youtubeApiRequest = async (endpoint, params) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}${endpoint}`, {
      params: params,
    });
    return response.data;
  } catch (err) {
    console.error('Error making YouTube API request:', err.response ? err.response.data : err.message);
    throw err;
  }
};

/**
 * Tìm kiếm video trên YouTube theo tên bài hát và nghệ sĩ.
 * @param {string} songName - Tên bài hát.
 * @param {string} artistName - Tên nghệ sĩ.
 * @returns {Promise<Object>} - Dữ liệu video tìm được.
 */

const searchVideo = async (songName, artistName) => {
  const query = `${songName} ${artistName} Official Audio Lyrics`;

  try {
    const response = await youtubeApiRequest('/search', {
      key: YOUTUBE_API_KEY,
      part: 'snippet',
      q: query,
      maxResults: 5,
      type: 'video',
    });

    if (!response.items || response.items.length === 0) {
      console.log('Không tìm thấy video nào.');
      return null;
    }

    const cacTuKhoaLoaiBo = [
      'official music video',
      'official video',
      'mv',
      'music video'
    ];

    const videoPhuHop = response.items.find(item => {
      const tieuDe = item.snippet.title.toLowerCase();
      const coChuaTuKhoaCam = cacTuKhoaLoaiBo.some(term => tieuDe.includes(term));
      return !coChuaTuKhoaCam;
    });

    let videoChon;

    if (videoPhuHop) {
      console.log(`Đã lọc (loại bỏ MV) và chọn video: ${videoPhuHop.snippet.title}`);
      videoChon = videoPhuHop;
    } else {
      console.log('Không tìm thấy video phù hợp (toàn MV?), lấy kết quả đầu tiên (dự phòng).');
      videoChon = response.items[0];
    }

    const video = formatVideo(videoChon);
    return video;
  } catch (err) {
    console.error('Error searching YouTube video:', err.response ? err.response.data : err.message);
    throw err;
  }
};

module.exports = {
  searchVideo,
};

