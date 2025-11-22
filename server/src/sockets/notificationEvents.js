const notificationEmitter = require('./notificationEmitter');

module.exports = function notificationEvents(io) {
  notificationEmitter.on('notification:new', ({ receiverId, notification }) => {
    if (!receiverId || !notification) return;
    const room = `user_${receiverId}`;
    io.to(room).emit('notification:new', notification);
  });
};
