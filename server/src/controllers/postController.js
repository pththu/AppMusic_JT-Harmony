const { Post, User, Comment, sequelize, Like, CommentLike } = require('../models');

// --- HÀM LẤY TẤT CẢ BÀI ĐĂNG ---
// --- HÀM KIỂM TRA ISLIKED MỚI ---
async function checkIsLiked(userId, postId) {
    if (!userId) {
        return false;
    }
    try {
        const like = await Like.findOne({
            where: {
                userId: userId,
                postId: postId
            }
        });
        return !!like; // Trả về true nếu tìm thấy, false nếu không
    } catch (e) {
        console.error("Lỗi khi kiểm tra isLiked:", e.message);
        return false;
    }
}

// KIỂM TRA ISLIKED CHO COMMENT
async function checkCommentIsLiked(userId, commentId) {
    if (!userId) return false;
    try {
        const like = await CommentLike.findOne({
            where: { userId: userId, commentId: commentId }
        });
        return !!like;
    } catch (e) {
        console.error("Lỗi khi kiểm tra isLiked cho Comment:", e.message);
        return false;
    }
}

// ĐẾM LIKE CHO COMMENT
async function getCommentLikeCount(commentId) {
    try {
        return await CommentLike.count({
            where: { commentId: commentId }
        });
    } catch (e) {
        console.error("Lỗi khi đếm Like Comment:", e.message);
        return 0;
    }
}

// --- HÀM LẤY TẤT CẢ BÀI ĐĂNG ĐÃ SỬA CHỮA (AN TOÀN VỀ BIẾN SỐ) ---
exports.getAllPost = async(req, res) => {
    let rawUserId = null;

    // 1. Kiểm tra req.user.id (sau khi đã ép kiểu trong optionalAuthenticateToken)
    if (req.user && req.user.id) {
        rawUserId = req.user.id;
    }

    // 2. Nếu không có ở req.user.id, kiểm tra req.currentUser.id (Sequelize Model ID)
    if (!rawUserId && req.currentUser && req.currentUser.id) {
        rawUserId = req.currentUser.id;
    }

    // 3. Nếu vẫn không có, kiểm tra trực tiếp req.user (Trường hợp req.user là decoded JWT payload của authenticateToken cũ)
    if (!rawUserId && req.user && !req.user.id && (typeof req.user.id !== 'undefined' || typeof req.user.sub !== 'undefined')) {
        // Trường hợp req.user là payload JWT, ID có thể nằm trực tiếp ở cấp trên hoặc ở thuộc tính 'id' mà không phải là number JavaScript thuần túy
        // Chúng ta đã bao quát hầu hết ở bước 1 và 2. Giờ đây, chỉ cần tập trung vào việc ép kiểu.
        // Tuy nhiên, logic hiện tại của bạn là tối ưu nhất.
    }


    // Đảm bảo ép kiểu an toàn
    const numericUserId = rawUserId ? Number(rawUserId) : null;

    console.log(`getAllPost: User ID nhận được (numericUserId): ${numericUserId}`);

    let ids = [];

    try {
        // 1. Dùng Common Table Expression (CTE) để lọc bài đăng mới nhất
        const latestPostsQuery = `
            WITH RankedPosts AS (
                SELECT 
                    id, 
                    user_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_id 
                        ORDER BY "uploaded_at" DESC
                    ) as rn
                FROM 
                    posts
            )
            SELECT 
                id
            FROM 
                RankedPosts
            WHERE 
                rn = 1
        `;

        // 2. Thực thi CTE để lấy ra ID của các bài đăng mới nhất
        const latestPostIds = await sequelize.query(latestPostsQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        // Gán giá trị an toàn cho ids
        ids = latestPostIds.map(row => row.id);


        // 3. Truy vấn chính (Sử dụng ids đã được xác định)
        const posts = await Post.findAll({
            where: {
                // Nếu CTE trả về 0 kết quả, ids là [], Post.findAll sẽ trả về [] (Đúng logic)
                id: ids.length > 0 ? ids : [0] // Thêm [0] nếu ids rỗng để tránh lỗi WHERE IN ()
            },
            attributes: [
                'id', 'userId', 'content', 'fileUrl',
                'heartCount', 'shareCount', 'uploadedAt',
                'commentCount', 'songId', [
                    sequelize.literal(
                        `(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")`
                    ),
                    'commentCountOptimized'
                ],
            ],
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl', 'fullName']
            }],
            order: [
                ['uploadedAt', 'DESC']
            ]
        });

        // 4. Map kết quả VÀ GỌI HÀM CHECK ASYNC
        const postsWithExtras = await Promise.all(posts.map(async post => {
            const postJson = post.toJSON();
            const commentCountFromDb = parseInt(postJson.commentCountOptimized) || 0;

            // 🎯 GỌI HÀM CHECK ISLIKED BẰNG SEQUELIZE CHUẨN
            const isLiked = await checkIsLiked(numericUserId, postJson.id);

            // LOGIC PARSE CHUỖI JSON fileUrl THÀNH MẢNG (Giữ nguyên)
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
            };
        }));

        res.json(postsWithExtras);

    } catch (error) {
        // Nếu lỗi xảy ra ở đây, chúng ta đảm bảo thông báo lỗi rõ ràng hơn
        console.error("Lỗi khi tải bài đăng:", error.message, error.stack);
        res.status(500).json({ error: 'Server Error: ' + error.message });
    }
};

