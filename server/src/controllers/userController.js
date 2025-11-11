const { User, Follow, Post } = require('../models');
const Op = require('sequelize').Op;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require('../configs/cloudinary');

exports.getAllUser = async (req, res) => {
    try {
        const rows = await User.findAll();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const row = await User.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Tìm kiếm với nhiều tiêu chí
 * /search?fullName=admin
 * /search?email=admin@example.com
 * /search?gender=male
 * /search?status=active
 * /search?username=abc&gender=false
 */
exports.search = async (req, res) => {
    try {
        const { id, username, email, fullName, gender, status } = req.query;
        const where = {};

        if (id) where.id = id;
        if (username) where.username = {
            [Op.iLike]: `%${username}%`
        };
        if (fullName) where.fullName = {
            [Op.iLike]: `%${fullName}%`
        };
        if (email) where.email = email;
        if (gender) where.gender = gender;
        if (status) where.status = status;

        const rows = await User.findAll({ where });
        return res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// không sử dụng
exports.createUser = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        }
        const row = await User.create(payload);
        res.status(201).json(row);
    } catch (err) {
        res.status(500).json({ error: err.message + "Lỗi r" });
    }
};

exports.updateInforUser = async (req, res) => {
    try {
        const payload = { ...req.body };
        const user = await User.findByPk(req.user.id);

        if (!payload.gender && user.gender === null) {
            payload.gender = false;
        }

        if (!payload.fullName && user.fullName === null) {
            payload.fullName = 'user' + crypto.randomBytes(2).toString('hex');
        }

        if (!payload.avatarUrl && user.avatarUrl === null) {
            payload.avatarUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg';
        }

        const isUsernameExist = await User.findOne({ where: { username: payload.username } });
        if (isUsernameExist && isUsernameExist.id !== req.user.id) {
            return res.status(200).json({ message: 'Username đã được sử dụng', success: false });
        };

        await user.update(payload);

        return res.json({
            message: "User information updated successfully",
            user,
            success: true
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Đổi mật khẩu sau khi đăng nhập
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(200).json({ message: 'Không thể tìm thấy người dùng', success: false });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(200).json({ message: 'Sai mật khẩu', success: false });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.json({ message: 'Đổi mật khẩu thành công', success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'User not found' });
        return res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.linkSocialAccount = async (req, res) => {
    try {
        const { userInfor, provider } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(200).json({ message: 'Không thể tìm thấy người dùng', success: false });
        }

        if (provider !== 'google' && provider !== 'facebook') {
            return res.status(200).json({ message: 'Provider không hợp lệ', success: false });
        };

        if (provider === 'facebook') {
            if (user.facebookId !== null) {
                return res.status(200).json({ message: 'Tài khoản đã được liên kết với Facebook', success: false });
            };

            const existingUser = await User.findOne({ where: { facebookId: userInfor.userID } });
            if (existingUser) {
                if (existingUser.googleId === null || !existingUser.googleId) {
                    return res.status(200).json({
                        message: 'Một tài khoản đã tổn tại với Facebook này. Bạn có muốn gộp tài khoản không?',
                        success: false,
                        userId: existingUser.id
                    })
                }
                return res.status(200).json({ message: 'Tài khoản Facebook đã được liên kết với người dùng khác', success: false });
            };

            if (userInfor.imageURL !== null && user.avatarUrl === null) {
                user.avatarUrl = userInfor.imageURL;
            }

            if (user.fullName === null) {
                user.fullName = userInfor.name;
            }

            user.facebookId = userInfor.userID;
            user.accountType = Array.from(new Set([...user.accountType, 'facebook']));

        } else if (provider === 'google') {
            if (user.email && user.email !== userInfor.email) {
                return res.status(200).json({ message: 'Email không khớp, vui lòng sử dụng đúng email đã đăng ký', success: false });
            };

            if (user.googleId !== null) {
                return res.status(200).json({ message: 'Tài khoản đã được liên kết với Google', success: false });
            };

            const existingUser = await User.findOne({ where: { googleId: userInfor.id } });
            if (existingUser) {
                if (existingUser.facebookId === null || !existingUser.facebookId) {
                    return res.status(200).json({
                        message: 'Một tài khoản đã tổn tại với Google này. Bạn có muốn gộp tài khoản không?',
                        success: false,
                        userId: existingUser.id
                    })
                }

                return res.status(200).json({ message: 'Tài khoản Google đã được liên kết với người dùng khác', success: false });
            };

            if (userInfor.photo !== null && user.avatarUrl === null) {
                user.avatarUrl = userInfor.photo;
            }

            if (user.fullName === null) {
                user.fullName = userInfor.name;
            }

            if (user.email === null) {
                user.email = userInfor.email;
            }

            if (user.emailVerified === false || user.emailVerified === null) {
                user.emailVerified = true;
            }

            user.password = user.password || await bcrypt.hash('12345678', 10);
            user.googleId = userInfor.id;
            user.accountType = Array.from(new Set([...user.accountType, 'google']));
            if (!user.accountType.includes('local')) {
                user.accountType = Array.from(new Set([...user.accountType, 'local']));
            }
        }

        await user.save();
        return res.json({ message: 'Liên kết tài khoản thành công', success: true, user });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
};

exports.selfLockAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(200).json({ message: 'Không thể tìm thấy người dùng', success: false });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ message: 'Sai mật khẩu', success: false });
        }

        user.status = 'locked';
        await user.save();
        return res.json({ message: 'Tài khoản đã bị khóa', success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.mergeAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(req.user.id);
        const mergeUser = await User.findByPk(userId);

        console.log('user', user.dataValues);
        console.log('mergeUser', mergeUser.dataValues);

        if (!user || !mergeUser) {
            return res.status(200).json({ message: 'Người dùng không tồn tại', success: false });
        }

        // Gộp thông tin tài khoản - ưu tiên thông tin của user hiện tại
        user.email = user.email || mergeUser.email;
        user.facebookId = user.facebookId || mergeUser.facebookId;
        user.googleId = user.googleId || mergeUser.googleId;
        user.avatarUrl = user.avatarUrl || mergeUser.avatarUrl;
        user.fullName = user.fullName || mergeUser.fullName;
        user.accountType = Array.from(new Set([...user.accountType, ...mergeUser.accountType]));
        user.emailVerified = true;

        await Promise.all([
            user.save(),
            mergeUser.destroy()
        ]);
        return res.status(200).json({ message: 'Gộp tài khoản thành công', success: true, user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.changeAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được upload',
            });
        }

        const data = {
            url: req.file.path,
            publicId: req.file.filename,
            thumbnail: cloudinary.url(req.file.filename, {
                width: 300,
                height: 300,
                crop: 'fill'
            })
        };

        if (req.file.path) {
            const user = await User.findByPk(req.user.id);
            user.avatarUrl = req.file.path;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Upload thành công',
            data
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi upload hình ảnh',
            error: error.message
        });
    }
};

