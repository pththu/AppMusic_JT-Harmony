const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { formatUser } = require('../utils/formatter');
const { sampleSize } = require('lodash');
const Op = require('sequelize').Op;
require('dotenv').config();

exports.register = async (req, res) => {
  try {
    const { username, email, password, dob, gender } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !password || !dob) {
      return res.status(200).json({ message: 'Thông tin không được để trống', success: false });
    }

    if (!emailRegex.test(email)) {
      return res.status(200).json({ message: 'Định dạng email không hợp lệ', success: false });
    }

    // kiểm tra dob có hợp lệ không: năm từ 1900 đến năm hiện tại - 5
    if (dob && (new Date(dob) < new Date('1900-01-01') || new Date(dob).getFullYear() > new Date().getFullYear() - 10)) {
      return res.status(200).json({ message: 'Ngày sinh không hợp lệ. Yêu cầu người dùng trên 10 tuổi', success: false });
    }

    const existing = await User.findOne(
      {
        where:
        {
          [Op.or]: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
          ]
        }
      }
    );
    if (existing) {
      return res.status(200).json({
        message: 'Email hoặc tên người dùng đã được sử dụng. Vui lòng liên kết với phương thức đăng nhập khác hoặc sử dụng email/tên người dùng khác',
        success: false
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: passwordHash,
      emailVerified: false,
      notificationEnabled: true,
      roleId: 2, // user,
      otp,
      expireOtp: Date.now() + 10 * 60 * 1000, // 10 minutes
      accountType: ['local'],
      gender,
      dob: dob
    });

    sendMail(
      email,
      'Chào mừng đến JT-Harmony',
      `Xin chào ${username}, chào mừng bạn đến với JT-Harmony!`,
      `<h1>Xin chào ${username}, chào mừng bạn đến với JT-Harmony!</h1>
        <p><h2>Mã OTP của bạn là: ${otp}.</h2></p>
        <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>`,
    );

    return res.status(201).json({
      message: 'Đăng ký thành công',
      user,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(200).json({ message: 'Email và mật khẩu không để trống', success: false });
    }

    if (!emailRegex.test(email)) {
      return res.status(200).json({ message: 'Định dạng email không hợp lệ', success: false });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message: 'Tài khoản không tồn tại. Vui lòng đăng ký.',
        success: false
      });
    };

    if (user.status === 'locked' || user.status === 'banned') {
      return res.status(200).json({
        message: `Tài khoản của bạn đã bị ${user.status === 'locked' ? 'khóa' : 'cấm'}.`,
        success: false
      });
    } else if (user.status === 'inactive') {
      return res.status(200).json({
        message: 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ quản trị viên.',
        success: false
      });
    }

    if (!user.accountType.includes('local')) {
      return res.status(200).json({
        message: 'Tài khoản không bao gồm phương thức đăng nhập này',
        success: false
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        message: 'Mật khẩu không chính xác',
        success: false
      });
    }

    // Generate token
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    // cookie
    res.cookie(
      'accessToken',
      accessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    );

    res.cookie('refreshToken',
      refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    );

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.expiry = jwt.decode(refreshToken).exp;
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: formatUser(user),
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginWithGoogle = async (req, res) => {
  try {
    const userInfor = req.body;
    const existingUser = await User.findOne({ where: { email: userInfor?.email } });
    if (existingUser) {
      if (existingUser.status === 'locked' || existingUser.status === 'banned') {
        return res.status(200).json({
          message: `Tài khoản của bạn đã bị ${existingUser.status === 'locked' ? 'khóa' : 'cấm'}.`,
          success: false
        });
      } else if (existingUser.status === 'inactive') {
        return res.status(200).json({
          message: 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ quản trị viên.',
          success: false
        });
      }
      if (!existingUser.accountType.includes('google')) {
        return res.json({
          message: "Tài khoản không bao gồm phương thức đăng nhập này",
          statusCode: 200,
          success: false
        });
      }
      // Generate token
      const accessToken = generateAccessToken(existingUser.id, existingUser.username);
      const refreshToken = generateRefreshToken(existingUser.id, existingUser.username);

      // cookie
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      // Update token in database
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      existingUser.expiry = jwt.decode(refreshToken).exp;
      existingUser.lastLogin = new Date();
      await existingUser.save();

      return res.json({
        message: "Đăng nhập thành công",
        statusCode: 200,
        success: true,
        user: existingUser
      });
    }

    // username random: user + 4 number random
    const passwordHash = await bcrypt.hash('12345678', 10);
    const user = await User.create({
      username: `user${Math.floor(1000 + Math.random() * 9000)}`,
      email: userInfor.email,
      googleId: userInfor.id,
      password: passwordHash,
      fullName: userInfor.name,
      avatarUrl: userInfor.photo,
      emailVerified: true,
      notificationEnabled: true,
      roleId: 2, // user,
      accountType: ['google', 'local'],
    });

    user.accessToken = generateAccessToken(user.id, user.username);
    user.refreshToken = generateRefreshToken(user.id, user.username);
    user.expiry = jwt.decode(user.refreshToken).exp;
    user.lastLogin = new Date();
    await user.save();

    sendMail(
      user.email,
      'Chào mừng đến JT-Harmony',
      `Xin chào ${user.username}, chào mừng bạn đến với JT-Harmony!`,
      `<h1>Xin chào ${user.fullName}, chào mừng bạn đến với JT-Harmony!</h1>`
    )

    res.status(201).json({
      message: 'Đăng nhập thành công. Mật khẩu khởi tạo là 12345678. Hãy cập nhật mật khẩu để bảo mật tài khoản',
      user,
      success: true,
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

exports.loginWithFacebook = async (req, res) => {
  try {

    const profile = req.body;
    // console.log('profile from facebook', profile);
    const existingUser = await User.findOne({ where: { facebookId: profile?.userID } });
    // console.log('existingUser', existingUser);

    if (existingUser) {
      if (existingUser.status === 'locked' || existingUser.status === 'banned') {
        return res.status(200).json({
          message: `Tài khoản của bạn đã bị ${existingUser.status === 'locked' ? 'khóa' : 'cấm'}.`,
          success: false
        });
      } else if (existingUser.status === 'inactive') {
        return res.status(200).json({
          message: 'Tài khoản của bạn không hoạt động. Vui lòng liên hệ quản trị viên.',
          success: false
        });
      }
      if (!existingUser.accountType.includes('facebook')) {
        return res.status(200).json({
          message: "Tài khoản này đăng nhập bằng phương thức khác",
          success: false
        });
      }
      const accessToken = generateAccessToken(existingUser.id, existingUser.username);
      const refreshToken = generateRefreshToken(existingUser.id, existingUser.username);

      // cookie
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      existingUser.expiry = jwt.decode(refreshToken).exp;
      existingUser.lastLogin = new Date();
      await existingUser.save();

      return res.json({
        message: "Đăng nhập thành công. ",
        success: true,
        user: existingUser
      });
    }

    // username random: user + 4 number random
    const passwordHash = await bcrypt.hash('12345678', 10);
    const user = await User.create({
      username: `user${Math.floor(1000 + Math.random() * 9000)}`,
      facebookId: profile?.userID,
      password: passwordHash,
      fullName: profile.name,
      avatarUrl: profile.imageURL,
      notificationEnabled: true,
      roleId: 2, // user,
      accountType: ['facebook'],
    });

    user.accessToken = generateAccessToken(user.id, user.username);
    user.refreshToken = generateRefreshToken(user.id, user.username);
    user.expiry = jwt.decode(user.refreshToken).exp;
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'Đăng nhập thành công. Hãy cập nhật email và mật khẩu để bảo mật tài khoản',
      user,
      success: true,
    });

  } catch (error) {
    console.log(error);
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: "User info retrieved successfully",
      user
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) return res.status(200).json({ message: 'Không tìm thấy người dùng', success: false });
    user.accessToken = null;
    user.refreshToken = null;
    user.expiry = null;

    res.clearCookie("accessToken");
    res.clearCookie('refreshToken');

    await user.save();
    return res.status(200).json({ message: "Đã đăng xuất", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    let refreshToken;
    refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_MISMATCH'
      });
    }

    if (user.expiry && new Date() > new Date(user.expiry)) {
      return res.status(401).json({
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    const newAccessToken = generateAccessToken(user.id, user.username);

    // Tăng security bằng cách refresh token cũng được thay mới
    // let newRefreshToken = refreshToken;
    // let newExpiry = user.expiry;

    // Nếu refresh token gần hết hạn (< 7 ngày), tạo mới
    // const daysUntilExpiry = (new Date(user.expiry) - new Date()) / (1000 * 60 * 60 * 24);

    // if (daysUntilExpiry < 7) {
    //   newRefreshToken = generateRefreshToken(user.id, user.username);
    //   const refreshDecoded = jwt.decode(newRefreshToken);
    //   newExpiry = new Date(refreshDecoded.exp * 1000);
    // }

    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    user.accessToken = newAccessToken;
    await user.save();

    return res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // Token đã được verify ở middleware
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        fullName: user.fullName,
        avatar: user.avatar,
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log("resetPassword", email, newPassword, user)
    if (!user) return res.status(200).json({ message: 'User not found', success: false });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password reset successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtpEmail = async (req, res) => {
  try {
    const { email, otp, facebookId } = req.body;
    console.log('email: ', email);

    let user = null;

    if (facebookId) {
      user = await User.findOne({ where: { facebookId } });
    } else if (email) {
      user = await User.findOne({ where: { email: email.toLowerCase() } });
    }

    if (!user) return res.status(200).json({ message: 'Không tìm thấy người dùng', success: false });
    console.log(otp, user.otp)
    if (!user.otp) {
      return res.status(200).json({ message: 'Không tìm thấy OTP, vui lòng yêu cầu một cái mới', success: false });
    }
    if (user.otp !== otp) {
      return res.status(200).json({ message: 'OTP không hợp lệ', success: false });
    }
    if (new Date() > new Date(user.expireOtp)) {
      return res.status(200).json({ message: 'OTP đã hết hạn', success: false });
    }
    user.emailVerified = true;
    user.otp = null;
    user.expireOtp = null;

    if (!user.accountType.includes('local')) {
      user.accountType = Array.from(new Set([...user.accountType, 'local']));
      user.email = email;
    }

    await user.save();
    return res.json({
      message: 'Xác thực email thành công',
      success: true,
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.sendOtpEmail = async (req, res) => {
  try {
    const { email, facebookId } = req.body;
    console.log(email, facebookId)
    let user = null;
    if (facebookId) {
      user = await User.findOne({ where: { facebookId: facebookId } });
    } else if (email) {
      user = await User.findOne({ where: { email: email.toLowerCase() } });
    }
    // console.log('user found', user);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireOtp = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otp = otp;
    user.expireOtp = expireOtp;
    await user.save();

    sendMail(
      email,
      'OTP - JT-Harmony',
      `Xin chào ${user.username}, mã OTP mới của bạn là: ${otp}. Mã OTP này sẽ hết hạn trong 10 phút.`,
      `<h1>Xin chào ${user.username}</h1>
        <p><h2>Mã OTP mới của bạn là: ${otp}.</h2></p>
        <p>Mã OTP này sẽ hết hạn trong 10 phút.</p>`,
    );

    return res.json({
      message: 'OTP đã được gửi lại thành công',
      otp,
      success: true,
      user
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.isEmailExist = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (user) {
      return res.status(200).json({ message: 'Email đã được sử dụng', success: true });
    } else {
      return res.status(200).json({ message: 'Email chưa được sử dụng', success: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error ' });
  }
};