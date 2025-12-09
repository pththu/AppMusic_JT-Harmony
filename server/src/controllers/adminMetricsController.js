const { genAI } = require("../configs/gemini");
const { sequelize, Post, Comment, Like, PostReport, Conversation, Message, User, SearchHistory } = require("../models");
const { Op } = require("sequelize");

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

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
      const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}T00:00:00`;
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

    if (posts === null || comments === null || likes === null || reports === null || conversations === null || messages === null) {
      return res.status(500).json({ error: "Failed to fetch summary counts" });
    }
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
  const gran = ['day', 'week', 'month'].includes(granularity) ? granularity : 'day';
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
    if (["posts", "comments", "likes", "messages", "conversations"].includes(kind)) {
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
    if (!rows) {
      return res.status(500).json({ error: "Failed to fetch reports breakdown" });
    }
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
    if (!rows) {
      return res.status(500).json({ error: "Failed to fetch posts cover breakdown" });
    }
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
    const rows = await Post.findAll({ where, order, limit, include: [{ model: User, as: "User", attributes: ["id", "username", "fullName", "avatarUrl"] }] });
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
      const users = await User.findAll({ where: { id: { [Op.in]: rows.map(r => r.userId) } }, attributes: ["id", "username", "fullName", "avatarUrl"], raw: true });
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
      const users = await User.findAll({ where: { id: { [Op.in]: rows.map(r => r.userId) } }, attributes: ["id", "username", "fullName", "avatarUrl"], raw: true });
      const data = rows.map(r => ({ ...r, User: users.find(u => u.id === r.userId) }));
      return res.status(200).json(data);
    }
    return res.status(400).json({ error: "Invalid 'by' param" });
  } catch (e) {
    console.error("metrics top users error", e);
    return res.status(500).json({ error: "Failed to fetch top users" });
  }
};



/////////////////////////////////////
exports.analyzeBehaviorSearch = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const histories = req.body.histories;

    // const histories = await SearchHistory.findAll({
    //   where: {
    //     searchedAt: { [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Lấy lịch sử trong 90 ngày gần nhất
    //   }
    // });
    if (!histories || histories.length === 0) {
      return res.status(200).json({
        message: 'No search history data found for analysis.',
        topKeywords: [],
        trendsOverTime: []
      });
    }

    const z = require("zod"); // Giả định thư viện zod đã được import
    const { zodToJsonSchema } = require("zod-to-json-schema"); // Giả định hàm này đã được import

    const keywordSchema = z.object({
      keyword: z.string().describe("Từ khóa hoặc cụm từ phổ biến"),
      count: z.number().describe("Số lần xuất hiện"),
    });

    const trendSchema = z.object({
      timePeriod: z.string().describe("Khoảng thời gian (ví dụ: 20:00 - 21:00 - theo giờ)"),
      searchCount: z.number().describe("Tổng số lượt tìm kiếm trong khoảng thời gian đó"),
    });

    const analysisSchema = z.object({
      topKeywords: z.array(keywordSchema).describe("Danh sách các từ khóa/cụm từ phổ biến nhất"),
      trendsOverTime: z.array(trendSchema).describe("Phân tích xu hướng tìm kiếm theo thời gian"),
    });

    const formattedHistories = histories.map((h) => {
      return { query: h.query, searchedAt: h.searchedAt };
    });

    const searchContext = `Lịch sử tìm kiếm của người dùng: ${JSON.stringify(formattedHistories)}`;
    const prompt = `
      Bạn là chuyên gia phân tích và tổng hợp hành vi người dùng trên nền tảng âm nhạc.
      DỮ LIỆU LỊCH SỬ TÌM KIẾM HỆ THỐNG:
      ${searchContext}

      NHIỆM VỤ:
      Dựa trên tất cả lịch sử tìm kiếm được cung cấp.
      Phân tích và tóm tắt các xu hướng tìm kiếm chính mà người dùng quan tâm.
      1. Xác định các xu hướng tìm kiếm phổ biến nhất (ví dụ: Tên nghệ sĩ, tên bài hát, thể loại, chủ đề).
      2. Nhận diện 10 từ khóa/cụm từ được tìm kiếm nhiều nhất và đếm số lần xuất hiện của chúng.
      3. Phân tích hành vi tìm kiếm theo thời gian (khoảng từ mấy giờ đến mấy giờ) để xác định các khoảng thời gian cao điểm.
      4. Phân tích xu hướng theo thời gian trong ngày
      Yêu cầu:
      1. Từ khóa/cụm từ phải ngắn gọn, rõ ràng (ví dụ: "Sơn Tùng", "Bolero", "Playlist học tập").
      2. Phân tích cần phản ánh xu hướng hiện tại và những thay đổi nếu có.
      3. Chỉ trả về 20 từ khóa/cụm từ phổ biến nhất.

      🔧 FORMAT OUTPUT:
      Trả về ĐÚNG format JSON array sau (không thêm markdown, không giải thích):
      {
        "topKeywords": [ 
          { "keyword": "string", "count": number }
        ],
        "trendsOverTime": [ 
          { "timePeriod": "string", "searchCount": number }
        ]
      }
      
      Quy tắc:
      - Trả về JSON hợp lệ.
      - Sử dụng tiếng Việt trong phân tích và trả về kết quả.

      Hãy bắt đầu phân tích và trả về kết quả JSON.
    `.trim();


    let response;
    let lastError = null;

    // Cơ chế thử lại (Retry Mechanism) tương tự như hàm mẫu
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`🧠 Gọi Gemini API (Lần thử ${attempt + 1}/${MAX_RETRIES})...`);
        // Giả định genAI.models.generateContent đã được cấu hình với thư viện @google/genai
        // Dùng API Gemini với schema validation
        response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-lite", // Sử dụng model phù hợp cho phân tích
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(analysisSchema),
          },
          generationConfig: {
            temperature: 0.5, // Nhiệt độ thấp hơn cho tác vụ phân tích, cần độ chính xác cao
            maxOutputTokens: 2048,
          },
        });

        console.log("✅ API call thành công!");
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (error.status === 503) {
          console.warn(`Lần thử ${attempt + 1} thất bại (503 Overloaded).`);
          if (attempt < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * (2 ** attempt);
            console.log(`...Chờ ${delay}ms trước khi thử lại...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else {
          console.error("Lỗi API không thể thử lại:", error.message);
          break;
        }
      }
    }

    if (lastError) {
      console.error("Tất cả các lần thử lại đều thất bại.");
      return res.status(500).json({
        error: "Không thể phân tích hành vi tìm kiếm sau nhiều lần thử lại",
        details: lastError.message
      });
    }

    // --- BƯỚC 3: XỬ LÝ VÀ TRẢ VỀ KẾT QUẢ ---
    const responseText = response.candidates[0].content.parts[0].text;
    let analysisResult;
    try {
      // Validate và parse JSON
      analysisResult = analysisSchema.parse(JSON.parse(responseText));
    } catch (parseError) {
      console.error("❌ JSON parse or validation error:", parseError);
      return res.status(500).json({
        success: false,
        error: "Không thể parse hoặc validate kết quả phân tích từ AI",
        rawResponse: responseText
      });
    }

    res.status(200).json({
      message: "Phân tích hành vi tìm kiếm thành công",
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error:  ' + error.message });
  }
}
