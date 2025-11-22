const { Notification, User, Post } = require('../models');
const notificationEmitter = require('../sockets/notificationEmitter');

const actorAttributes = ['id', 'username', 'avatarUrl', 'fullName'];
const postAttributes = ['id', 'userId', 'content', 'fileUrl', 'heartCount', 'shareCount', 'commentCount', 'uploadedAt'];

async function createNotification({ userId, actorId, postId = null, type, message = '', metadata = {} }) {
  try {
    if (!userId || !actorId || !type) return null;
    if (userId === actorId) return null;

    const notification = await Notification.create({
      userId,
      actorId,
      postId,
      type,
      message,
      metadata,
    });

    const include = [
      { model: User, as: 'Actor', attributes: actorAttributes },
    ];

    if (postId) {
      include.push({ model: Post, as: 'Post', attributes: postAttributes });
    }

    const notificationRecord = await Notification.findByPk(notification.id, { include });
    const payload = notificationRecord ? notificationRecord.toJSON() : notification.toJSON();

    if (payload.Post && payload.Post.fileUrl) {
      try {
        payload.Post.fileUrl = JSON.parse(payload.Post.fileUrl);
        if (!Array.isArray(payload.Post.fileUrl)) {
          payload.Post.fileUrl = [payload.Post.fileUrl];
        }
      } catch (error) {
        payload.Post.fileUrl = payload.Post.fileUrl ? [payload.Post.fileUrl] : [];
      }
    }

    notificationEmitter.emit('notification:new', {
      receiverId: userId,
      notification: payload,
    });

    return payload;
  } catch (error) {
    console.error('Error creating notification:', error.message || error);
    return null;
  }
}

module.exports = { createNotification };
