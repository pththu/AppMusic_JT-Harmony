const {
  Post,
  User,
  Comment,
  sequelize,
  Like,
  CommentLike,
  PostReport,
  PostHide,
  Track,
  Artist,
} = require("../models");
const { Op } = require('sequelize');
const analysisService = require("../services/analysisService");

function isAdmin(req) {
  const u = (req && (req.currentUser || req.user)) || {};
  return u.roleId === 1 || u.role_id === 1;
}

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

// === ADMIN: DANH SÁCH TẤT CẢ LIKE VỚI FILTER/PAGINATION ===
const getAllLikesAdmin = async (req, res) => {
  try {
    const { postId, userId, dateFrom, dateTo } = req.query;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;

    const where = {};
    if (postId) where.postId = parseInt(postId, 10);
    if (userId) where.userId = parseInt(userId, 10);
    if (dateFrom || dateTo) {
      where.liked_at = {};
      if (dateFrom) where.liked_at[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) {
        const endExclusive = new Date(`${dateTo}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);
        where.liked_at[Op.lt] = endExclusive;
      }
    }

    const rows = await Like.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
        { model: Post, as: 'Post', attributes: ['id', 'userId', 'content', 'createdAt'] },
      ],
      order: [['liked_at', 'DESC']],
      limit,
      offset,
    });

    const data = rows.map(like => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      likedAt: like.liked_at,
      User: like.User,
      Post: like.Post,
    }));
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching likes (admin):', error);
    return res.status(500).json({ error: 'Failed to fetch likes.' });
  }
};

// --- HÀM CHIA SẺ LẠI BÀI ĐĂNG (RE-SHARE) ---
const sharePost = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated or missing ID", status: "error" });
    }

    const originalPostId = parseInt(req.params.id, 10);
    const { content } = req.body || {};

    if (isNaN(originalPostId)) {
      return res.status(400).json({ message: "ID bài đăng không hợp lệ.", status: "error" });
    }

    const originalPost = await Post.findByPk(originalPostId, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
      ],
    });
    if (!originalPost) {
      return res.status(404).json({ message: "Bài đăng gốc không tồn tại.", status: "error" });
    }

    const caption =
      content && typeof content === "string" ? content.trim() : "";

    const transaction = await sequelize.transaction();
    try {
      const newPost = await Post.create(
        {
          userId,
          content: caption,
          fileUrl: null,
          songId: originalPost.songId || null,
          isCover: originalPost.isCover || false,
          originalSongId: originalPost.originalSongId || null,
          originalPostId: originalPost.id,
        },
        { transaction }
      );

      originalPost.shareCount = (originalPost.shareCount || 0) + 1;
      await originalPost.save({ transaction });

      const newPostWithUser = await Post.findByPk(newPost.id, {
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
          "originalPostId",
        ],
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "username", "avatarUrl", "fullName"],
          },
          {
            model: Post,
            as: "OriginalPost",
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
            ],
            include: [
              {
                model: User,
                as: "User",
                attributes: ["id", "username", "avatarUrl", "fullName"],
              },
            ],
          },
        ],
        transaction,
      });

      let returnedNewPost = newPostWithUser.toJSON();
      try {
        if (returnedNewPost.fileUrl) {
          returnedNewPost.fileUrl = JSON.parse(returnedNewPost.fileUrl);
          if (!Array.isArray(returnedNewPost.fileUrl)) {
            returnedNewPost.fileUrl = [returnedNewPost.fileUrl];
          }
        } else {
          returnedNewPost.fileUrl = [];
        }
      } catch (e) {
        returnedNewPost.fileUrl = returnedNewPost.fileUrl
          ? [returnedNewPost.fileUrl]
          : [];
      }

      if (returnedNewPost.OriginalPost) {
        try {
          if (returnedNewPost.OriginalPost.fileUrl) {
            returnedNewPost.OriginalPost.fileUrl = JSON.parse(
              returnedNewPost.OriginalPost.fileUrl
            );
            if (!Array.isArray(returnedNewPost.OriginalPost.fileUrl)) {
              returnedNewPost.OriginalPost.fileUrl = [
                returnedNewPost.OriginalPost.fileUrl,
              ];
            }
          } else {
            returnedNewPost.OriginalPost.fileUrl = [];
          }
        } catch (e) {
          returnedNewPost.OriginalPost.fileUrl =
            returnedNewPost.OriginalPost.fileUrl
              ? [returnedNewPost.OriginalPost.fileUrl]
              : [];
        }
      }

      let returnedOriginalPost = originalPost.toJSON();
      try {
        if (returnedOriginalPost.fileUrl) {
          returnedOriginalPost.fileUrl = JSON.parse(returnedOriginalPost.fileUrl);
          if (!Array.isArray(returnedOriginalPost.fileUrl)) {
            returnedOriginalPost.fileUrl = [returnedOriginalPost.fileUrl];
          }
        } else {
          returnedOriginalPost.fileUrl = [];
        }
      } catch (e) {
        returnedOriginalPost.fileUrl = returnedOriginalPost.fileUrl
          ? [returnedOriginalPost.fileUrl]
          : [];
      }

      await transaction.commit();

      const actorName =
        (req.user && (req.user.fullName || req.user.username)) ||
        "Một người dùng";
      if (originalPost.userId && originalPost.userId !== userId) {
        await createNotification({
          userId: originalPost.userId,
          actorId: userId,
          postId: originalPost.id,
          type: "share",
          message: `${actorName} đã chia sẻ bài viết của bạn`,
          metadata: {
            originalPostId: originalPost.id,
            reSharePostId: newPost.id,
            caption,
          },
        });
      }

      return res.status(201).json({
        message: "Chia sẻ bài đăng thành công!",
        newPost: returnedNewPost,
        originalPost: returnedOriginalPost,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Lỗi khi chia sẻ bài đăng:", err);
      return res.status(500).json({
        message: "Lỗi server khi chia sẻ bài đăng.",
        status: "error",
      });
    }
  } catch (error) {
    console.error("Lỗi không xác định khi chia sẻ bài đăng:", error);
    return res.status(500).json({
      message: "Lỗi server khi chia sẻ bài đăng.",
      status: "error",
    });
  }
};

// --- ADMIN: DANH SÁCH BÀI ĐĂNG VỚI FILTER/PAGINATION ---
const getPostsAdmin = async (req, res) => {
  try {
    const { q, userId, isCover, dateFrom, dateTo } = req.query;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;

    const where = {};
    if (q) where.content = { [Op.iLike || Op.like]: `%${q}%` };
    if (userId) where.userId = parseInt(userId, 10);
    if (isCover === 'true') where.isCover = true;
    if (isCover === 'false') where.isCover = false;
    if (dateFrom || dateTo) {
      where.uploadedAt = {};
      if (dateFrom) where.uploadedAt[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) {
        const endExclusive = new Date(`${dateTo}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);
        where.uploadedAt[Op.lt] = endExclusive;
      }
    }

    const posts = await Post.findAll({
      where,
      attributes: [
        'id',
        'userId',
        'content',
        'fileUrl',
        'heartCount',
        'shareCount',
        'uploadedAt',
        'commentCount',
        'songId',
        'isCover',
        'originalSongId',
        'createdAt',
        'updatedAt',
        // Đếm like/comment thực từ bảng likes/comments
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM likes AS l WHERE l.post_id = "Post"."id")'
          ),
          'likeCountReal',
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")'
          ),
          'commentCountReal',
        ],
      ],
      include: [
        { model: User, as: 'User', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
      ],
      order: [['uploadedAt', 'DESC']],
      limit,
      offset,
    });

    const result = posts.map((p) => {
      const j = p.toJSON();

      // Map trường đếm thực sang field dùng cho UI
      const likeCount = Number(j.likeCountReal || 0);
      const commentCount = Number(j.commentCountReal || 0);

      // UI dùng likeCount/commentCount thực tế
      j.likeCount = likeCount;
      j.commentCount = commentCount;
      // Đồng bộ heartCount cho các UI cũ đang đọc trường này
      j.heartCount = likeCount;
      delete j.likeCountReal;
      delete j.commentCountReal;

      try {
        if (j.fileUrl) {
          j.fileUrl = JSON.parse(j.fileUrl);
          if (!Array.isArray(j.fileUrl)) j.fileUrl = [j.fileUrl];
        } else {
          j.fileUrl = [];
        }
      } catch (e) {
        j.fileUrl = j.fileUrl ? [j.fileUrl] : [];
      }
      return j;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
};

// === ADMIN: DANH SÁCH BÁO CÁO BÀI ĐĂNG ===
const getPostReportsAdmin = async (req, res) => {
  try {
    const { status, postId, reporterId, dateFrom, dateTo } = req.query;
    const where = {};
    if (status) where.status = status;
    if (postId) where.postId = parseInt(postId, 10);
    if (reporterId) where.reporterId = parseInt(reporterId, 10);
    if (dateFrom || dateTo) {
      where.reportedAt = {};
      if (dateFrom) where.reportedAt[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) {
        const endExclusive = new Date(`${dateTo}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);
        where.reportedAt[Op.lt] = endExclusive;
      }
    }

    const reports = await PostReport.findAll({
      where,
      include: [
        { model: Post, as: 'Post', include: [{ model: User, as: 'User', attributes: ['id', 'username', 'fullName', 'avatarUrl'] }] },
        { model: User, as: 'Reporter', attributes: ['id', 'username', 'fullName', 'avatarUrl'] },
      ],
      order: [['reportedAt', 'DESC']],
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching post reports (admin):', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

// === ADMIN: CẬP NHẬT TRẠNG THÁI BÁO CÁO ===
const updatePostReportAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;
    const valid = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (status && !valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [updated] = await PostReport.update({
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(status ? { reviewedAt: new Date() } : {}),
    }, { where: { id } });
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    const report = await PostReport.findByPk(id);
    res.status(200).json(report);
  } catch (error) {
    console.error('Error updating post report (admin):', error);
    res.status(500).json({ error: 'Failed to update report.' });
  }
};

// === ADMIN: XÓA LIKE CỦA USER KHỎI BÀI ĐĂNG ===
const removeLikeAdmin = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    const deleted = await Like.destroy({ where: { postId, userId } });
    if (!deleted) return res.status(404).json({ error: 'Like not found' });
    const post = await Post.findByPk(postId);
    if (post && post.heartCount > 0) {
      post.heartCount = Math.max(0, post.heartCount - 1);
      await post.save();
    }
    res.status(200).json({ message: 'Like removed by admin.' });
  } catch (error) {
    console.error('Error removing like (admin):', error);
    res.status(500).json({ error: 'Failed to remove like.' });
  }
};



// --- HÀM LẤY TẤT CẢ BÀI ĐĂNG ---
const getAllPost = async (req, res) => {
  //  Kiểm tra xác thực
  const userId = req.user && req.user.id;
  if (!userId) {
    return res
      .status(401)
      .json({ error: "User not authenticated or missing ID" });
  }
  console.log("Danh sách bài đăng của userId: ", userId);

  let ids = [];

  try {
    // 1. Dùng Common Table Expression (CTE) để lọc bài đăng mới nhất, loại trừ bài đăng đã ẩn
    const latestPostsQuery = `
            WITH RankedPosts AS (
                SELECT
                    p.id,
                    p.user_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY p.user_id
                        ORDER BY p."uploaded_at" DESC
                    ) as rn
                FROM
                    posts p
                LEFT JOIN post_hides ph ON p.id = ph.post_id AND ph.user_id = ?
                WHERE ph.id IS NULL
                AND p."is_cover" = false
            )
            SELECT
                id
            FROM
                RankedPosts
            WHERE
                rn = 1
        `;

    // 2. Thực thi CTE để lấy ra ID của các bài đăng mới nhất, loại trừ bài đăng đã ẩn
    const latestPostIds = await sequelize.query(latestPostsQuery, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT,
    });

    // Gán giá trị an toàn cho ids
    ids = latestPostIds.map((row) => row.id);

    // 3. Truy vấn chính (Sử dụng ids đã được xác định)
    const posts = await Post.findAll({
      where: {
        // Nếu CTE trả về 0 kết quả, ids là [], Post.findAll sẽ trả về []
        id: ids.length > 0 ? ids : [0], // Thêm [0] nếu ids rỗng để tránh lỗi WHERE IN ()
      },
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
        "flag",
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
          model: Post,
          as: "OriginalPost",
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
            "flag",
          ],
          include: [
            {
              model: User,
              as: "User",
              attributes: ["id", "username", "avatarUrl", "fullName"],
            },
          ],
          required: false,
        }
        ,
        {
          model: Track,
          as: "OriginalSong",
          attributes: ["id", "name", "spotifyId"],
          include: [
            {
              model: Artist,
              as: "artists",
              attributes: ["id", "name"],
            },
          ],
          required: false,
        },
      ],
      order: [["uploadedAt", "DESC"]],
    });

    // 4. Map kết quả VÀ GỌI HÀM CHECK ASYNC
    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        const commentCountFromDb =
          parseInt(postJson.commentCountOptimized) || 0;

        //  GỌI HÀM CHECK ISLIKED
        const isLiked = await checkIsLiked(userId, postJson.id);

        // LOGIC PARSE CHUỖI JSON fileUrl THÀNH MẢNG
        let parsedFileUrls = [];
        try {
          if (postJson.fileUrl) {
            parsedFileUrls = JSON.parse(postJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [postJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = postJson.fileUrl ? [postJson.fileUrl] : [];
        }

        // Parse OriginalPost.fileUrl nếu có
        let originalPostParsed = undefined;
        if (postJson.OriginalPost) {
          originalPostParsed = { ...postJson.OriginalPost };
          try {
            if (originalPostParsed.fileUrl) {
              originalPostParsed.fileUrl = JSON.parse(originalPostParsed.fileUrl);
              if (!Array.isArray(originalPostParsed.fileUrl)) {
                originalPostParsed.fileUrl = [originalPostParsed.fileUrl];
              }
            } else {
              originalPostParsed.fileUrl = [];
            }
          } catch (e) {
            originalPostParsed.fileUrl = originalPostParsed.fileUrl
              ? [originalPostParsed.fileUrl]
              : [];
          }
        }

        // console.log(postJson.OriginalSong)

        return {
          ...postJson, // Giữ nguyên các trường khác (bao gồm OriginalSong nếu có)
          userId: post.userId, // Đảm bảo userId đúng kiểu
          commentCount: commentCountFromDb, // Cập nhật commentCount từ trường tối ưu
          commentCountOptimized: undefined, // Xóa trường tạm
          isLiked: isLiked, // Thêm trường isLiked
          fileUrl: parsedFileUrls, // Thay thế fileUrl bằng mảng đã parse
          OriginalPost: originalPostParsed,
        };
      })
    );

    res.status(200).json({
      message: "Lấy danh sách bài đăng thành công!",
      success: true,
      data: postsWithExtras,
    })
  } catch (error) {
    console.error("Lỗi khi tải bài đăng:", error.message, error.stack);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};

const getAllPostForGuest = async (req, res) => {
  console.log('Lấy danh sách bài đăng cho Guest (Khách)');

  try {
    const posts = await Post.findAll({
      where: {
        isCover: false,
      },
      attributes: {
        include: [
          [
            sequelize.literal('false'),
            'isLiked',
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")`
            ),
            'commentCount', // Ghi đè trực tiếp lên 'commentCount'
          ],
        ],
        exclude: ['commentCount'],
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'avatarUrl', 'fullName'],
        },
      ],
      order: [['uploadedAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Lấy danh sách bài đăng (guest) thành công!',
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Lỗi khi tải bài đăng (guest):', error.message, error.stack);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};


const createPost = async (req, res) => {
  try {
    let userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated or missing ID" });
    }

    const user = await User.findByPk(userId);

    if (user.roleId === 1) userId = req.body.userId;
    console.log("Tạo bài đăng: User ID từ token:", userId);

    const { content, fileUrls, isCover, trackSpotifyId } = req.body;
    let { songId, originalSongId } = req.body;

    console.log("Creating post with:", {
      content,
      fileUrls,
      songId,
      isCover,
      originalSongId,
    });

    const hasContent = content && typeof content === "string" && content.trim().length > 0;
    const hasFile = Array.isArray(fileUrls) && fileUrls.length > 0;

    if (!hasContent && !hasFile) {
      return res.status(400).json({ message: "Bài đăng phải có ít nhất Văn bản hoặc Ảnh/Video đính kèm." });
    }

    // Chuyển đổi và kiểm tra ID (nếu client gửi songId/originalSongId là số)
    if (songId) songId = parseInt(songId, 10);
    if (originalSongId) originalSongId = parseInt(originalSongId, 10);

    if (isCover) {
      if (!originalSongId || isNaN(originalSongId)) {
        return res.status(400).json({ message: "ID bài hát gốc không hợp lệ." });
      }

      console.log(`Checking for track with tempId: ${originalSongId}`);
      const track = await Track.findByPk(originalSongId); // Tìm track theo tempId (đây là ID thực từ database được gửi làm tempId)

      if (!track) {
        const trackByRealId = await Track.findByPk(originalSongId); // Nếu không tìm thấy theo tempId, thử tìm theo id (trường hợp client gửi id thật)
        if (!trackByRealId) {
          return res.status(400).json({ message: "Không thể tạo cover cho bài hát có ID ${originalSongId} vì không tìm thấy trong database." });
        }
      }
      songId = null; // Đảm bảo songId là null cho cover
    } else {
      // Không phải cover: cố gắng resolve bài hát theo songId hoặc trackSpotifyId
      let track = null;
      if (trackSpotifyId) {
        track = await Track.findOne({ where: { spotifyId: trackSpotifyId } }); // Ưu tiên tìm theo spotifyId nếu được cung cấp
      } else if (songId) {
        track = await Track.findByPk(songId);
      }

      if (track) {
        songId = track.id;
        if (!originalSongId) {
          originalSongId = track.id;
        }
      }
    }

    // ========== Gắn cờ ==============
    let collectedFlags = new Set();

    try {
      console.log("🤖 Đang phân tích cảnh báo nội dung...");
      // 1. Phân tích Text
      if (hasContent) {
        const textResult = await analysisService.analyzeText(content);
        if (textResult.hasWarning) {
          textResult.flags.forEach(f => collectedFlags.add(f));
        }
      }

    } catch (e) {
      console.error("AI Error:", e);

    }
    // ================= END AI =================

    // Chuyển Set thành mảng để lưu DB
    const warningTags = Array.from(collectedFlags); // VD: ['toxic', 'adult']
    console.log("⚠️ Các cảnh báo được gắn:", warningTags);

    //  Tạo bài đăng
    let post;
    let flag = warningTags.length > 0 ? warningTags[0] : 'safe'; // Lấy cảnh báo đầu tiên làm flag chính

    try {
      post = await Post.create({
        userId,
        content,
        fileUrl:
          fileUrls && fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
        songId: songId || null,
        isCover: isCover || false,
        originalSongId: originalSongId || null,
        flag: flag,
      });


    } catch (dbError) {
      console.error("Database error during Post.create:", dbError);
      console.error("Database error stack:", dbError.stack);
      console.error("Original error:", dbError.original);
      return res.status(500).json({
        message: "Lỗi khi lưu vào cơ sở dữ liệu.",
        details: dbError.message,
        original_error: dbError.original ? dbError.original.message : null,
      });
    }

    //  Lấy lại bài đăng kèm user (để client render ngay)
    const postWithUser = await Post.findByPk(post.id, {
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
        "flag"
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
      ],
    });

    //  Trả về kết quả (Phải parse JSON trước khi trả về client)
    let returnedPost = postWithUser.toJSON();
    try {
      if (returnedPost.fileUrl) {
        returnedPost.fileUrl = JSON.parse(returnedPost.fileUrl); // Tự parse JSON trước khi trả về client

        if (!Array.isArray(returnedPost.fileUrl)) { // Fallback nếu không phải mảng
          returnedPost.fileUrl = [returnedPost.fileUrl];
        }
      } else {
        returnedPost.fileUrl = [];
      }
    } catch (e) {
      returnedPost.fileUrl = [returnedPost.fileUrl];
    }

    return res.status(201).json({
      message: "Tạo bài đăng thành công!",
      data: returnedPost,
      success: true,
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài đăng:", error.message || error.toString());
    console.error("Full error:", error.stack);
    return res.status(500).json({
      message: "Tạo bài đăng thất bại: " + error.message,
      details: error.message || error.toString(),
    });
  }
};

// --- HÀM LẤY BÀI ĐĂNG THEO ID ---
const getPostById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await Post.findByPk(id, {
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
        "createdAt",
        "updatedAt",
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM likes AS l WHERE l.post_id = "Post"."id")'
          ),
          "likeCountReal",
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")'
          ),
          "commentCountReal",
        ],
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "fullName", "avatarUrl"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    let postJson = post.toJSON();

    const likeCount = Number(postJson.likeCountReal || 0);
    const commentCount = Number(postJson.commentCountReal || 0);
    postJson.likeCount = likeCount;
    postJson.commentCount = commentCount;
    postJson.heartCount = likeCount;
    delete postJson.likeCountReal;
    delete postJson.commentCountReal;

    try {
      if (postJson.fileUrl) {
        postJson.fileUrl = JSON.parse(postJson.fileUrl);
        if (!Array.isArray(postJson.fileUrl)) {
          postJson.fileUrl = [postJson.fileUrl];
        }
      } else {
        postJson.fileUrl = [];
      }
    } catch (e) {
      postJson.fileUrl = postJson.fileUrl ? [postJson.fileUrl] : [];
    }

    return res.json(postJson);
  } catch (error) {
    console.error("Error getPostById:", error);
    return res.status(500).json({ error: error.message });
  }
};

