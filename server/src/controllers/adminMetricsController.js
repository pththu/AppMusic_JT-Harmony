const { sequelize, Post, Comment, Like, PostReport, Conversation, Message, User } = require("../models");
const { Op } = require("sequelize");

// Chuyển đổi string thành date
function parseDateStr(s) {
  if (!s) return null;
  // Accept yyyy-MM-dd or MM/DD/YYYY
  if (s.includes('-')) {
    // Expect yyyy-MM-dd
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  if (s.includes('/')) {
    const [a, b, yyyy] = s.split('/');
    if (a && b && yyyy) {
      // If first token > 12 assume dd/MM/yyyy, else assume MM/DD/YYYY
      const dd = parseInt(a, 10) > 12 ? a : b;
      const mm = parseInt(a, 10) > 12 ? b : a;
      const iso = `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}T00:00:00`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Chuyển đổi query thành range
function parseRange(query) {
  const today = new Date();
  let end = parseDateStr(query.dateTo);
  if (!end) {
    end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  } else {
    // Make dateTo inclusive by moving end to the start of the next day
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  let start = parseDateStr(query.dateFrom);
  if (!start) start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Ensure start <= end
  if (start.getTime() >= end.getTime()) {
    // swap or adjust to 7 days window ending at end
    start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  return { start, end };
}

// Chuyển đổi granularity thành day, week, month
function parseGranularity(g) {
  const allowed = ["day", "week", "month"];
  return allowed.includes(g) ? g : "day";
}

// Tính tổng số lượng Model trong khoảng thời gian
async function countBetween(Model, dateField, start, end) {
  const where = {};
  where[dateField] = { [Op.gte]: start, [Op.lt]: end };
  return await Model.count({ where });
}

// Lấy summary
exports.getSummary = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const [posts, comments, likes, reports, conversations, messages] = await Promise.all([
      countBetween(Post, "uploadedAt", start, end),
      countBetween(Comment, "commentedAt", start, end),
      countBetween(Like, "liked_at", start, end),
      countBetween(PostReport, "reportedAt", start, end),
      countBetween(Conversation, "createdAt", start, end),
      countBetween(Message, "createdAt", start, end),
    ]);
    return res.status(200).json({ posts, comments, likes, reports, conversations, messages, range: { start, end } });
  } catch (e) {
    console.error("metrics summary error", e);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
};


const tsMap = {
  posts: { table: 'posts', col: 'uploaded_at' },
  comments: { table: 'comments', col: 'commented_at' },
  likes: { table: 'likes', col: 'liked_at' },
  messages: { table: 'messages', col: 'created_at' },
  conversations: { table: 'conversations', col: 'created_at' },
};

// Lấy chuỗi thời gian (timeseries) cho 1 loại dữ liệu
async function timeseriesRaw(kind, start, end, granularity) {
  const m = tsMap[kind];
  if (!m) throw new Error('invalid kind');
  const gran = ['day','week','month'].includes(granularity) ? granularity : 'day';
  const sql = `
    SELECT DATE_TRUNC('${gran}', "${m.col}") AS bucket, COUNT(*)::int AS count
    FROM "${m.table}"
    WHERE "${m.col}" >= :start AND "${m.col}" < :end
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  try {
    const rows = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { start, end },
    });
    return rows.map(r => ({ date: r.bucket, count: parseInt(r.count, 10) }));
  } catch (e) {
    console.error(`metrics timeseriesRaw error for kind=${kind}:`, e.message);
    return [];
  }
}

// Lấy chuỗi thời gian (timeseries) cho 1 loại dữ liệu
exports.getTimeseries = async (req, res) => {
  try {
    const kind = (req.params.kind || "posts").toLowerCase();
    const { start, end } = parseRange(req.query);
    const granularity = parseGranularity(req.query.granularity);
    let data;
    if (["posts","comments","likes","messages","conversations"].includes(kind)) {
      data = await timeseriesRaw(kind, start, end, granularity);
    } else {
      return res.status(400).json({ error: "Invalid timeseries kind" });
    }
    return res.status(200).json({ kind, granularity, data });
  } catch (e) {
    console.error("metrics timeseries error", e);
    return res.status(500).json({ error: "Failed to fetch timeseries" });
  }
};

// Lấy số lượng báo cáo theo trạng thái
exports.getReportsStatusBreakdown = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const rows = await PostReport.findAll({
      where: { reportedAt: { [Op.gte]: start, [Op.lt]: end } },
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });
    return res.status(200).json(rows);
  } catch (e) {
    console.error("metrics reports breakdown error", e);
    return res.status(500).json({ error: "Failed to fetch reports breakdown" });
  }
};

// Lấy số lượng bài đăng theo cover
exports.getPostsCoverBreakdown = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const rows = await Post.findAll({
      where: { uploadedAt: { [Op.gte]: start, [Op.lt]: end } },
      attributes: ["isCover", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["isCover"],
      raw: true,
    });
    return res.status(200).json(rows);
  } catch (e) {
    console.error("metrics posts cover breakdown error", e);
    return res.status(500).json({ error: "Failed to fetch posts cover breakdown" });
  }
};

// Lấy top bài đăng
exports.getTopPosts = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const by = (req.query.by || "likes").toLowerCase();
    const limit = parseInt(req.query.limit, 10) || 5;
    const where = { uploadedAt: { [Op.gte]: start, [Op.lt]: end } };
    let order;
    if (by === "likes") order = [["heartCount", "DESC"]];
    else if (by === "comments") order = [["commentCount", "DESC"]];
    else return res.status(400).json({ error: "Invalid 'by' param" });
    const rows = await Post.findAll({ where, order, limit, include: [{ model: User, as: "User", attributes: ["id","username","fullName","avatarUrl"] }] });
    return res.status(200).json(rows);
  } catch (e) {
    console.error("metrics top posts error", e);
    return res.status(500).json({ error: "Failed to fetch top posts" });
  }
};

// Lấy top người dùng
exports.getTopUsers = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const by = (req.query.by || "posts").toLowerCase();
    const limit = parseInt(req.query.limit, 10) || 5;
    if (by === "posts") {
      const rows = await Post.findAll({
        where: { uploadedAt: { [Op.gte]: start, [Op.lt]: end } },
        attributes: ["userId", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["userId"],
        order: [[sequelize.literal("count"), "DESC"]],
        limit,
        raw: true,
      });
      const users = await User.findAll({ where: { id: { [Op.in]: rows.map(r => r.userId) } }, attributes: ["id","username","fullName","avatarUrl"], raw: true });
      const data = rows.map(r => ({ ...r, User: users.find(u => u.id === r.userId) }));
      return res.status(200).json(data);
    } else if (by === "comments") {
      const rows = await Comment.findAll({
        where: { commentedAt: { [Op.gte]: start, [Op.lt]: end } },
        attributes: ["userId", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        group: ["userId"],
        order: [[sequelize.literal("count"), "DESC"]],
        limit,
        raw: true,
      });
      const users = await User.findAll({ where: { id: { [Op.in]: rows.map(r => r.userId) } }, attributes: ["id","username","fullName","avatarUrl"], raw: true });
      const data = rows.map(r => ({ ...r, User: users.find(u => u.id === r.userId) }));
      return res.status(200).json(data);
    }
    return res.status(400).json({ error: "Invalid 'by' param" });
  } catch (e) {
    console.error("metrics top users error", e);
    return res.status(500).json({ error: "Failed to fetch top users" });
  }
};