// --- HÀM TẠO BÀI ĐĂNG (Tối ưu hóa: Lấy userId chỉ từ token) ---
exports.createPost = async(req, res) => {
    try {
        // 1️⃣ Kiểm tra xác thực
        const userId = req.user && req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated or missing ID' });
        }
        console.log("Tạo bài đăng: User ID từ token:", userId);

        // 🆕 Lấy fileUrls (MẢNG) từ body thay vì fileUrl (chuỗi)
        const { content, fileUrls, songId } = req.body;

        const hasContent = content && typeof content === 'string' && content.trim().length > 0;
        const hasFile = Array.isArray(fileUrls) && fileUrls.length > 0;

        // Nếu cả nội dung (sau khi loại bỏ khoảng trắng) và fileUrl đều trống, trả về lỗi 400
        if (!hasContent && !hasFile) {
            return res.status(400).json({
                message: "Nội dung bài đăng không hợp lệ.",
                error: "Bài đăng phải có ít nhất Văn bản hoặc Ảnh/Video đính kèm."
            });
        }

        // 2️⃣ Tạo bài đăng
        const post = await Post.create({
            userId, // Dùng userId từ token
            content,
            // 🆕 LƯU TRỮ MẢNG URL DƯỚI DẠNG CHUỖI JSON
            fileUrl: fileUrls && fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
            songId: songId || null,
        });

        // 3️⃣ Lấy lại bài đăng kèm user (để client render ngay)
        const postWithUser = await Post.findByPk(post.id, {
            attributes: [
                'id', 'userId', 'content', 'fileUrl',
                'heartCount', 'shareCount', 'uploadedAt',
                'commentCount', 'songId'
            ],
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl', 'fullName']
            }]
        });

        // 4️⃣ Trả về kết quả (Phải parse JSON trước khi trả về client)
        let returnedPost = postWithUser.toJSON();
        try {
            if (returnedPost.fileUrl) {
                // Tự parse JSON trước khi trả về client
                returnedPost.fileUrl = JSON.parse(returnedPost.fileUrl);
                // Fallback nếu không phải mảng
                if (!Array.isArray(returnedPost.fileUrl)) {
                    returnedPost.fileUrl = [returnedPost.fileUrl];
                }
            } else {
                returnedPost.fileUrl = [];
            }
        } catch (e) {
            // Fallback cho dữ liệu cũ/sai định dạng
            returnedPost.fileUrl = [returnedPost.fileUrl];
        }

        return res.status(201).json({
            message: 'Tạo bài đăng thành công!',
            post: returnedPost // Trả về đã parse JSON
        });

    } catch (error) {
        console.error('❌ Lỗi khi tạo bài đăng:', error.message);
        return res.status(500).json({
            error: 'Tạo bài đăng thất bại',
            details: error.message
        });
    }
};


// --- CÁC HÀM KHÁC (Giữ nguyên) ---

