// configs/youtube.js
require('dotenv').config();
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

const formatVideo = (video, duration) => ({
  videoId: video.id.videoId || video.id,
  title: video.snippet.title,
  description: video.snippet.description,
  duration: duration,
  thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
  channelId: video.snippet.channelId,
  channelTitle: video.snippet.channelTitle,
  publishedAt: video.snippet.publishedAt,
  embedUrl: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&controls=1&showinfo=1`,
  watchUrl: `https://www.youtube.com/watch?v=${video.id.videoId || video.id}`
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

const searchVideoWithDuration = async (id) => {
  try {
    const detailsResult = await youtubeApiRequest('/videos', {
      key: YOUTUBE_API_KEY,
      part: 'contentDetails,snippet', // Lấy cả contentDetails (cho duration) và snippet (cho title, etc.)
      id: id
    });
    console.log(detailsResult.items);
    return detailsResult.items;
  } catch (error) {
    console.error('Error fetching video details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const searchVideo = async (songName, artistName) => {
  const query = `${songName} ${artistName} lyric`;

  try {
    const response = await youtubeApiRequest('/search', {
      key: YOUTUBE_API_KEY,
      part: 'snippet',
      q: query,
      maxResults: 5,
      type: 'video',
    });

    console.log(response.items[0]);

    const resultWithDetails = await searchVideoWithDuration(response.items[0].id.videoId);
    console.log('resultWithDetails', resultWithDetails);

    const video = formatVideo(response.items[0], parseISO8601Duration(resultWithDetails[0]?.contentDetails?.duration || null));
    return video;
  } catch (err) {
    console.error('Error searching YouTube video:', err.response ? err.response.data : err.message);
    throw err;
  }
};

const parseISO8601Duration = (durationString) => {
  // Biểu thức chính quy để tìm các số đi kèm với H, M, S
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationString.match(regex);

  // matches sẽ là một mảng: [chuỗi_khớp, giờ, phút, giây]
  // Ví dụ với "PT3M28S": ['PT3M28S', undefined, '3', '28']

  console.log('matches', matches)

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  console.log('minutes', minutes);
  console.log('s', seconds);

  // Tính tổng số giây
  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
}

module.exports = {
  searchVideo,
};