const redis = require('redis');
require('dotenv').config();

// Đọc biến môi trường
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

// Cấu hình client
const redisClient = redis.createClient({
  password: redisPassword,
  socket: {
    host: redisHost,
    port: redisPort,
    // THÊM DÒNG NÀY ĐỂ BẬT KẾT NỐI BẢO MẬT (SSL/TLS)
    tls: true,
  },
});

redisClient.on('connect', () => {
  console.log(`✅ Connected to Redis (Upstash) successfully at ${redisHost}!`);
});

redisClient.on('error', (err) => {
  console.error('❌ Redis (Upstash) connection error:', err);
});

// Hàm tiện ích để kết nối (gọi 1 lần khi server khởi động)
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis (Upstash):', err);
  }
};

// Export client đã kết nối
module.exports = {
  redisClient,
  connectRedis,
};