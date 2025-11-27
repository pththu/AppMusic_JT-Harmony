const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("⚠️ Vui lòng thiết lập GEMINI_API_KEY trong file .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Cache để tránh gọi API lặp lại
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 giờ

// Hàm helper: Lấy từ cache hoặc gọi API
const getCached = (key, fetchFn) => {
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache hit: ${key}`);
      return cached.data;
    }
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

module.exports = {
  genAI,
  getCached,
  setCache,
};