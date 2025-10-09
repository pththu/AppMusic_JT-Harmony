const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

/**
 * Middleware xác thực token (JWT) từ Cookie hoặc Header Authorization.
 */
exports.authenticateToken = async(req, res, next) => {
    console.log("--- BẮT ĐẦU AUTHENTICATE ---");
    // console.log("Raw Headers:", req.headers); // Có thể bật lại log này nếu cần debug sâu

    try {
        let token;

        // 1. Lấy token từ Cookie ('accessToken')
        token = req.cookies['accessToken'];

        // 2. Nếu không có trong cookie, lấy từ Header 'Authorization'
        if (!token) {
            // Express thường chuyển header về lowercase (authorization)
            let authHeader = req.headers['authorization'];

            // Nếu không có lowercase, thử check với tên header gốc (Authorization)
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

        // Thêm thông tin User vào request để các middleware/controller sau sử dụng
        req.user = decoded; // Thông tin từ token (id, role,...)
        req.currentUser = user; // Toàn bộ thông tin từ DB
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

/**
 * Middleware kiểm tra vai trò người dùng (chỉ cho phép Admin - roleId 1).
 */
exports.authorizeRole = (req, res, next) => {
    try {
        // req.currentUser phải được thiết lập bởi authenticateToken trước đó
        const user = req.currentUser;

        if (!user) {
            // Nếu không có user (có thể do quên dùng authenticateToken trước đó)
            return res.status(403).json({ error: 'Forbidden: User not authenticated' });
        }

        // Kiểm tra vai trò (giả sử roleId = 1 là Admin)
        if (user.roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized: Insufficient role permissions' });
        }

        next();
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};