// --- HÀM LẤY BÀI ĐĂNG CỦA CHÍNH MÌNH ---
const getPostsByMe = async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { userId: req.user.id } });
    //  Lặp qua và parse JSON cho fileUrl
    const parsedPosts = posts.map((post) => {
      let postJson = post.toJSON();
      try {
        if (postJson.fileUrl) {
          postJson.fileUrl = JSON.parse(postJson.fileUrl);
          if (!Array.isArray(postJson.fileUrl)) {
            postJson.fileUrl = [postJson.fileUrl];
          }
        } else {
          postJson.fileUrl = [];
        }
      } catch (e) {
        postJson.fileUrl = [postJson.fileUrl];
      }
      return postJson;
    });
    // ------------------------------------
    res.json(parsedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- HÀM LẤY BÀI ĐĂNG THEO USER ID ---
const getPostsByUserId = async (req, res) => {
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
    // 4. Truy vấn bài đăng
    const posts = await Post.findAll({
      where: { userId: profileUserId, isCover: false }, //  Lọc theo ID của Profile và loại trừ cover posts
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
            // SỬ DỤNG LITERAL để đếm số comment trực tiếp từ DB
            `(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")`
          ),
          "commentCountOptimized", // Alias để sử dụng trong bước Map
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
              model: Artist,
              as: "artists",
              attributes: ["id", "name"],
            },
          ],
          required: false, // Left join to include even if no original song
        },
      ],
      order: [["uploadedAt", "DESC"]],
    });

    // 5. Map kết quả và XỬ LÝ DỮ LIỆU
    const postsWithExtras = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON();
        const commentCountFromDb =
          parseInt(postJson.commentCountOptimized) || 0;

        //  GỌI HÀM CHECK ISLIKED
        const isLiked = await checkIsLiked(numericUserId, postJson.id);

        // LOGIC PARSE CHUỖI JSON fileUrl THÀNH MẢNG
        let parsedFileUrls = [];
        try {
          if (postJson.fileUrl) {
            parsedFileUrls = JSON.parse(postJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
              parsedFileUrls = [postJson.fileUrl];
            }
          }
        } catch (e) {
          parsedFileUrls = postJson.fileUrl ? [postJson.fileUrl] : [];
        }

        return {
          ...postJson,
          userId: post.userId,
          commentCount: commentCountFromDb,
          commentCountOptimized: undefined,
          isLiked: isLiked,
          fileUrl: parsedFileUrls,
          isCover: postJson.isCover,
          originalSongId: postJson.originalSongId,
          OriginalSong: postJson.OriginalSong,
        };
      })
    );

    res.json(postsWithExtras);
  } catch (err) {
    console.error("Lỗi khi lấy bài đăng theo User ID:", err);
    res.status(500).json({ error: "Server Error: " + err.message });
  }
};

