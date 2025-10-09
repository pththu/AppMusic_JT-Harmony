// ./middlewares/authentication.js (BẢN DEBUG MỚI NHẤT)

const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

exports.authenticateToken = async(req, res, next) => {
    console.log("--- BẮT ĐẦU AUTHENTICATE ---");
    console.log("Raw Headers:", req.headers); // LOG RAW HEADERS để kiểm tra Authorization

    try {
        let token;

        // 1. Lấy token từ Cookie (accessToken)
        token = req.cookies['accessToken'];

        // 2. Nếu không có trong cookie, lấy từ Header (Kiểm tra Case-Insensitive)
        if (!token) {
            // Express thường chuyển header về lowercase (authorization)
            let authHeader = req.headers['authorization'];

            // Nếu không có lowercase, thử check với uppercase (Authorization)
            if (!authHeader) {
                authHeader = req.headers['Authorization'];
            }

            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        console.log("Token được tìm thấy:", token ? "CÓ" : "KHÔNG");

        if (!token) {
            console.log("LỖI: Access token required (Token KHÔNG được tìm thấy)");
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if user exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            console.log("LỖI: User not found (ID:", decoded.id, ")");
            return res.status(401).json({ error: 'User not found' });
        }

        // Thêm thông tin User vào request
        req.user = decoded;
        req.currentUser = user;
        console.log("Xác thực thành công cho User ID:", decoded.id);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.log("LỖI AUTH: Token expired");
            return res.status(401).json({ error: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            console.log("LỖI AUTH: Invalid token");
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('LỖI AUTH KHÔNG XÁC ĐỊNH:', err.message);
        return res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
};

exports.authorizeRole = (req, res, next) => {
    try {
        const user = req.currentUser;
        if (!user) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (user.roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}