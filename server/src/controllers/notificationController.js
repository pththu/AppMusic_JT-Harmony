const { Notification, User, Post } = require('../models');

const actorAttributes = ['id', 'username', 'avatarUrl', 'fullName'];
const postAttributes = ['id', 'userId', 'content', 'fileUrl', 'heartCount', 'shareCount', 'commentCount', 'uploadedAt'];

function mapNotification(notification) {
  const json = notification.toJSON();
  if (json.Post && json.Post.fileUrl) {
    try {
      json.Post.fileUrl = JSON.parse(json.Post.fileUrl);
      if (!Array.isArray(json.Post.fileUrl)) {
        json.Post.fileUrl = [json.Post.fileUrl];
      }
    } catch (error) {
      json.Post.fileUrl = json.Post.fileUrl ? [json.Post.fileUrl] : [];
    }
  }
  return json;
}

exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      limit: limitRaw = 20,
      offset: offsetRaw = 0,
      type,
      isRead,
    } = req.query;

    const limit = Math.min(parseInt(limitRaw, 10) || 20, 50);
    const offset = parseInt(offsetRaw, 10) || 0;

    const where = { userId };
    if (type) {
      where.type = Array.isArray(type) ? type : type.split(',');
    }
    if (isRead === 'true') where.isRead = true;
    if (isRead === 'false') where.isRead = false;

    const notifications = await Notification.findAll({
      where,
      include: [
        { model: User, as: 'Actor', attributes: actorAttributes },
        { model: Post, as: 'Post', attributes: postAttributes, required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = notifications.map(mapNotification);
    res.json({ items, pagination: { limit, offset, count: items.length } });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id, 10);
    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const [updated] = await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read', updated });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.count({ where: { userId, isRead: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error counting unread notifications:', err);
    res.status(500).json({ error: 'Failed to get unread count.' });
  }
};