// --- HÀM CẬP NHẬT BÀI ĐĂNG ---
const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const admin = isAdmin(req);
    const currentUserId = req.user && req.user.id;
    if (!admin && (!currentUserId || post.userId !== currentUserId)) {
      return res.status(403).json({ error: "Forbidden: Not allowed to update this post" });
    }

    const body = req.body;
    if (body.fileUrls) {
      body.fileUrl = JSON.stringify(body.fileUrls);
      delete body.fileUrls;
    }

    await Post.update(body, { where: { id: postId } });
    const updatedPost = await Post.findByPk(postId);

    let postJson = updatedPost.toJSON();
    try {
      if (postJson.fileUrl) {
        postJson.fileUrl = JSON.parse(postJson.fileUrl);
        if (!Array.isArray(postJson.fileUrl)) {
          postJson.fileUrl = [postJson.fileUrl];
        }
      } else {
        postJson.fileUrl = [];
      }
    } catch (e) {
      postJson.fileUrl = [postJson.fileUrl];
    }

    res.json(postJson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --- HÀM XÓA BÀI ĐĂNG ---
const deletePost = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    const postId = req.params.id;
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    let admin = false;
    if (user.roleId === 1) {
      admin = true;
    }

    console.log('is admin: ', admin)
    const currentUserId = req.user.id;
    if (!admin && (post.userId !== currentUserId)) {
      console.log(3)
      return res.status(403).json({ error: "Forbidden: Not allowed to delete this post" });
    }
    const row = await Post.destroy({ where: { id: postId } });
    if (!row) {
      console.log(1)
      return res.status(500).json({ error: "Failed to delete post" });
    }
    console.log(2)
    res.status(200).json({ message: "Post deleted successfully", success: true });
  } catch (error) {
    console.log(12345)
    res.status(500).json({ error: error.message });
  }
};

