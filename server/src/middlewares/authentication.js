const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

/**
 * Middleware xác thực token (JWT) từ Cookie hoặc Header Authorization.
 */
exports.authenticateToken = async (req, res, next) => {
    try {
        console.log(1)
        let token;
        token = req.cookies['accessToken'];
        console.log('req.cookies: ', req.cookies['accessToken'])

        console.log('token', token)

        console.log(2)
        if (!token) {
            console.log(3)
            const authHeader = req.headers['authorization'] || req.headers['Authorization'];

            console.log(4)
            if (authHeader && authHeader.startsWith('Bearer ')) {
                console.log(5)
                token = authHeader.split(' ')[1];
            }
        }

        console.log(7)
        if (!token) {
            console.log(8)
            return res.status(401).json({ error: 'Access token required', code: 'TOKEN_MISSING' });
        }

        console.log(9)
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log('decoded', decoded);
        console.log(10)

        // Check if user exists
        const user = await User.findByPk(decoded.id);
        console.log(11)
        if (!user) {
            console.log(12)
            return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
        }

        console.log(13)
        // Thêm thông tin User vào request để các middleware/controller sau sử dụng
        req.user = decoded; // Thông tin từ token (id, role,...)
        req.currentUser = user; // Toàn bộ thông tin từ DB
        next();

    } catch (err) {
        console.log(14)
        if (err.name === 'TokenExpiredError') {
            console.log(15)
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        console.log(16)
        if (err.name === 'JsonWebTokenError') {
            console.log(17)
            return res.status(401).json({
                error: 'Invalid token',
                code: 'TOKEN_INVALID'
            });
        }
        console.log(18)
        console.error('LỖI AUTH KHÔNG XÁC ĐỊNH:', err.message);
        return res.status(500).json({
            error: 'Internal server error: ' + err.message,
            code: 'SERVER_ERROR'
        });
    }
};

exports.optionalAuthenticateToken = async (req, res, next) => {
    let token;

    // 1. Lấy token từ Cookie ('accessToken')
    token = req.cookies && req.cookies['accessToken'];

    // 2. Nếu không có trong cookie, lấy từ Header 'Authorization' (logic robust)
    if (!token) {
        let authHeader = req.headers['authorization']; // Thử lowercase trước

        if (!authHeader) {
            authHeader = req.headers['Authorization']; // Thử uppercase
        }

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    //  LOG MỚI: Báo hiệu kết quả tìm kiếm Token
    if (!token) {
        req.user = null;
        req.currentUser = null;
        // Case A: Không có token
        return next();
    }

    // 3. CÓ token, Bắt đầu xác thực
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'username', 'roleId', 'fullName']
        });

        if (user) {
            //  Gán THÀNH CÔNG: Đảm bảo ID là kiểu Number
            req.user = {
                id: Number(user.id), // Ép kiểu an toàn
                username: user.username,
                roleId: user.roleId,
                fullName: user.fullName
            };
            req.currentUser = user;

            // Case B: Thành công
        } else {
            // Case C: Token hợp lệ nhưng user không tồn tại trong DB
            console.warn("OPTIONAL AUTH: User từ token không tồn tại. Tiếp tục với null.");
            req.user = null;
            req.currentUser = null;
        }

        return next();

    } catch (err) {
        // Case D: Token KHÔNG HỢP LỆ (hết hạn, sai chữ ký)
        console.warn(`OPTIONAL AUTH: Token KHÔNG HỢP LỆ (${err.name}). Tiếp tục với null.`);
        req.user = null;
        req.currentUser = null;
        return next();
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

