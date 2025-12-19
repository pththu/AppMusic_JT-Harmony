const { Op } = require('sequelize');
const { createNotification } = require("../utils/notificationHelper");
const { ReportItem } = require('../models');

const REASONGS = [
  "spam",
  "hate_speech",
  "unwanted_content",
  "self_harm",
  "misinformation",
  "adult_content"
]

const reportPost = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId, reason } = req.body;
    if (!postId || !reason) {
      return res.status(400).json({ message: 'postId and reason are required' });
    }

    if (!REASONGS.includes(reason)) {
      return res.status(400).json({ message: 'Invalid reason for report' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingReport = await ReportItem.findOne({
      where: {
        userId,
        itemId: postId,
        type: 'post',
      }
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    const report = await ReportItem.create({
      userId,
      itemId: postId,
      type: 'post',
      reason,
      status: 'pending',
      reportedAt: new Date(),
    });

    const notification = await createNotification({
      userId: post.userId,
      actorId: userId,
      postId: post.id,
      type: 'post_reported',
      message: 'Your post has been reported by a user.',
      metadata: { reportId: report.id },
    });

    return res.status(201).json({ message: 'Post reported successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  reportPost,
};