// --- HÀM THÍCH / BỎ THÍCH BÀI ĐĂNG ---
const toggleLike = async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id, 10);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "ID bài đăng không hợp lệ." });
  }

  try {
    // 1. KIỂM TRA: Người dùng đã thích bài đăng này chưa?
    const existingLike = await Like.findOne({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    let post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }

    if (existingLike) {
      // 2. BỎ THÍCH: Xóa bản ghi Like
      await existingLike.destroy();

      // Cập nhật heartCount
      post.heartCount = Math.max(0, post.heartCount - 1);
      await post.save();

      return res.status(200).json({
        message: "Bỏ thích thành công.",
        isLiked: false,
        heartCount: post.heartCount,
      });
    } else {
      // 3. THÍCH: Tạo bản ghi Like mới
      await Like.create({
        userId: userId,
        postId: postId,
      });

      // Cập nhật heartCount
      post.heartCount += 1;
      await post.save();

      const actorName =
        (req.user && (req.user.fullName || req.user.username)) ||
        "Một người dùng";
      if (post.userId && post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          actorId: userId,
          postId: post.id,
          type: "like",
          message: `${actorName} đã thích bài viết của bạn`,
          metadata: {
            postId: post.id,
            heartCount: post.heartCount,
          },
        });
      }

      return res.status(201).json({
        message: "Thích thành công.",
        isLiked: true,
        heartCount: post.heartCount,
      });
    }
  } catch (error) {
    console.error("Lỗi khi toggle like:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi xử lý thao tác thích/bỏ thích." });
  }
};

