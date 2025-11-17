const { Follow, User, sequelize, FollowArtist, Artist } = require('../models');
const Sequelize = require('sequelize'); // Import module gốc
const spotify = require('../configs/spotify');
const Op = Sequelize.Op; // Lấy toán tử Op từ module gốc

const formatArtist = (artist, genres) => {
    return {
        id: artist?.spotifyId && artist.id ? artist.id : null,
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist.name,
        genres: genres || artist?.genres,
        imageUrl: artist?.images?.[0]?.url || artist?.imageUrl,
        type: artist?.type,
    }
}

// //  HÀM TIỆN ÍCH MỚI: Kiểm tra trạng thái follow của người dùng hiện tại đối với 1 người
// async function checkIsFollowing(currentUserId, targetUserId) {
//     if (!currentUserId || currentUserId === targetUserId) {
//         return false;
//     }
//     const follow = await Follow.findOne({
//         where: {
//             followerId: currentUserId,
//             userFolloweeId: targetUserId,
//         },
//     });
//     return !!follow;
// }

// // Toggle theo dõi người dùng
// exports.toggleUserFollow = async(req, res) => {
//     // 1. Lấy ID của người dùng hiện đang đăng nhập (Người theo dõi)
//     // Giả định middleware auth đã đặt req.user.id
//     const followerId = req.user.id;

//     // 2. Lấy ID của người dùng được theo dõi (Từ URL params)
//     const userFolloweeId = req.params.userId;

//     // Tự theo dõi chính mình?
//     if (followerId == userFolloweeId) {
//         return res.status(400).json({ message: "Bạn không thể theo dõi chính mình." });
//     }

//     try {
//         // 3. KIỂM TRA: Người dùng đã theo dõi chưa?
//         const existingFollow = await Follow.findOne({
//             where: {
//                 followerId: followerId,
//                 userFolloweeId: userFolloweeId,
//                 artistFolloweeId: null, // Đảm bảo chỉ kiểm tra follow User
//             }
//         });

//         if (existingFollow) {
//             // 4. HỦY THEO DÕI: Xóa bản ghi Follow
//             await existingFollow.destroy();
//             return res.status(200).json({ message: "Hủy theo dõi thành công.", isFollowing: false });
//         } else {
//             // 5. THỰC HIỆN THEO DÕI: Tạo bản ghi Follow mới
//             await Follow.create({
//                 followerId: followerId,
//                 userFolloweeId: userFolloweeId,
//                 artistFolloweeId: null,
//                 followedAt: new Date(),
//             });
//             return res.status(201).json({ message: "Theo dõi thành công.", isFollowing: true });
//         }
//     } catch (error) {
//         console.error("Lỗi toggleFollow:", error);
//         return res.status(500).json({ message: "Lỗi Server nội bộ khi xử lý theo dõi." });
//     }
// };

// // ----------------------------------------------------
// //  CHỨC NĂNG LẤY DANH SÁCH NGƯỜI THEO DÕI (FOLLOWERS)
// // ----------------------------------------------------
// /**
//  * Lấy danh sách những người đang theo dõi user có userId (Followers)
//  * Endpoint: GET /follows/users/:userId/followers
//  */
// exports.getUserFollowers = async(req, res) => {
//     const userId = req.params.userId; // ID của người được theo dõi (Followee, vd: user7916)
//     //  Lấy ID của người dùng đang đăng nhập (vd: user2718)
//     const currentUserId = req.user.id;

//     try {
//         const follows = await Follow.findAll({
//             where: {
//                 userFolloweeId: userId
//             },
//             // Liên kết để lấy thông tin chi tiết của Người theo dõi
//             include: [{
//                 model: User,
//                 as: 'Follower',
//                 attributes: ['id', 'username', 'avatarUrl', 'fullName'],
//             }],
//             order: [
//                 ['followedAt', 'DESC']
//             ]
//         });

//         // Chỉ trả về User object của những người theo dõi
//         const rawUsers = follows
//             .filter(follow => follow.Follower)
//             .map(follow => follow.Follower.get({ plain: true }));

