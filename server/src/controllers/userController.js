const { User } = require('../models');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    if (username) where.username = { [Op.iLike]: `%${username}%` };
    if (fullName) where.fullName = { [Op.iLike]: `%${fullName}%` };
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
      return res.status(200).json({ message: 'Thông tin xác thực không hợp lệ', success: false });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully' });
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
