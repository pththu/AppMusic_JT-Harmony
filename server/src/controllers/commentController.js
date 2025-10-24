const { Post, User, Comment, CommentLike, sequelize } = require('../models');

exports.getAllComment = async(req, res) => {
    try {
        const rows = await Comment.findAll();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// HÀM MỚI: Lấy tất cả bình luận cho một Post cụ thể
exports.getCommentsByPostId = async(req, res) => {
    const userId = req.user.id; // Lấy ID của người dùng hiện tại
    try {
        const { postId } = req.params;
        // ... (kiểm tra postId)

        const rows = await Comment.findAll({
            attributes: {
                include: [
                    // 💡 TÍNH TỔNG SỐ LIKE SỬ DỤNG SEQUELIZE LITERAL VÀ SUBQUERY
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
            where: {
                postId: postId,
                parentId: null // Chỉ lấy các comment cha
            },
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
                // 💡 CHỈ DÙNG ĐỂ KIỂM TRA TRẠNG THÁI LIKE CỦA USER HIỆN TẠI
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

        // 💡 XỬ LÝ DỮ LIỆU: Thêm trường isLiked
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
        // 💡 IN LỖI CHI TIẾT RA CONSOLE SERVER
        console.error('LỖI SERVER KHI TẢI COMMENT (500):', err.message, err.stack);
        res.status(500).json({ error: 'Server error when fetching comments.', detail: err.message });
    }
};

exports.getCommentById = async(req, res) => {
    try {
        const row = await Comment.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'Comment not found' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createComment = async(req, res) => {
    try {
        const payload = {...req.body };

        console.log(req.body)

        console.log(payload)
        if (!payload) {
            return res.status(400).json({ error: 'Payload not specified' });
        }

        if (!payload.userId) {
            payload.userId = req.user.id; // Gán userId từ token đã xác thực
        }

        if (!payload.postId) {
            return res.status(400).json({ error: 'Post not identified' });
        }

        if (!payload.content && !payload.fileUrl) {
            return res.status(400).json({ error: 'Content and file not specified' });
        }

        const row = await Comment.create(payload);
        res.status(201).json(row);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

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

exports.deleteComment = async(req, res) => {
    try {
        const deleted = await Comment.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Comment not found' });
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// HÀM MỚI: Thích / Bỏ thích bình luận
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