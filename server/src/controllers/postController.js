// const { Post } = require('../models');

const { Post, User } = require('../models');

// exports.getAllPost = async (req, res) => {
//   try {
//     const posts = await Post.findAll();
//     res.json(posts);
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// };

exports.getAllPost = async(req, res) => { 
    try {  
        const posts = await Post.findAll({
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl', 'fullName']
            }],
            order: [
                ['uploadedAt', 'DESC']
            ]
        });  
        res.json(posts); 
    } catch (error) {   res.json({ error: error.message });  }
};

exports.getPostById = async(req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.getPostsByMe = async(req, res) => {
    try {
        const posts = await Post.findAll({ where: { userId: req.user.id } });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostsByUserId = async(req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const posts = await Post.findAll({ where: { userId } });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPost = async(req, res) => {
    try {
        // 1. Kiểm tra và Gán userId (Giữ nguyên)
        if (!req.user || !req.user.id) {
            // Dòng này chỉ chạy nếu conditionalAuthForPosts bị lỗi
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;

        // 2. Chuẩn bị Payload và Gán giá trị mặc định
        const { content, fileUrl } = req.body;

        // Đảm bảo các trường NOT NULL được điền đầy đủ
        const post = await Post.create({
            userId: userId,
            content: content,
            fileUrl: fileUrl || '', // Đảm bảo trường này không NULL

            // CÁC TRƯỜNG CẦN GIÁ TRỊ MẶC ĐỊNH
            heartCount: 0, // PHẢI GÁN GIÁ TRỊ MẶC ĐỊNH
            shareCount: 0, // PHẢI GÁN GIÁ TRỊ MẶC ĐỊNH
            uploadedAt: new Date(), // PHẢI GÁN GIÁ TRỊ MẶC ĐỊNH
        });

        // 3. Lấy lại Post kèm thông tin User để trả về cho Frontend
        const postWithUser = await Post.findByPk(post.id, {
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl', 'fullName']
            }]
        });

        // Trả về đối tượng Post đã tạo
        return res.status(201).json(postWithUser);

    } catch (error) {
        console.error("Lỗi khi tạo bài đăng (Controller):", error.message);
        // Trả về 400 Bad Request nếu lỗi do thiếu trường DB
        res.status(400).json({
            error: "Không thể tạo bài đăng do thiếu dữ liệu bắt buộc hoặc lỗi DB.",
            details: error.message // HIỂN THỊ LỖI SEQUELIZE ĐỂ DEBUG
        });
    }
};

exports.updatePost = async(req, res) => {
    try {
        const [updated] = await Post.update(req.body, { where: { id: req.params.id } });
        if (!updated) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const post = await Post.findByPk(req.params.id);
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a post by ID (only by the owner or admin)
exports.deletePost = async(req, res) => {
    try {
        const deleted = await Post.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};