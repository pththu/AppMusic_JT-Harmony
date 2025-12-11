const { redisClient } = require('../configs/redis');

// Xóa cache Redis
const clearCache = async (req, res) => {
  try {
    const { cacheKey } = req.query;
    
    if (cacheKey) {
      // Xóa cache cụ thể
      await redisClient.del(cacheKey);
      console.log(`Deleted cache key: ${cacheKey}`);
      return res.status(200).json({
        message: `Đã xóa cache: ${cacheKey}`,
        success: true
      });
    } else {
      // Xóa tất cả cache
      await redisClient.flushAll();
      console.log('Cleared all Redis cache');
      return res.status(200).json({
        message: 'Đã xóa tất cả cache Redis',
        success: true
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      message: 'Lỗi khi xóa cache',
      error: error.message
    });
  }
};

module.exports = {
  clearCache
};
