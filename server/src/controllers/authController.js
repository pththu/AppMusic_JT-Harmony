const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const Op = require('sequelize').Op;
// const admin = require("../configs/firebase");

exports.register = async (req, res) => {
  try {
    const { username, email, password, dob, gender } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log({ username, email, password, dob, gender });

    if (!username || !email || !password || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log(1);
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    console.log(2);
    /**
     * kiểm tra dob có hợp lệ không
     * năm từ 1900 đến năm hiện tại - 5
    */
   if (dob && (dob < new Date('1900-01-01') || dob > new Date(new Date().getFullYear() - 5, 11, 31))) {
     return res.status(400).json({ message: 'Invalid date of birth' });
    }
    
    console.log(3);
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
    console.log(4);
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }
    
    console.log(5);
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    
    console.log(6);
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
      accountType: 'local',
      gender,
      dob: dob
    });

    sendMail(
      email,
      'Welcome to JT-Harmony',
      `Hello ${username}, welcome to JT-Harmony!`,
      `<h1>Hello ${username}, welcome to JT-Harmony!</h1>
        <p><h2>Your OTP is: ${otp}.</h2></p>
        <p>This OTP will expire in 10 minutes.</p>`,
    )

    res.status(201).json({
      message: 'User registered successfully',
      data: user,
      success: true,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    // cookie
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    user.expiry = jwt.decode(refreshToken).exp;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      statusCode: 200,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.loginWithGoogle = async (req, res) => {
  try {
    const userInfor = req.body;
    console.log('userInfor', userInfor);
    const existingUser = await User.findOne({ where: { email: userInfor?.email } });
    if (existingUser) {
      console.log(existingUser);
      if (existingUser.accountType !== 'google') {
        return res.json({
          message: "Tài khoản này đăng nhập bằng phương thức khác",
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
    const passwordHash = await bcrypt.hash('11111111', 10);
    const user = await User.create({
      username: `user${Math.floor(1000 + Math.random() * 9000)}`,
      email: userInfor.email,
      password: passwordHash,
      fullName: userInfor.name,
      avatarUrl: userInfor.photo,
      emailVerified: true,
      notificationEnabled: true,
      roleId: 2, // user,
      accountType: 'google',
    });

    user.accessToken = generateAccessToken(user.id, user.username);
    user.refreshToken = generateRefreshToken(user.id, user.username);
    user.expiry = jwt.decode(user.refreshToken).exp;
    user.lastLogin = new Date();
    await user.save();

    sendMail(
      user.email,
      'Welcome to JT-Harmony',
      `Hello ${user.username}, welcome to JT-Harmony!`,
      `<h1>Hello ${user.fullName}, welcome to JT-Harmony!</h1>`
    )

    res.status(201).json({
      message: 'Mật khẩu khởi tạo là 1111111. Vui lòng đổi mật khẩu sau khi đăng nhập',
      user,
      success: true,
    });


  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.user)
    const user = await User.findByPk(userId);
    console.log(user)
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
    console.log(req.user)
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) return res.sendStatus(204);

    user.refreshToken = null;
    res.clearCookie("accessToken");
    await user.save();

    return res.status(200).json({ message: "Logged out", statusCode: 200 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log(decoded)

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    if (new Date() > new Date(user.expiry)) {
      const newRefreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET || 'secret',
        { expiresIn: process.env.REFRESH_TOKEN_LIFE || '30d' }
      );

      user.refreshToken = newRefreshToken;
      user.expiry = jwt.decode(newRefreshToken).exp;
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET || 'secret',
      { expiresIn: process.env.ACCESS_TOKEN_LIFE || '7d' }
    );

    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    user.accessToken = newAccessToken;
    await user.save();
    return res.json(
      { message: "Token refreshed successfully" }
    )
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtpEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log(otp, user, email)
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > new Date(user.expireOtp)) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    user.emailVerified = true;
    user.otp = null;
    user.expireOtp = null;
    await user.save();
    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.reSendOtpEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireOtp = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otp = otp;
    user.expireOtp = expireOtp;
    await user.save();

    sendMail(
      email,
      'Resend OTP - JT-Harmony',
      `Hello ${user.username}, your new OTP is: ${otp}. This OTP will expire in 10 minutes.`,
      `<h1>Hello ${user.username}</h1>
        <p><h2>Your new OTP is: ${otp}.</h2></p>
        <p>This OTP will expire in 10 minutes.</p>`,
    );

    return res.json({
      message: 'OTP resent successfully',
      otp, // For testing purposes only. Remove in production.
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}