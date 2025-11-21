const { Post, User, Comment, CommentLike, sequelize } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationHelper');

exports.getAllComment = async(req, res) => {
    try {
        const rows = await Comment.findAll();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LẤY COMMENT THEO trackId (THREAD THEO BÀI HÁT) KÈM likeCount VÀ isLiked
exports.getCommentsByTrackId = async (req, res) => {
  const userId = req.user.id;
  try {
    const { trackId } = req.params;
    const { fromMs, toMs } = req.query;

    const whereParent = {
      trackId: trackId,
      parentId: null,
    };
    if (fromMs || toMs) {
      whereParent.timecodeMs = {};
      if (fromMs) whereParent.timecodeMs[Op.gte] = parseInt(fromMs, 10);
      if (toMs) whereParent.timecodeMs[Op.lte] = parseInt(toMs, 10);
    }

    const rows = await Comment.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comment_likes AS "CommentLikes"
              WHERE "CommentLikes"."comment_id" = "Comment"."id"
            )`),
            'likeCount'
          ]
        ]
      },
      where: whereParent,
      include: [
        { model: User, as: 'User', attributes: ['id','username','avatarUrl','fullName'] },
        { model: Comment, as: 'Replies', include: [ { model: User, as: 'User', attributes: ['id','username','avatarUrl','fullName'] } ] },
        { model: CommentLike, as: 'Likes', where: { userId }, required: false, attributes: ['userId'] },
      ],
      order: [ ['commentedAt','ASC'], [sequelize.literal('"likeCount"'), 'DESC'] ],
    });

    const processedRows = rows.map(c => {
      const json = c.toJSON();
      json.isLiked = json.Likes && json.Likes.length > 0;
      delete json.Likes;
      return json;
    });

    res.json(processedRows);
  } catch (err) {
    console.error('SERVER ERROR fetching comments by track:', err.message);
    res.status(500).json({ error: 'Server error when fetching comments by track.', detail: err.message });
  }
}

// --- ADMIN: DANH SÁCH BÌNH LUẬN VỚI FILTER/PAGINATION ---
exports.getCommentsAdmin = async (req, res) => {
  try {
    const {
      postId,
      userId,
      q,
      dateFrom,
      dateTo,
      limit: limitStr,
      offset: offsetStr,
    } = req.query;

    const limit = parseInt(limitStr, 10) || 50;
    const offset = parseInt(offsetStr, 10) || 0;

    const where = {};
    if (postId) where.postId = parseInt(postId, 10);
    if (userId) where.userId = parseInt(userId, 10);
    if (q) where.content = { [Op.iLike || Op.like]: `%${q}%` };
    if (dateFrom || dateTo) {
      where.commentedAt = {};
      if (dateFrom) where.commentedAt[Op.gte] = new Date(`${dateFrom}T00:00:00`);
      if (dateTo) {
        const endExclusive = new Date(`${dateTo}T00:00:00`);
        endExclusive.setDate(endExclusive.getDate() + 1);
        where.commentedAt[Op.lt] = endExclusive;
      }
    }

    const rows = await Comment.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id','username','avatarUrl','fullName'] },
        { model: Post, as: 'Post', attributes: ['id','userId','content','createdAt'] },
      ],
      order: [['commentedAt', 'DESC']],
      limit,
      offset,
    });
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching admin comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
};

// LẤY COMMENT THEO postId KÈM THEO SỐ LƯỢNG LIKE VÀ TRẠNG THÁI ISLIKED CỦA USER HIỆN TẠI
exports.getCommentsByPostId = async(req, res) => {
    const userId = req.user.id; // Lấy ID của người dùng hiện tại
    try {
        const { postId } = req.params;
        const { fromMs, toMs } = req.query;

        const whereParent = {
            postId: postId,
            parentId: null
        };
        // Bộ lọc theo mốc thời gian nếu có
        if (fromMs || toMs) {
            whereParent.timecodeMs = {};
            if (fromMs) whereParent.timecodeMs[Op.gte] = parseInt(fromMs, 10);
            if (toMs) whereParent.timecodeMs[Op.lte] = parseInt(toMs, 10);
        }

        const rows = await Comment.findAll({
            attributes: {
                include: [
                    //  TÍNH TỔNG SỐ LIKE SỬ DỤNG SEQUELIZE LITERAL VÀ SUBQUERY
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comment_likes AS "CommentLikes"
                            WHERE
                                "CommentLikes"."comment_id" = "Comment"."id"
                        )`),
                        'likeCount' // Alias cho kết quả đếm
                    ]
                ]
            },
            where: whereParent,
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl']
            }, {
                model: Comment,
                as: 'Replies',
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['id', 'username', 'avatarUrl']
                }]
            }, {
                //  CHỈ DÙNG ĐỂ KIỂM TRA TRẠNG THÁI LIKE CỦA USER HIỆN TẠI
                model: CommentLike,
                as: 'Likes',
                where: { userId: userId },
                required: false,
                attributes: ['userId'] // Chỉ cần trường này để kiểm tra tồn tại
            }],
            order: [
                ['commentedAt', 'ASC'],
                [sequelize.literal('"likeCount"'), 'DESC'] // Sắp xếp theo like (Tùy chọn)
            ]
        });

        //  XỬ LÝ DỮ LIỆU: Thêm trường isLiked
        const processedRows = rows.map(comment => {
            const commentJson = comment.toJSON();

            // Gán isLiked dựa trên việc có tồn tại record trong 'Likes' không
            commentJson.isLiked = commentJson.Likes && commentJson.Likes.length > 0;
            // likeCount đã được tính bằng literal
            delete commentJson.Likes;

            // Xử lý Replies (Bình luận con) - Lỗi 500 có thể nằm ở đây nếu Replies không có User
            commentJson.Replies = commentJson.Replies.map(reply => {
                // ... (Nếu cần, bạn có thể thêm logic tính like cho replies ở đây)
                return reply;
            });

            return commentJson;
        });

        res.json(processedRows);
    } catch (err) {
        //  IN LỖI CHI TIẾT RA CONSOLE SERVER
        console.error('LỖI SERVER KHI TẢI COMMENT (500):', err.message, err.stack);
        res.status(500).json({ error: 'Server error when fetching comments.', detail: err.message });
    }
};