exports.getPostById = async(req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        // 🆕 Thêm logic parse JSON cho fileUrl
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
        // ------------------------------------
        res.json(postJson);
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.getPostsByMe = async(req, res) => {
    try {
        const posts = await Post.findAll({ where: { userId: req.user.id } });
        // 🆕 Lặp qua và parse JSON cho fileUrl
        const parsedPosts = posts.map(post => {
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

function formatPostData(post, isLiked) {
    if (!post) return null;

    // Đảm bảo dữ liệu là đối tượng JavaScript thuần túy
    const postJson = post.toJSON ? post.toJSON() : post;

    let parsedFileUrls = null;

    // 1. Xử lý fileUrl: Phân tích chuỗi JSON thành mảng
    if (typeof postJson.fileUrl === 'string' && postJson.fileUrl.startsWith('[')) {
        try {
            parsedFileUrls = JSON.parse(postJson.fileUrl);
            if (!Array.isArray(parsedFileUrls)) {
                // Nếu parse không ra mảng (ví dụ: ra object), dùng chuỗi gốc làm phần tử duy nhất
                parsedFileUrls = [postJson.fileUrl];
            }
        } catch (e) {
            console.error("Lỗi parse JSON cho fileUrl:", e);
            parsedFileUrls = postJson.fileUrl ? [postJson.fileUrl] : null;
        }
    } else if (typeof postJson.fileUrl === 'string' && postJson.fileUrl.length > 0) {
        // Trường hợp fileUrl là chuỗi URL đơn
        parsedFileUrls = [postJson.fileUrl];
    }

    // 2. Trích xuất URL đầu tiên để Frontend dễ xử lý
    // Nếu Frontend (PostItem.tsx) mong đợi một string URL (hoặc null), ta trích xuất ở đây.
    const finalFileUrl = Array.isArray(parsedFileUrls) && parsedFileUrls.length > 0 ?
        parsedFileUrls[0] :
        null;

    // 3. Lấy commentCount từ trường tối ưu (nếu có)
    const commentCountFromDb = parseInt(postJson.commentCountOptimized) || postJson.commentCount || 0;

    return {
        ...postJson,
        // Chỉ trả về URL đầu tiên (hoặc null)
        fileUrl: finalFileUrl,
        // Cập nhật commentCount và xóa trường tạm
        commentCount: commentCountFromDb,
        commentCountOptimized: undefined, // Xóa trường tạm
        isLiked: isLiked,
    };
}


// --- HÀM LẤY BÀI ĐĂNG THEO USER ID ---
exports.getPostsByUserId = async(req, res) => {
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
        return res.status(400).json({ error: 'User ID không được cung cấp.' });
    }

    try {
        // 4. Truy vấn bài đăng
        const posts = await Post.findAll({
            where: { userId: profileUserId }, // 🎯 Lọc theo ID của Profile
            attributes: [
                'id', 'userId', 'content', 'fileUrl',
                'heartCount', 'shareCount', 'uploadedAt',
                'commentCount', 'songId', [
                    sequelize.literal(
                        // SỬ DỤNG LITERAL để đếm số comment trực tiếp từ DB
                        `(SELECT COUNT(*) FROM comments AS c WHERE c.post_id = "Post"."id")`
                    ),
                    'commentCountOptimized' // Alias để sử dụng trong bước Map
                ],
            ],
            include: [{
                model: User,
                as: 'User',
                attributes: ['id', 'username', 'avatarUrl', 'fullName'],
            }],
            order: [
                ['uploadedAt', 'DESC']
            ]
        });

        // 5. Map kết quả và XỬ LÝ DỮ LIỆU
        const postsWithExtras = await Promise.all(posts.map(async post => {
            const postJson = post.toJSON();
            const commentCountFromDb = parseInt(postJson.commentCountOptimized) || 0;

            // 🎯 GỌI HÀM CHECK ISLIKED BẰNG SEQUELIZE CHUẨN
            const isLiked = await checkIsLiked(numericUserId, postJson.id);

            // LOGIC PARSE CHUỖI JSON fileUrl THÀNH MẢNG (Giữ nguyên)
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
            };
        }));

        res.json(postsWithExtras);

    } catch (err) {
        console.error("Lỗi khi lấy bài đăng theo User ID:", err);
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
};

exports.updatePost = async(req, res) => {
    try {
        // 🆕 Lấy fileUrls nếu có và chuyển thành JSON string
        const body = req.body;
        if (body.fileUrls) {
            body.fileUrl = JSON.stringify(body.fileUrls);
            delete body.fileUrls; // Loại bỏ fileUrls khỏi body
        }

        const [updated] = await Post.update(body, { where: { id: req.params.id } });
        if (!updated) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const post = await Post.findByPk(req.params.id);

        // 🆕 Thêm logic parse JSON cho fileUrl trước khi trả về
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
        // ------------------------------------

        res.json(postJson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

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

exports.toggleLike = async(req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    try {
        // 1. KIỂM TRA: Người dùng đã thích bài đăng này chưa?
        const existingLike = await Like.findOne({
            where: {
                userId: userId,
                postId: postId
            }
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

            return res.status(200).json({ message: "Bỏ thích thành công.", isLiked: false, heartCount: post.heartCount });
        } else {
            // 3. THÍCH: Tạo bản ghi Like mới
            await Like.create({
                userId: userId,
                postId: postId
            });

            // Cập nhật heartCount
            post.heartCount += 1;
            await post.save();

            return res.status(201).json({ message: "Thích thành công.", isLiked: true, heartCount: post.heartCount });
        }
    } catch (error) {
        console.error("Lỗi khi toggle like:", error);
        res.status(500).json({ error: "Lỗi server khi xử lý thao tác thích/bỏ thích." });
    }
};