//         //  THÊM LOGIC KIỂM TRA isFollowing
//         const finalData = await Promise.all(rawUsers.map(async(user) => {
//             const isFollowing = await checkIsFollowing(currentUserId, user.id);
//             return {
//                 ...user,
//                 isFollowing: isFollowing, // Trạng thái follow của user2718 đối với người này
//             };
//         }));

//         res.json(finalData);

//     } catch (error) {
//         console.error("Lỗi khi lấy danh sách người theo dõi:", error);
//         res.status(500).json({
//             error: "Lỗi Server khi tải danh sách người theo dõi."
//         });
//     }
// };

// // ----------------------------------------------------
// //  CHỨC NĂNG LẤY DANH SÁCH ĐANG THEO DÕI (FOLLOWING)
// // ----------------------------------------------------
// /**
//  * Lấy danh sách những người mà user có userId đang theo dõi (Following)
//  * Endpoint: GET /follows/users/:userId/following
//  */
// exports.getUserFollowing = async(req, res) => {
//     const userId = req.params.userId; // ID của người đang theo dõi (Follower, vd: user7916)
//     //  Lấy ID của người dùng đang đăng nhập (vd: user2718)
//     const currentUserId = req.user.id;

//     try {
//         const following = await Follow.findAll({
//             where: {
//                 followerId: userId,
//                 // ⚠️ CHỈ LẤY CÁC MỤC ĐANG THEO DÕI USER (không phải Artist)
//                 userFolloweeId: {
//                     [Op.not]: null
//                 }
//             },
//             // Liên kết để lấy thông tin chi tiết của Người được theo dõi
//             include: [{
//                 model: User,
//                 as: 'Followee', // Tên alias của người được theo dõi
//                 attributes: ['id', 'username', 'avatarUrl', 'fullName'],
//             }],
//             order: [
//                 ['followedAt', 'DESC']
//             ]
//         });

//         // Chỉ trả về User object của những người đang theo dõi
//         const rawUsers = following
//             .filter(follow => follow.Followee)
//             .map(follow => follow.Followee.get({ plain: true }));

//         //  THÊM LOGIC KIỂM TRA isFollowing
//         const finalData = await Promise.all(rawUsers.map(async(user) => {
//             const isFollowing = await checkIsFollowing(currentUserId, user.id);
//             return {
//                 ...user,
//                 isFollowing: isFollowing, // Trạng thái follow của user2718 đối với người này
//             };
//         }));

//         res.json(finalData);

//     } catch (error) {
//         console.error("Lỗi khi lấy danh sách đang theo dõi:", error);
//         res.status(500).json({
//             error: "Lỗi Server khi tải danh sách đang theo dõi."
//         });
//     }
// };

