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

    console.log(response.items[0]);
    const video = formatVideo(response.items[0]);
    return video;
  } catch (err) {
    console.error('Error searching YouTube video:', err.response ? err.response.data : err.message);
    throw err;
  }
};

module.exports = {
  searchVideo,
};