// --- HÀM LẤY DANH SÁCH NGƯỜI ĐÃ THÍCH BÀI ĐĂNG (HỖ TRỢ FILTER/PAGINATION) ---
const getLikesByPostId = async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const { userId, dateFrom, dateTo } = req.query;
  const limit = parseInt(req.query.limit, 10) || undefined;
  const offset = parseInt(req.query.offset, 10) || undefined;

  try {
    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }

    const where = { postId };
    if (userId) where.userId = parseInt(userId, 10);
    if (dateFrom || dateTo) {
      where.liked_at = {};
      if (dateFrom) where.liked_at[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) {
        const endExclusive = new Date(`${dateTo}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);
        where.liked_at[Op.lt] = endExclusive;
      }
    }

    // Lấy danh sách likes với thông tin user
    const likes = await Like.findAll({
      where,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "avatarUrl", "fullName"],
        },
      ],
      order: [["liked_at", "DESC"]],
      ...(limit ? { limit } : {}),
      ...(offset ? { offset } : {}),
    });

    // Map dữ liệu để trả về
    const likesData = likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      likedAt: like.liked_at,
      User: like.User,
    }));

    res.json(likesData);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách likes:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy danh sách người đã thích." });
  }
};

// --- HÀM BÁO CÁO BÀI ĐĂNG ---
const reportPost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const { reason } = req.body;

  try {
    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài đăng không tồn tại." });
    }

    // Kiểm tra lý do báo cáo hợp lệ
    const validReasons = [
      "adult_content",
      "self_harm",
      "misinformation",
      "c",
    ];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: "Lý do báo cáo không hợp lệ." });
    }

    // Kiểm tra người dùng đã báo cáo bài đăng này chưa
    const existingReport = await PostReport.findOne({
      where: {
        reporterId: userId,
        postId: postId,
      },
    });

    if (existingReport) {
      return res
        .status(409)
        .json({ message: "Bạn đã báo cáo bài đăng này rồi." });
    }

    // Tạo báo cáo mới
    const report = await PostReport.create({
      postId: postId,
      reporterId: userId,
      reason: reason,
    });

    res.status(201).json({
      message:
        "Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét bài viết này.",
      report: report,
    });
  } catch (error) {
    console.error("Lỗi khi báo cáo bài đăng:", error);
    res.status(500).json({ error: "Lỗi server khi gửi báo cáo." });
  }
};

// --- HÀM ẨN BÀI ĐĂNG ---
const hidePost = async (req, res) => {
  const currentUserId = req.user.id;
  const postId = parseInt(req.params.id, 10); // Chuyển postId sang kiểu số nguyên

  // Kiểm tra tính hợp lệ của postId
  if (isNaN(postId)) {
    return res.status(400).json({ error: "Invalid post ID." });
  }

  try {
    // 1. Tìm bài đăng
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 2. Kiểm tra người dùng đã ẩn bài đăng này chưa
    const existingHide = await PostHide.findOne({
      where: {
        postId: postId,
        userId: currentUserId,
      },
    });

    if (existingHide) {
      return res.status(409).json({ message: "Bạn đã ẩn bài đăng này rồi." });
    }

    // 3. Tạo bản ghi ẩn bài đăng
    await PostHide.create({
      postId: postId,
      userId: currentUserId,
    });

    res.status(200).json({ message: "Bài đăng đã được ẩn thành công." });
  } catch (error) {
    console.error("Error hiding post:", error);
    res.status(500).json({ error: "Failed to hide post." });
  }
};

const GetAllPost = async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.status(200).json({
      message: "Lấy tất cả bài đăng thành công!",
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllPost,
  getPostById,
  createPost,
  getPostsByMe,
  getPostsByUserId,
  updatePost,
  deletePost,
  toggleLike,
  getLikesByPostId,
  reportPost,
  hidePost,
  getAllPostForGuest,
  GetAllPost,
  // Admin functions
  getPostReportsAdmin,
  updatePostReportAdmin,
  removeLikeAdmin,
  getAllLikesAdmin,
  sharePost,
  getPostsAdmin
};