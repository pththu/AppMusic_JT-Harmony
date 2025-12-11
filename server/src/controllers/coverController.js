const { Post, User, Track, Like } = require("../models");
const { sequelize } = require("../models");

// Hàm này kiểm tra xem người dùng đã thích bài đăng cụ thể chưa
async function checkIsLiked(userId, postId) {
  if (!userId) {
    return false;
  }
  try {
    const like = await Like.findOne({
      where: {
        userId: userId,
        postId: postId,
      },
    });
    return !!like; // Trả về true nếu tìm thấy, false nếu không
  } catch (e) {
    console.error("Lỗi khi kiểm tra isLiked:", e.message);
    return false;
  }
}

exports.getCoversBySongId = async (req, res) => {
  try {
    const { songId } = req.params;
    const covers = await Post.findAll({
      where: { originalSongId: songId, isCover: true },
      attributes: [
        "id",
        "userId",
        "content",
        "fileUrl",
        "heartCount",
        "shareCount",
        "uploadedAt",
        "commentCount",
        "songId",
        "isCover",
        "originalSongId",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
        {
          model: Track,
          as: "OriginalSong",
          attributes: ["id", "name", "spotifyId"],
          include: [
            {
              model: require("../models/artist"),
              as: "artists",
              attributes: ["id", "name"],
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        },
      ],
      order: [["uploadedAt", "DESC"]],
    });

    // Map kết quả và xử lý dữ liệu
    const coversWithExtras = await Promise.all(
      covers.map(async (cover) => {
        const coverJson = cover.toJSON();

        // Parse fileUrl từ JSON string thành array
        let parsedFileUrls = [];
        try {
          if (coverJson.fileUrl) {
            parsedFileUrls = JSON.parse(coverJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [coverJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = coverJson.fileUrl ? [coverJson.fileUrl] : [];
        }

        return {
          ...coverJson,
          fileUrl: parsedFileUrls,
        };
      })
    );

    res.json(coversWithExtras);
  } catch (error) {
    console.error(
      "Lỗi khi tải covers theo song ID:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};

exports.getTopCovers = async (req, res) => {
  try {
    const covers = await Post.findAll({
      where: { isCover: true },
      attributes: [
        "id",
        "userId",
        "content",
        "fileUrl",
        "heartCount",
        "shareCount",
        "uploadedAt",
        "commentCount",
        "songId",
        "isCover",
        "originalSongId",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
        {
          model: Track,
          as: "OriginalSong",
          attributes: ["id", "name", "spotifyId"],
          include: [
            {
              model: require("../models/artist"),
              as: "artists",
              attributes: ["id", "name"],
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        },
      ],
      order: [["heartCount", "DESC"]],
      limit: 10,
    });

    // Map kết quả và xử lý dữ liệu
    const coversWithExtras = await Promise.all(
      covers.map(async (cover) => {
        const coverJson = cover.toJSON();

        // Parse fileUrl từ JSON string thành array
        let parsedFileUrls = [];
        try {
          if (coverJson.fileUrl) {
            parsedFileUrls = JSON.parse(coverJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [coverJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = coverJson.fileUrl ? [coverJson.fileUrl] : [];
        }

        return {
          ...coverJson,
          fileUrl: parsedFileUrls,
        };
      })
    );

    res.status(200).json({
      message: "Lấy top covers thành công",
      success: true,
      data: coversWithExtras,
    })
  } catch (error) {
    console.error("Lỗi khi tải top covers:", error.message, error.stack);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};

exports.getCoversByUserId = async (req, res) => {
  // 1. Xác định User ID của người dùng hiện tại (cho việc kiểm tra isLiked)
  let currentUserId = null;
  if (req.user && req.user.id) {
    currentUserId = req.user.id;
  } else if (req.currentUser && req.currentUser.id) {
    currentUserId = req.currentUser.id;
  }
  const numericUserId = currentUserId ? Number(currentUserId) : null;

  // 2. Lấy User ID của profile cần xem
  const { userId: profileUserId } = req.params;

  // 3. Kiểm tra tính hợp lệ của User ID
  if (!profileUserId) {
    return res.status(400).json({ error: "User ID không được cung cấp." });
  }

  try {
    // 4. Truy vấn covers
    const covers = await Post.findAll({
      where: { userId: profileUserId, isCover: true }, // Lọc theo ID của Profile và isCover: true
      attributes: [
        "id",
        "userId",
        "content",
        "fileUrl",
        "heartCount",
        "shareCount",
        "uploadedAt",
        "commentCount",
        "songId",
        "isCover",
        "originalSongId",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
        {
          model: Track,
          as: "OriginalSong",
          attributes: ["id", "name", "spotifyId"],
          include: [
            {
              model: require("../models/artist"),
              as: "artists",
              attributes: ["id", "name"],
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        },
      ],
      order: [["uploadedAt", "DESC"]],
    });

    // 5. Map kết quả và Xử lý dữ liệu
    const coversWithExtras = await Promise.all(
      covers.map(async (cover) => {
        const coverJson = cover.toJSON();

        // GỌI HÀM CHECK ISLIKED
        const isLiked = await checkIsLiked(numericUserId, coverJson.id);

        // LOGIC PARSE CHUỖI JSON fileUrl THÀNH MẢNG
        let parsedFileUrls = [];
        try {
          if (coverJson.fileUrl) {
            parsedFileUrls = JSON.parse(coverJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [coverJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = coverJson.fileUrl ? [coverJson.fileUrl] : [];
        }

        return {
          ...coverJson,
          userId: cover.userId,
          isLiked: isLiked,
          fileUrl: parsedFileUrls,
        };
      })
    );

    res.json(coversWithExtras);
  } catch (err) {
    console.error("Lỗi khi lấy covers theo User ID:", err);
    res.status(500).json({ error: "Server Error: " + err.message });
  }
};

exports.getAllCovers = async (req, res) => {
  try {
    const covers = await Post.findAll({
      where: { isCover: true },
      attributes: [
        "id",
        "userId",
        "content",
        "fileUrl",
        "heartCount",
        "shareCount",
        "uploadedAt",
        "commentCount",
        "songId",
        "isCover",
        "originalSongId",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")`
          ),
          "commentCountOptimized",
        ],
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
        {
          model: Track,
          as: "OriginalSong",
          attributes: ["id", "name", "spotifyId"],
          include: [
            {
              model: require("../models/artist"),
              as: "artists",
              attributes: ["id", "name"],
              through: { attributes: [] }, // Exclude junction table attributes
            },
          ],
        },
      ],
      order: [["uploadedAt", "DESC"]], // Mới nhất lên đầu
    });

    // Map kết quả và xử lý dữ liệu
    const coversWithExtras = await Promise.all(
      covers.map(async (cover) => {
        const coverJson = cover.toJSON();

        // Parse fileUrl từ JSON string thành array
        let parsedFileUrls = [];
        try {
          if (coverJson.fileUrl) {
            parsedFileUrls = JSON.parse(coverJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [coverJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = coverJson.fileUrl ? [coverJson.fileUrl] : [];
        }

        return {
          ...coverJson,
          fileUrl: parsedFileUrls,
          commentCount: coverJson.commentCountOptimized || coverJson.commentCount || 0,
        };
      })
    );

    res.status(200).json({
      message: "Lấy tất cả covers thành công",
      success: true,
      data: coversWithExtras,
    })
  } catch (error) {
    console.error("Lỗi khi tải tất cả covers:", error.message, error.stack);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};

exports.voteCover = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cover = await Post.findByPk(id);
    if (!cover || !cover.isCover) {
      return res.status(404).json({ message: "Cover không tồn tại" });
    }

    // Logic vote tương tự toggleLike
    const { Like } = require("../models");
    const existingLike = await Like.findOne({
      where: { userId: userId, postId: id },
    });

    if (existingLike) {
      await existingLike.destroy();
      cover.heartCount = Math.max(0, cover.heartCount - 1);
      await cover.save();
      return res.json({
        message: "Bỏ vote thành công",
        isLiked: false,
        heartCount: cover.heartCount,
      });
    } else {
      await Like.create({ userId: userId, postId: id });
      cover.heartCount += 1;
      await cover.save();
      return res.json({
        message: "Vote thành công",
        isLiked: true,
        heartCount: cover.heartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
