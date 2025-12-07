const { User, Follow, Post } = require('../models');
const Op = require('sequelize').Op;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cloudinary = require('../configs/cloudinary');
const { redisClient } = require('../configs/redis');

const formatUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        gender: user.gender === true ? 'male' : 'female',
        favoritesGenres: user.favoritesGenres,
        accountType: user.accountType,
        status: user.status,
        roleId: user.roleId,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}

const GetAllUser = async (req, res) => {
    try {
        const cacheKey = 'all_users';
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        const rows = await User.findAll({
            where: { roleId: 2 }
        });

        const dataFormatted = rows.map(user => formatUser(user));
        const response = {
            message: 'Lấy tất cả người dùng thành công',
            data: dataFormatted,
            success: true
        };
        // await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetUserById = async (req, res) => {
    try {
        const row = await User.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'User not found' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const Search = async (req, res) => {
    try {
        const { id, username, email, fullName, gender, status } = req.body;
        const orConditions = [];

        if (fullName) {
            orConditions.push({ fullName: { [Op.iLike]: `%${fullName}%` } });
        }

        if (username) {
            orConditions.push({
                username: {
                    [Op.iLike]: `%${username}%`
                }
            });
        }

        if (email) {
            orConditions.push({
                email: {
                    [Op.iLike]: `%${email}%`
                }
            });
        }

        if (orConditions.length === 0) {
            return res.json([]);
        }

        const where = {
            [Op.or]: orConditions
        };

        const rows = await User.findAll({ where });
        return res.status(200).json({
            message: 'User search successful',
            data: rows,
            success: true
        });
    } catch (error) {
        console.error(error); // Nên log lỗi
        res.status(500).json({ error: error.message });
    }
}

// không sử dụng
const CreateUser = async (req, res) => {
    try {
        const payload = { ...req.body };
        console.log('payload', payload)

        const isEmailExist = await User.findOne({ where: { email: payload.email } });
        if (isEmailExist) {
            return res.status(200).json({ message: 'Email đã được sử dụng', success: false });
        }

        const isUsernameExist = await User.findOne({ where: { username: payload.username } });
        if (isUsernameExist) {
            return res.status(200).json({ message: 'Username đã được sử dụng', success: false });
        }

        if (!payload.username) {
            payload.username = 'user' + crypto.randomBytes(2).toString('hex');
        }

        if (!payload.fullName) {
            console.log('full')
            res.status(400).json({ error: 'Full name is required' });
            return;
        }

        if (!payload.avatarUrl) {
            payload.avatarUrl = 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg';
        }

        if (payload.gender === 'male' || !payload.gender) {
            payload.gender = true;
        } else if (payload.gender === 'female') {
            payload.gender = false;
        }

        if (payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        } else {
            payload.password = await bcrypt.hash('sapassword', 10);
        }

        if (!payload.accountType) {
            console.log('accountType is required');
            res.status(400).json({ error: 'Account type is required' });
            return;
        }

        if (payload.accountType.includes('local') && !payload.email) {
            console.log('Email is required for local account type');
            res.status(400).json({ error: 'Email is required for local account type' });
            return;
        } else {
            payload.emailVerified = true;
        }

        if (payload.accountType.includes('google') && !payload.googleId) {
            console.log('Google ID is required for google account type');
            res.status(400).json({ error: 'Google ID is required for google account type' });
            return;
        } else {
            payload.emailVerified = true;
        }

        if (payload.accountType.includes('google') && !payload.accountType.includes('local')) {
            payload.accountType.push('local');
        }

        if (payload.accountType.includes('facebook') && !payload.facebookId) {
            console.log('Facebook ID is required for facebook account type');
            res.status(400).json({ error: 'Facebook ID is required for facebook account type' });
            return;
        } else {
            payload.emailVerified = false;
        }

        if (!payload.notificationEnabled) {
            payload.notificationEnabled = false;
        }

        if (!payload.streamQuality) {
            payload.streamQuality = 'low';
        }

        if (!payload.status) {
            payload.status = 'active';
        }

        if (!payload.roleId) {
            payload.roleId = 2; // default user role
        }

        if (!payload.favoritesGenres) {
            payload.favoritesGenres = [];
            payload.completedOnboarding = false;
        } else {
            payload.completedOnboarding = true;
        }

        const row = await User.create(payload);

        if (!row) {
            console.log('tao nguoi dung that bai')
            res.status(500).json({ error: 'Tạo người dùng thất bại' });
        }
        await redisClient.del('all_users');
        res.status(200).json({
            message: 'Tạo người dùng thành công',
            data: formatUser(row),
            success: true
        });
    } catch (err) {
        console.log('Lỗi tạo người dùng:', err);
        res.status(500).json({ error: err.message + " Lỗi tạo người dùng" });
    }
};

const UpdateInforUser = async (req, res) => {
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
const ChangePassword = async (req, res) => {
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

const DeleteUser = async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({
            message: 'User deleted',
            success: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const DeleteUsers = async (req, res) => {
    try {
        const userIds = req.body;
        console.log('userIds', userIds)

        // delete multiple users
        const deleted = await User.destroy({ where: { id: userIds } });
        if (!deleted) return res.status(404).json({ error: 'No users found to delete' });
        return res.status(200).json({
            message: 'Users deleted',
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const LinkSocialAccount = async (req, res) => {
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

const SelfLockAccount = async (req, res) => {
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

const MergeAccount = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findByPk(req.user.id);
        const mergeUser = await User.findByPk(userId);

        // console.log('user', user.dataValues);
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

const ChangeAvatar = async (req, res) => {
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

const GetUserProfileSocial = async (req, res) => {
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

const SearchUsers = async (req, res) => {
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

const AddFavoriteGenres = async (req, res) => {
    try {
        const { genres } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(200).json({ message: 'Không thể tìm thấy người dùng', success: false });
        }

        for (const genre of genres) {
            if (user.favoritesGenres.some(g => g.toLowerCase() === genre.toLowerCase())) {
                continue; // Bỏ qua thể loại đã tồn tại (không phân biệt chữ hoa/thường)
            }
            user.favoritesGenres = Array.from(new Set([...user.favoritesGenres, genre]));
        }

        await user.save();

        return res.status(200).json({
            message: 'Thêm thể loại yêu thích thành công',
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Add favorite genres error:', error);
        res.status(500).json({
            message: error.message || 'Failed to add favorite genres',
            success: false
        });
    }
};

const UpdateCompletedOnboarding = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(200).json({ message: 'Không thể tìm thấy người dùng', success: false });
        }
        user.completedOnboarding = true;
        await user.save();
        return res.status(200).json({
            message: 'Cập nhật trạng thái hoàn thành onboarding thành công',
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update completed onboarding error:', error);
        res.status(500).json({
            message: error.message || 'Failed to update completed onboarding',
            success: false
        });
    }
};

const BannedUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ error: 'UserId is required' });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.status === 'banned') {
            return res.status(400).json({ error: 'User is already banned' });
        }

        user.status = 'banned';
        await user.save();

        return res.status(200).json({
            message: 'User has been banned successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const UnLockedUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ error: 'UserId is required' });
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.status !== 'locked') {
            return res.status(400).json({ error: 'User is not locked' });
        }

        user.status = 'active';
        await user.save();
        return res.status(200).json({
            message: 'User has been unlocked successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    GetAllUser,
    GetUserById,
    CreateUser,
    AddFavoriteGenres,
    Search,
    LinkSocialAccount,
    SelfLockAccount,
    MergeAccount,
    UpdateInforUser,
    ChangePassword,
    DeleteUser,
    DeleteUsers,
    ChangeAvatar,
    GetUserProfileSocial,
    SearchUsers,
    UpdateCompletedOnboarding,
    BannedUser,
    UnLockedUser,
}