const { Post, User } = require('../models');

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
    try {  
        const { postId } = req.params;  
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }

          
        const rows = await Comment.findAll({
            where: { postId: postId },
            include: [{
                model: User,
                as: 'User', // PHẢI KHỚP VỚI ALIAS TRONG ASSOCIATIONS CỦA BẠN
                attributes: ['id', 'username', 'avatarUrl'] // Chỉ lấy các trường cần thiết
            }],
            order: [
                ['commentedAt', 'ASC']
            ]
        });

          
        res.json(rows); 
    } catch (err) {   res.status(500).json({ error: err.message });  }
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