const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');
const Op = require('sequelize').Op;

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log({ username, email, password });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
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
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: passwordHash,
      emailVerified: false,
      notificationEnabled: true,
      roleId: 2, // user,
      otp,
      expireOtp: Date.now() + 10 * 60 * 1000 // 10 minutes
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
      data: user
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
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET || 'secret',
      { expiresIn: process.env.ACCESS_TOKEN_LIFE || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET || 'secret',
      { expiresIn: process.env.REFRESH_TOKEN_LIFE || '30d' }
    );

    // cookie
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Update token in database
    await User.update(
      {
        accessToken,
        refreshToken,
        expiry: jwt.decode(refreshToken).exp,
        lastLogin: new Date()
      },
      { where: { id: user.id } }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token: {
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
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

    return res.status(200).json({ message: "Logged out" });
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