const cache = new Map();
const CACHE_DURATION = 3600000; // 1 giờ

/**
 * Lấy dữ liệu từ cache nếu hợp lệ.
 * @param {string} key - Khóa cache
 * @returns {any | null} - Dữ liệu đã cache hoặc null
 */
const getCached = (key) => {
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache hit: ${key}`);
      return cached.data;
    }
  }
  // Cache hết hạn hoặc không tồn tại
  return null;
};

/**
 * Lưu dữ liệu vào cache.
 * @param {string} key - Khóa cache
 * @param {any} data - Dữ liệu cần cache
 */
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`Chached data for key: ${key}`);
};

module.exports = { getCached, setCache };