exports.getAllFollows = async (req, res) => {
    try {
        const rows = await Follow.findAll();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// exports.getFollowById = async(req, res) => {
//     try {
//         const row = await Follow.findByPk(req.params.id);
//         if (!row) return res.status(404).json({ error: 'Follow not found' });
//         res.json(row);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.getFollowByUserId = async(req, res) => {
//     try {
//         const userId = req.params.userId;
//         const follows = await Follow.findAll({ where: { userId } });
//         if (!follows) return res.status(404).json({ error: 'No Follow found for this user' });
//         res.json(follows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.getFollowByArtistFolloweeId = async(req, res) => {
//     try {
//         const artistFolloweeId = req.params.artistFolloweeId;
//         const follows = await Follow.findAll({ where: { artistFolloweeId } });
//         if (!follows) return res.status(404).json({ error: 'No follows found for this artist' });
//         res.json(follows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.getFollowByUserFolloweeId = async(req, res) => {
//     try {
//         const userFolloweeId = req.params.userFolloweeId;
//         const follows = await Follow.findAll({ where: { userFolloweeId } });
//         if (!follows) return res.status(404).json({ error: 'No follows found for this user' });
//         res.json(follows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// exports.createFollow = async(req, res) => {
//     try {
//         const row = await Follow.create(req.body);
//         res.status(201).json(row);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.updateFollow = async(req, res) => {
//     try {
//         const [updated] = await Follow.update(req.body, { where: { id: req.params.id } });
//         if (!updated) return res.status(404).json({ error: 'Follows not found' });
//         const row = await Follow.findByPk(req.params.id);
//         res.json(row);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.deleteFollow = async(req, res) => {
//     try {
//         const deleted = await Follow.destroy({ where: { id: req.params.id } });
//         if (!deleted) return res.status(404).json({ error: 'Follows not found' });
//         res.json({ message: 'Follows deleted' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.getFollowerOfArtist = async (req, res) => {
    try {
        const { artistSpotifyId } = req.body;
        console.log(artistSpotifyId)

        if (!artistSpotifyId) {
            return res.status(400).json({ error: 'Either artistId or artistSpotifyId is required' });
        }

        const followers = await FollowArtist.findAll({
            where: { artistSpotifyId: artistSpotifyId }
        });

        if (!followers) {
            return res.status(404).json({ error: 'No followers found for this artist' });
        }

        return res.status(200).json({
            message: 'Followers retrieved successfully',
            data: followers,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getArtistFollowedByUser = async (req, res) => {
    try {
        const followArtists = await FollowArtist.findAll({
            where: { followerId: req.user.id }
        })

        const dataFormated = [];

        if (!followArtists) {
            return res.status(404).json({ error: 'No followed artist found for this user' });
        }

        for (const follow of followArtists) {
            const artist = await Artist.findByPk(follow.artistId);
            if (artist) {
                dataFormated.push({
                    ...follow.toJSON(),
                    artist: formatArtist(artist)
                });
            }
        }

        console.log(dataFormated)

        return res.status(200).json({
            message: 'Followed artists retrieved successfully',
            data: dataFormated,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.createFollowArtist = async (req, res) => {
    try {
        let { artistId, artistSpotifyId } = req.body;
        const userId = req.user.id;

        console.log(req.body)
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!artistId && !artistSpotifyId) {
            return res.status(400).json({ error: 'Either artistId or artistSpotifyId is required' });
        }

        if (!artistId) {
            console.log('first')

            const existingArtist = await Artist.findOne({
                where: { spotifyId: artistSpotifyId },
            });

            console.log(12)
            if (!existingArtist) {
                console.log(14)
                const artistRow = await Artist.create({
                    spotifyId: artistSpotifyId,
                });
                console.log('artist row: ', artistRow);
                if (!artistRow) {
                    return res.status(500).json({ error: 'Cannot create artist to follow' });
                }

                console.log(2)
                artistId = artistRow.id;
            } else {
                console.log(13)
                artistId = existingArtist.id;
            }
        }

        console.log(3)
        const existingFollow = await FollowArtist.findOne({
            where: {
                followerId: userId,
                artistId: artistId,
            },
        });

        console.log(4)
        if (existingFollow) {
            console.log(5)
            return res.status(400).json({ error: 'You are already following this artist' });
        }

        console.log(6)
        console.log(6)
        const row = await FollowArtist.create({
            followerId: userId,
            artistId,
            artistSpotifyId,
        });

        console.log(7)
        if (!row) {
            console.log(8)
            return res.status(500).json({ error: 'Cannot create follow artist' });
        }

        console.log(9)
        let artist = await Artist.findByPk(artistId);
        if (artist) {
            artist.totalFollowers += 1;
        }
        if (!artist || !artist.name) {
            responseArtist = await spotify.findArtistById(artistSpotifyId);
            if (responseArtist) {
                artist.name = responseArtist.name;
                artist.imageUrl = responseArtist.images?.[0]?.url || null;
            }
        }
        await artist.save();

        console.log(10)
        let dataFormated = {
            ...row.toJSON(),
            artist: formatArtist(artist, null)
        };
        console.log(dataFormated)
        return res.status(201).json({
            message: 'FollowArtist created successfully',
            data: dataFormated,
            success: true
        });
    } catch (error) {
        console.log(11)
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFollowArtist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'FollowArtist ID is required' });
        }

        const followArtist = await FollowArtist.findByPk(id);
        if (!followArtist) {
            return res.status(404).json({ error: 'FollowArtist not found' });
        }
        const artist = await Artist.findByPk(followArtist.artistId);
        if (artist && artist.totalFollowers > 0) {
            artist.totalFollowers -= 1;
            await artist.save();
        }
        const deleted = await FollowArtist.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'FollowArtist not found' });
        res.json({ message: 'FollowArtist deleted', success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}