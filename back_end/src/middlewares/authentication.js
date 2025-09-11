const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { json } = require('sequelize');
require('dotenv').config();

exports.authenticateToken = async (req, res, next) => {
  try {
    // Lấy token từ cookie hoặc header
    const token = req.cookies['accessToken'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if user exists and token matches
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if token matches the one in database
    if (user.accessToken !== token) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request
    req.user = decoded;
    req.currentUser = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.authorizeRole = (req, res, next) => {
  try {
    const user = req.currentUser;
    console.log(user);
    if (!user) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if user has the required role = admin
    if (user.roleId !== 1) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}