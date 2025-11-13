const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { ConversationMember, Message, User } = require('../models');

function isAdmin(req) {
  return !!(
    req && req.currentUser && (req.currentUser.roleId === 1 || req.currentUser.role_id === 1)
  );
}

function buildDateRangeWhere(dateFrom, dateTo) {
  const where = {};
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      const start = new Date(`${dateFrom}T00:00:00`);
      where.createdAt[Op.gte] = start;
    }
    if (dateTo) {
      const endExclusive = new Date(`${dateTo}T00:00:00`);
      endExclusive.setDate(endExclusive.getDate() + 1);
      where.createdAt[Op.lt] = endExclusive;
    }
  }
  return where;
}

function buildAdminConversationsInclude(memberId) {
  const include = [
    {
      model: Message,
      as: 'LastMessage',
      attributes: ['content', 'createdAt', 'senderId'],
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    },
    {
      model: ConversationMember,
      as: 'Members',
      attributes: ['userId'],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    },
    {
      model: User,
      as: 'Participants',
      attributes: ['id', 'username', 'fullName'],
      through: { attributes: [] },
    },
  ];

  if (memberId) {
    include[1].where = { userId: parseInt(memberId, 10) };
    include[1].required = true;
  }

  return include;
}

function formatPrivateChatTitle(conv) {
  let chatTitle = conv.name;
  const participants = conv.Participants && conv.Participants.length > 0
    ? conv.Participants
    : (conv.Members ? conv.Members.map((m) => m.User) : []);
  const names = participants
    .map((u) => (u.fullName || u.username || '').trim())
    .filter((n) => n)
    .sort((a, b) => a.localeCompare(b));

  if (names.length >= 2) chatTitle = `${names[0]} ↔ ${names[1]}`;
  else if (names.length === 1) chatTitle = names[0];
  else chatTitle = chatTitle || 'Private Chat';

  return chatTitle;
}

function parsePagination(req) {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  return { limit, offset };
}

function buildMessageWhere(query) {
  const where = {};
  if (query.conversationId) where.conversationId = parseInt(query.conversationId, 10);
  if (query.senderId) where.senderId = parseInt(query.senderId, 10);
  if (query.type) where.type = query.type;
  const dateWhere = buildDateRangeWhere(query.dateFrom, query.dateTo);
  if (dateWhere.createdAt) where.createdAt = dateWhere.createdAt;
  return where;
}

module.exports = {
  isAdmin,
  buildDateRangeWhere,
  buildAdminConversationsInclude,
  formatPrivateChatTitle,
  parsePagination,
  buildMessageWhere,
  Op,
};