exports.getUserProfileSocial = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id; // ID của người dùng đang xem (từ authenticateToken)

    try {
        const user = await User.findByPk(userId, {
            attributes: [
                'id',
                'username',
                'avatarUrl',
                'fullName',
                'bio',
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // // 1. Tính toán số lượng người theo dõi (Follower Count)
        // const followerCount = await Follow.count({
        //     where: {
        //         userFolloweeId: userId
        //     }
        // });

        // // 2. Tính toán số lượng đang theo dõi (Following Count)
        // const followingCount = await Follow.count({
        //     where: {
        //         followerId: userId // Những người người này đang theo dõi
        //     }
        // });

        // // 3. Kiểm tra trạng thái Theo dõi (Is Following)
        // const isFollowing = await Follow.findOne({
        //     where: {
        //         followerId: currentUserId, // Người dùng hiện tại
        //         // ✅ SỬ DỤNG userFolloweeId: đang theo dõi người dùng này
        //         userFolloweeId: userId,
        //         artistFolloweeId: null, // Đảm bảo chỉ kiểm tra việc theo dõi User
        //     }
        // });

        // const profileData = {
        //     ...user.toJSON(),
        //     followerCount: followerCount,
        //     followingCount: followingCount,
        //     isFollowing: !!isFollowing // Chuyển thành boolean
        // };

        const profileData = {
            ...user.toJSON(),
            followerCount: 0,
            followingCount: 0,
            isFollowing: false // Chuyển thành boolean
        };

        res.json(profileData);
    } catch (err) {
        console.error('Lỗi khi lấy Profile Social:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// ----------------------------------------------------------------------
// Toggle Theo dõi/Hủy theo dõi
// POST /api/v1/users/:userId/follow
// ----------------------------------------------------------------------
exports.toggleFollow = async (req, res) => {
    // const targetUserId = req.params.userId;
    // const currentUserId = req.user.id;

    // if (parseInt(targetUserId) === currentUserId) {
    //     return res.status(400).json({ error: 'Không thể tự theo dõi chính mình' });
    // }

    // try {
    //     // Tìm hoặc tạo bản ghi Follow
    //     const [follow, created] = await Follow.findOrCreate({
    //         where: {
    //             followerId: currentUserId,
    //             userFolloweeId: targetUserId
    //         },
    //         defaults: {
    //             followerId: currentUserId,
    //             userFolloweeId: targetUserId,
    //             // ✅ CẦN THIẾT: Gán artistFolloweeId = null (Hoặc giá trị mặc định của bạn)
    //             artistFolloweeId: null,
    //             // ✅ CẦN THIẾT: Gán followedAt (Nếu không để defaultValue)
    //             followedAt: new Date(),
    //         }
    //     });

    //     let isFollowing;

    //     if (!created) {
    //         // Đã tồn tại -> Hủy theo dõi
    //         await follow.destroy();
    //         isFollowing = false;
    //     } else {
    //         // Mới tạo -> Đã theo dõi
    //         isFollowing = true;
    //     }

    //     // Trả về trạng thái mới cho client
    //     res.json({ message: isFollowing ? 'Theo dõi thành công' : 'Hủy theo dõi thành công', isFollowing });

    // } catch (err) {
    //     console.error('Lỗi khi Toggle Follow:', err);
    //     res.status(500).json({ error: err.message });
    // }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q: query } = req.query;

        if (!query) {
            return res.status(400).json({
                error: 'Query parameter is required',
                success: false
            });
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { fullName: { [Op.iLike]: `%${query}%` } },
                    { username: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ['id', 'fullName', 'username', 'avatarUrl', 'bio'],
            limit: 20
        });

        return res.status(200).json({
            message: 'User search successful',
            data: users,
            success: true
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            message: error.message || 'Failed to search users',
            success: false
        });
    }
}