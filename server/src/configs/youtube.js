import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const YOUTUBE_CONFIG = {
  API_KEY: process.env.YOUTUBE_API_KEY,
  API_URL: 'https://www.googleapis.com/youtube/v3'
};

// Tìm kiếm video trên YouTube
async function searchYouTubeVideo(trackName, artist) {
  try {
    const query = `${trackName} ${artist} official music video`;

    const response = await axios.get(`${YOUTUBE_CONFIG.API_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_CONFIG.API_KEY,
        regionCode: 'VN',
        relevanceLanguage: 'vi'
      }
    });

    const videos = response.data.items || [];

    // Ưu tiên video có title chứa "official" hoặc "mv" hoặc "music video"
    const priorityVideo = videos.find(video =>
      video.snippet.title.toLowerCase().includes('official') ||
      video.snippet.title.toLowerCase().includes('music video') ||
      video.snippet.title.toLowerCase().includes('mv')
    );

    const selectedVideo = priorityVideo || videos[0];

    if (selectedVideo) {
      return {
        videoId: selectedVideo.id.videoId,
        title: selectedVideo.snippet.title,
        thumbnail: selectedVideo.snippet.thumbnails.high?.url || selectedVideo.snippet.thumbnails.default.url,
        channelTitle: selectedVideo.snippet.channelTitle,
        publishedAt: selectedVideo.snippet.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1&controls=1&showinfo=1`,
        watchUrl: `https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`
      };
    }

    return null;
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  searchYouTubeVideo
};