// LẤY COMMENT THEO ID
exports.getCommentById = async(req, res) => {
    try {
        const row = await Comment.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'Comment not found' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// TẠO MỚI COMMENT
exports.createComment = async(req, res) => {
    try {
        const payload = {...req.body };

        if (!payload) {
            return res.status(400).json({ error: 'Payload not specified' });
        }

        if (!payload.userId) {
            payload.userId = req.user.id; // Gán userId từ token đã xác thực
        }

        // Chấp nhận postId HOẶC trackId cho thread theo bài hát
        if (!payload.postId && !payload.trackId) {
            return res.status(400).json({ error: 'Post or Track not identified' });
        }

        if (!payload.content && !payload.fileUrl) {
            return res.status(400).json({ error: 'Content and file not specified' });
        }

        let targetPost = null;
        if (payload.postId) {
            targetPost = await Post.findByPk(payload.postId);
            if (!targetPost) {
                return res.status(404).json({ error: 'Post not found' });
            }
        }

        const row = await Comment.create(payload);

        if (targetPost && targetPost.userId && targetPost.userId !== payload.userId) {
            const actorName =
                (req.user && (req.user.fullName || req.user.username)) ||
                'Một người dùng';
            await createNotification({
                userId: targetPost.userId,
                actorId: payload.userId,
                postId: targetPost.id,
                type: 'comment',
                message: `${actorName} đã bình luận về bài viết của bạn`,
                metadata: {
                    postId: targetPost.id,
                    commentId: row.id,
                    contentSnippet: payload.content ? payload.content.slice(0, 120) : '',
                },
            });
        }

        res.status(201).json(row);

    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: err.message });
    }
};

// CẬP NHẬT COMMENT
exports.updateComment = async(req, res) => {
    try {
        const [updated] = await Comment.update(req.body, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({ error: 'Comment not found' });
        const row = await Comment.findByPk(req.params.id);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// XÓA COMMENT
exports.deleteComment = async(req, res) => {
    try {
        const deleted = await Comment.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// THÍCH / BỎ THÍCH COMMENT
exports.toggleCommentLike = async(req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;

    if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' });
    }

    try {
        const existingLike = await CommentLike.findOne({
            where: {
                userId: userId,
                commentId: commentId
            }
        });

        let isLiked;

        if (existingLike) {
            await existingLike.destroy();
            isLiked = false;
        } else {
            await CommentLike.create({
                userId: userId,
                commentId: commentId
            });
            isLiked = true;
        }

        // Đếm số lượng like mới nhất
        const likeCount = await CommentLike.count({
            where: {
                commentId: commentId
            }
        });

        res.json({
            isLiked: isLiked,
            likeCount: likeCount
        });

    } catch (err) {
        console.error('Lỗi khi thích/bỏ thích bình luận:', err);
        res.status(500).json({
            error: err.message
        });
    }
};