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
      // 'mv',
      // 'music video'
    ];

    const videoPhuHop = response.items.find(item => {
      const tieuDe = item.snippet.title.toLowerCase();
      const coChuaTuKhoaCam = cacTuKhoaLoaiBo.some(term => tieuDe.includes(term));
      return !coChuaTuKhoaCam;
    });

    let videoChon;

    if (videoPhuHop) {
      console.log(`Đã lọc và chọn video: ${videoPhuHop.snippet.title}`);
      videoChon = videoPhuHop;
    } else {
      console.log('Không tìm thấy video phù hợp, lấy kết quả đầu tiên (dự phòng).');
      videoChon = response.items[0];
    }

    const video = formatVideo(videoChon);
    return video;
  } catch (err) {
    console.error('Error searching YouTube video:', err.response ? err.response.data : err.message);
    throw err;
  }
};

const searchVideoWithDuration = async (id) => {
  try {
    const detailsResult = await youtubeApiRequest('/videos', {
      key: YOUTUBE_API_KEY,
      part: 'contentDetails,snippet', // Lấy cả contentDetails (cho duration) và snippet (cho title, etc.)
      id: id
    });
    console.log(parseISO8601Duration(detailsResult.items[0].contentDetails?.duration));
    return parseISO8601Duration(detailsResult.items[0].contentDetails?.duration);
  } catch (error) {
    console.error('Error fetching video details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const parseISO8601Duration = (durationString) => {
  // Biểu thức chính quy để tìm các số đi kèm với H, M, S
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationString.match(regex);

  // matches sẽ là một mảng: [chuỗi_khớp, giờ, phút, giây]
  // Ví dụ với "PT3M28S": ['PT3M28S', undefined, '3', '28']

  // console.log('matches', matches)

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  // Tính tổng số giây
  return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
}

module.exports = {
  searchVideo,
  searchVideoWithDuration
};

