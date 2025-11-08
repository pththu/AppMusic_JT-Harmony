const { Post, User, Track, Like } = require('../models');

class CoverService {
    static async getCoversBySongId(songId) {
        return await Post.findAll({
            where: { originalSongId: songId, isCover: true },
            include: [
                { model: User, as: 'User', attributes: ['id', 'username', 'avatarUrl', 'fullName'] },
                { model: Track, as: 'OriginalSong', attributes: ['id', 'title', 'artist'] }
            ],
            order: [
                ['uploadedAt', 'DESC']
            ]
        });
    }

    static async getTopCovers(limit = 10) {
        return await Post.findAll({
            where: { isCover: true },
            include: [
                { model: User, as: 'User', attributes: ['id', 'username', 'avatarUrl', 'fullName'] },
                { model: Track, as: 'OriginalSong', attributes: ['id', 'title', 'artist'] }
            ],
            order: [
                ['heartCount', 'DESC']
            ],
            limit: limit
        });
    }

    static async voteCover(userId, coverId) {
        const cover = await Post.findByPk(coverId);
        if (!cover || !cover.isCover) {
            throw new Error('Cover không tồn tại');
        }

        const existingLike = await Like.findOne({
            where: { userId: userId, postId: coverId }
        });

        if (existingLike) {
            await existingLike.destroy();
            cover.heartCount = Math.max(0, cover.heartCount - 1);
            await cover.save();
            return { message: 'Bỏ vote thành công', isLiked: false, heartCount: cover.heartCount };
        } else {
            await Like.create({ userId: userId, postId: coverId });
            cover.heartCount += 1;
            await cover.save();
            return { message: 'Vote thành công', isLiked: true, heartCount: cover.heartCount };
        }
    }

    static async createCover(userId, data) {
        const { content, fileUrls, originalSongId } = data;
        return await Post.create({
            userId,
            content,
            fileUrl: fileUrls && fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
            songId: null, // Cover không liên kết với songId gốc
            isCover: true,
            originalSongId: originalSongId
        });
    }
}

module.exports = CoverService;