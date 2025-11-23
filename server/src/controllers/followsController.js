const { Follow, User, sequelize, FollowArtist, Artist, FollowUser } = require('../models');
const Sequelize = require('sequelize'); // Import module gốc
const spotify = require('../configs/spotify');
const { getCached } = require('../utils/cache');
const { redisClient } = require('../configs/redis');
const Op = Sequelize.Op; // Lấy toán tử Op từ module gốc

const DEFAULT_TTL_SECONDS = 3600 * 2; // 2 giờ
const SHORT_TTL_SECONDS = 1800;

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

// ================= FOLLOW ARTIST CONTROLLER =================
const GetFollowerOfArtist = async (req, res) => {
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

const GetArtistFollowedByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const followArtists = await FollowArtist.findAll({
            where: { followerId: userId }
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

        return res.status(200).json({
            message: 'Followed artists retrieved successfully',
            data: dataFormated,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const CreateFollowArtist = async (req, res) => {
    try {
        let { artistId, artistSpotifyId } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!artistId && !artistSpotifyId) {
            return res.status(400).json({ error: 'Either artistId or artistSpotifyId is required' });
        }

        if (!artistId) {
            const existingArtist = await Artist.findOne({
                where: { spotifyId: artistSpotifyId },
            });

            if (!existingArtist) {
                const artistRow = await Artist.create({
                    spotifyId: artistSpotifyId,
                });
                if (!artistRow) {
                    return res.status(500).json({ error: 'Cannot create artist to follow' });
                }

                artistId = artistRow.id;
            } else {
                artistId = existingArtist.id;
            }
        }

        const existingFollow = await FollowArtist.findOne({
            where: {
                followerId: userId,
                artistId: artistId,
            },
        });

        if (existingFollow) {
            return res.status(400).json({ error: 'You are already following this artist' });
        }

        const row = await FollowArtist.create({
            followerId: userId,
            artistId,
            artistSpotifyId,
        });

        if (!row) {
            return res.status(500).json({ error: 'Cannot create follow artist' });
        }

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

        let dataFormated = {
            ...row.toJSON(),
            artist: formatArtist(artist, null)
        };
        return res.status(201).json({
            message: 'FollowArtist created successfully',
            data: dataFormated,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const DeleteFollowArtist = async (req, res) => {
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

// ================ FOLLOW USER CONTROLLER ================

const CreateFollowUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { followeeId } = req.params;

        if (!followerId || !followeeId) {
            return res.status(400).json({ error: 'Both followerId and followeeId are required' });
        }

        const existingFollow = await FollowUser.findOne({
            where: {
                followerId,
                followeeId,
            },
        });

        if (existingFollow) {
            return res.status(400).json({ error: 'You are already following this user' });
        }

        const row = await FollowUser.create({
            followerId,
            followeeId,
        });

        if (!row) {
            return res.status(500).json({ error: 'Cannot create follow user' });
        }

        let followee = await User.findByPk(followeeId,
            { attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'bio'] }
        );

        // Invalidate related cache entries
        const cacheKeyFollowers = `followers_user_${followeeId}`;
        const cacheKeyFollowedUsers = `followed_users_${followerId}`;
        const cacheKeyProfileSocial = `user_profile_social_${followeeId}`;
        const cacheKeyProfileSocialFollower = `user_profile_social_${followerId}`;
        await redisClient.del(cacheKeyProfileSocial);
        await redisClient.del(cacheKeyProfileSocialFollower);
        await redisClient.del(cacheKeyFollowers);
        await redisClient.del(cacheKeyFollowedUsers);

        return res.status(201).json({
            message: 'FollowUser created successfully',
            data: followee,
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const DeleteFollowUser = async (req, res) => {
    try {
        const { followeeId, followerId } = req.query;
        console.log(req.query)
        if (!followeeId && !followerId) {
            return res.status(400).json({ error: 'Both followeeId and followerId are required' });
        }

        if (followeeId === followerId) {
            return res.status(400).json({ error: 'Cannot unfollow yourself' });
        }

        const deleted = await FollowUser.destroy({ where: { followeeId, followerId } });
        if (!deleted) return res.status(404).json({ error: 'FollowUser not found' });

        const cacheKeyFollowers = `followers_user_${followeeId}`;
        const cacheKeyFollowedUsers = `followees_user_${followerId}`;
        const cacheKeyProfileSocial = `user_profile_social_${followeeId}`;
        const cacheKeyProfileSocialFollower = `user_profile_social_${followerId}`;
        await redisClient.del(cacheKeyProfileSocial);
        await redisClient.del(cacheKeyProfileSocialFollower);
        await redisClient.del(cacheKeyFollowers);
        await redisClient.del(cacheKeyFollowedUsers);

        return res.json({ message: 'FollowUser deleted', success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// người theo dõi user
const GetFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        const cacheKey = `followers_user_${userId}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('CACHE HIT (followers of user');
            return res.status(200).json(JSON.parse(cachedData));
        }
        console.log('CACHE MISS (followers of user');

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const followers = await FollowUser.findAll({
            where: { followeeId: userId },
            include: [
                {
                    model: User, as: 'follower',
                    attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'bio']
                }
            ]
        });

        if (followers.length === 0) {
            return res.status(404).json({ error: 'No followers found for this user' });
        }

        const followersData = followers.map(follow => follow.follower);

        const response = {
            message: 'Followers retrieved successfully',
            data: followersData,
            success: true
        };

        await redisClient.set(cacheKey, JSON.stringify(response), { EX: DEFAULT_TTL_SECONDS });
        return res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// người được user theo dõi
const GetFollowees = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const cacheKey = `followees_user_${userId}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('CACHE HIT (followed users)');
            return res.status(200).json(JSON.parse(cachedData));
        }
        console.log('CACHE MISS (followed users)');

        const followUsers = await FollowUser.findAll({
            where: { followerId: userId },
            include: [
                {
                    model: User, as: 'followee',
                    attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'bio']
                }
            ]
        });

        if (followUsers.length === 0) {
            return res.status(404).json({ error: 'No followed users found for this user' });
        }

        const followeesData = followUsers.map(follow => follow.followee);

        const response = {
            message: 'Followed users retrieved successfully',
            data: followeesData,
            success: true
        };

        await redisClient.set(cacheKey, JSON.stringify(response), { EX: DEFAULT_TTL_SECONDS });
        return res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const GetUserProfileSocial = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const cacheKey = `user_profile_social_${userId}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('CACHE HIT (user profile social)');
            return res.status(200).json(JSON.parse(cachedData));
        }
        console.log('CACHE MISS (user profile social)');

        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'fullName', 'email', 'avatarUrl', 'bio']
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // dếm số người theo dõi
        const followerCount = await FollowUser.count({
            where: { followeeId: userId }
        });

        // dem số người được theo dõi
        const followingCount = await FollowUser.count({
            where: { followerId: userId }
        });

        console.log('Follower count:', followerCount);
        console.log('Following count:', followingCount);

        const response = {
            message: 'User profile social retrieved successfully',
            data: {
                ...user.toJSON(),
                followerCount,
                followingCount
            },
            success: true
        };

        await redisClient.set(cacheKey, JSON.stringify(response), { EX: SHORT_TTL_SECONDS });
        return res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    GetFollowerOfArtist,
    GetArtistFollowedByUser,
    CreateFollowArtist,
    DeleteFollowArtist,
    CreateFollowUser,
    DeleteFollowUser,
    GetFollowers,
    GetFollowees,
    GetUserProfileSocial
}