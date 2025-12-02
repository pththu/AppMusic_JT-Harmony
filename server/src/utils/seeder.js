const sequelize = require('../configs/database');

const { Artist, Genres, Album, Track, Role, User, Playlist, FollowUser,
    FollowArtist, Post, Like, Comment, PostReport,
    Conversation, ConversationMember, Message, SearchHistory,
    ListeningHistory,
    FavoriteItem } = require('../models');

// Đọc file JSON trực tiếp
const roleData = require('../seeders/roles.json');
const userData = require('../seeders/users.json');
const genresData = require('../seeders/genres.json');
const artistData = require('../seeders/artists.json');
const albumData = require('../seeders/albums.json');
const trackData = require('../seeders/tracks.json');
const playlistData = require('../seeders/playlists.json');
const followUserData = require('../seeders/follow_user.json');
const followArtistData = require('../seeders/follow_artist.json');
const searchHistoryData = require('../seeders/search_history.json');
const favoriteItemData = require('../seeders/favorite.json');
const listeningHistoryData = require('../seeders/listen_history.json');

const postData = require('../seeders/posts.json');
const conversationData = require('../seeders/conversations.json');
const conversationMemberSeedData = require('../seeders/conversationMembers.json');

const mapArtist = async () => {
    const artists = await Artist.findAll({ attributes: ['id', 'name'] });
    const artistMap = artists.reduce((map, artist) => {
        map[artist.name] = artist.id;
        return map;
    }, {});
    return artistMap;
}

const mapAlbum = async () => {
    const albums = await Album.findAll({ attributes: ['id', 'name'] });
    const albumMap = albums.reduce((map, album) => {
        map[album.name] = album.id;
        return map;
    }, {});
    return albumMap;
}

const mapGenres = async () => {
    const genres = await Genres.findAll({ attributes: ['id', 'name'] });
    const genreMap = genres.reduce((map, genre) => {
        map[genre.name] = genre.id;
        return map;
    }, {});
    return genreMap;
}

const mapTrack = async () => {
    const tracks = await Track.findAll({ attributes: ['id', 'name'] });
    const trackMap = tracks.reduce((map, track) => {
        map[track.name] = track.id;
        return map;
    }, {});
    return trackMap;
}

const mapTrackBySpotifyId = async () => {
    const tracks = await Track.findAll({ attributes: ['id', 'spotifyId'] });
    const trackMap = tracks.reduce((map, track) => {
        map[track.spotifyId] = track.id;
        return map;
    }, {});
    return trackMap;
}

/**
 * --- 1. SEED DATA CHO ROLE ---
 * Kiểm tra nếu bảng Role đã có dữ liệu (quan trọng để tránh trùng lặp)
 * Sử dụng bulkCreate để chèn tất cả data cùng lúc (hiệu suất cao)
 */
const seedDataRole = async () => {
    try {
        const roleCount = await Role.count();
        if (roleCount === 0) {
            console.log('Start insert Role...');

            await Role.bulkCreate(roleData, { ignoreDuplicates: true });
            console.log(' Finish insert Role.');
        } else {
            console.log('Pass insert Role');
        }
    } catch (error) {
        console.log(error)
    }
};

/**
 * --- 2. SEED DATA CHO USER ---
 * Lấy ID của các Roles đã chèn để gán cho User
 * Sau đó ánh xạ (map) dữ liệu User để thay thế roleName bằng roleId 
 * và Xóa roleName khỏi object vì nó không có trong Model User
 */
const seedDataUser = async () => {
    try {
        const userCount = await User.count();
        if (userCount === 0) {
            console.log('Start insert User...');
            const roles = await Role.findAll({ attributes: ['id', 'name'] });
            const roleMap = roles.reduce((map, role) => {
                map[role.name] = role.id;
                return map;
            }, {});

            const usersToInsert = userData.map(user => ({
                ...user,
                roleId: roleMap[user.roleName],
                roleName: undefined
            }));

            await User.bulkCreate(usersToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert User.');
        } else {
            console.log('Pass insert User');
        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * --- 3. SEED DATA CHO GENRES ---
 */
const seedDataGenres = async () => {
    try {
        const genresCount = await Genres.count();
        if (genresCount === 0) {
            console.log('Start insert Genres...');
            await Genres.bulkCreate(genresData, { ignoreDuplicates: true });
            console.log(' Finish insert Genres.');
        } else {
            console.log('Pass insert Genres');
        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * --- 4. SEED DATA CHO ARTISTS ---
 * Trước tiên ánh xạ dữ liệu thô (artistData) sang cấu trúc model Artist
 * các trường không tồn tại trong model sẽ bị bỏ qua
 */
const seedDataArtists = async () => {
    try {
        const artistCount = await Artist.count();
        if (artistCount === 0) {
            console.log('Start insert Artists...');

            const artistsToInsert = artistData.map(artist => ({
                spotifyId: artist.spotifyId,
                name: artist.name,
                imageUrl: artist.imageUrl
            }));

            await Artist.bulkCreate(artistsToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert Artists.');
        } else {
            console.log('Pass insert Artists');
        }
    } catch (error) {
        console.log('Error insert Artists:', error);
    }
};

/**
 * --- 5. SEED DATA CHO BẢNG TRUNG GIAN ARTIST_GENRES ---
 * Bảng này liên kết nhiều-nhiều giữa Artist và Genres
 * Cần lấy ID của cả 2 bảng để chèn vào bảng trung gian.
 * Bước 1: Truy cập model của bảng trung gian qua sequelize.models
 * Bước 2: Lấy tất cả Artist và Genres để tạo map từ spotifyId/name sang ID
 * Bước 4: Duyệt qua dữ liệu thô (artistData) để tạo mảng dữ liệu cho bảng trung gian
 * Bước 5: Chèn dữ liệu vào bảng trung gian sử dụng bulkCreate
 */
const seedDataArtistGenres = async () => {
    try {
        const junctionTable = sequelize.models.artist_genres;

        const junctionCount = await junctionTable.count();
        if (junctionCount === 0) {
            console.log('Start insert artist_genres...');
            const artistMap = await mapArtist();
            const genreMap = await mapGenres();

            const artistGenresToInsert = [];
            for (const artist of artistData) {
                if (!artist.genres || artist.genres.length === 0) {
                    continue; /* Bỏ qua nếu artist không có genres */
                }

                const artistId = artistMap[artist.name];
                if (!artistId) continue; /* Bỏ qua nếu không tìm thấy artist (lỗi data) */

                for (const genreName of artist.genres) {
                    const genreId = genreMap[genreName];
                    if (genreId) {
                        artistGenresToInsert.push({ artist_id: artistId, genre_id: genreId });
                    }
                }
            }

            // console.log('artistGenresToInsert', artistGenresToInsert);
            await junctionTable.bulkCreate(artistGenresToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert artist_genres.');
        } else {
            console.log('Pass insert artist_genres.');
        }
    } catch (error) {
        console.log('Lỗi khi chèn artist_genres:', error);
    }
}

/**
 * --- 6. SEED DATA CHO ALBUM ---
 * tuong tự như Artists
 */
const seedDataAlbum = async () => {
    try {
        const albumCount = await Album.count();

        if (albumCount === 0) {
            console.log('Start insert Album...');
            const albumsToInsert = albumData.map(album => ({
                spotifyId: album.spotifyId,
                name: album.name,
                imageUrl: album.imageUrl,
                totalTracks: album.totalTracks,
                releaseDate: album.releaseDate
            }));

            await Album.bulkCreate(albumsToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert Album.');
        } else {
            console.log('Pass insert Album.');
        }

    } catch (error) {
        console.log('Error insert album', error);
    }
}

/**
 * --- 7. SEED DATA CHO BẢNG TRUNG GIAN ARTIST_ALBUMS ---
 */
const seedDataArtistAlbums = async () => {
    try {
        const junctionTable = sequelize.models.artist_albums;

        const junctionCount = await junctionTable.count();

        if (junctionCount === 0) {
            console.log('Start insert artist_albums...');

            const artistMap = await mapArtist();
            const albumMap = await mapAlbum();

            const artistAlbumsToInsert = [];
            for (const album of albumData) {
                if (!album.artists || album.artists.length === 0) {
                    continue; /* Bỏ qua nếu album không có artists */
                }

                const albumId = albumMap[album.name];
                if (!albumId) continue; /* Bỏ qua nếu không tìm thấy album (lỗi data) */

                for (const artistName of album.artists) {
                    const artistId = artistMap[artistName];
                    if (artistId) {
                        artistAlbumsToInsert.push({ artist_id: artistId, album_id: albumId });
                    }
                }
            }

            await junctionTable.bulkCreate(artistAlbumsToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert artist_albums.');
        } else {
            console.log('Pass insert artist_albums.');
        }

    } catch (error) {
        console.log('Error insert artist_albums', error);
    }
}

/**
 * --- 8. SEED DATA CHO TRACK ---
 */
const seedDataTrack = async () => {
    try {
        const trackCount = await Track.count();

        if (trackCount === 0) {
            console.log('Start insert Tracks...');

            const albumMap = await mapAlbum();

            const tracksToInsert = trackData.map(track => ({
                spotifyId: track.spotifyId,
                videoId: track.videoId,
                name: track.name,
                lyrics: track.lyrics,
                externalUrl: track.externalUrl,
                duration: track.duration,
                albumId: albumMap[track.album] || null,
                discNumber: track.discNumber,
                trackNumber: track.trackNumber,
                explicit: track.explicit,
                playCount: track.playCount,
                shareCount: track.shareCount
            }));

            await Track.bulkCreate(tracksToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert Tracks.');
        } else {
            console.log('Pass insert Tracks.');
        }
    } catch (error) {
        console.log('Error insert tracks', error);
    }
}

/**
 * --- 9. SEED DATA CHO BẢNG TRUNG GIAN ARTIST_TRACKS ---
 */
const seedDataArtistTracks = async () => {
    try {
        const junctionTable = sequelize.models.artist_tracks;
        const junctionCount = await junctionTable.count();

        if (junctionCount === 0) {
            console.log('Start insert artist_tracks..');
            const artistMap = await mapArtist();
            const trackMap = await mapTrack();

            const artistTracksToInsert = [];
            for (const track of trackData) {
                if (!track.artists || track.artists.length === 0) {
                    continue; /* Bỏ qua nếu track không có artists */
                }

                const trackId = trackMap[track.name];
                if (!trackId) continue; /* Bỏ qua nếu không tìm thấy track (lỗi data) */

                for (const artistName of track.artists) {
                    const artistId = artistMap[artistName];
                    if (artistId) {
                        artistTracksToInsert.push({ artist_id: artistId, track_id: trackId });
                    }
                }
            }

            await junctionTable.bulkCreate(artistTracksToInsert, { ignoreDuplicates: true });
            console.log(' Finish insert artist_tracks.');
        } else {
            console.log('Pass insert artist_tracks.');
        }

    } catch (error) {
        console.log('Error insert artist_tracks', error);
    }
}

/**
 * --- 10. SEED DATA CHO PLAYLIST ---
 */
const seedDataPlaylist = async () => {
    try {
        const playlistCount = await Playlist.count();

        if (playlistCount === 0) {
            console.log('Start insert Playlists...');

            const playlistsToInsert = playlistData.map(playlist => ({
                spotifyId: playlist.spotifyId,
                name: playlist.name,
                description: playlist.description,
                imageUrl: playlist.imageUrl,
                totalTracks: playlist.totalTracks,
                shareCount: playlist.shareCount,
                isPublic: playlist.isPublic
            }));

            await Playlist.bulkCreate(playlistsToInsert, { ignoreDuplicates: true });
            console.log('✅ Finish insert Playlists.');
        } else {
            console.log('Pass insert Playlist.');
        }

    } catch (error) {
        console.log('Error insert playlist', error);
    }
}

/**
 * --- 11. SEED DATA CHO POST ---
 * Luôn append thêm dữ liệu từ posts.json (không xoá dữ liệu cũ)
 */
const seedDataPost = async () => {
    try {
        console.log('Start insert Posts (append)...');

        const users = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
        const userIds = users.map(u => u.id);

        // Map spotifyId -> track.id để không phụ thuộc vào thứ tự seed/ID tự tăng
        const trackSpotifyMap = await mapTrackBySpotifyId();

        const postsToInsert = postData.map(p => ({
            userId: userIds.length ? userIds[((p.userId || 1) - 1) % userIds.length] : null,
            content: p.content,
            fileUrl: p.fileUrl || null,
            heartCount: p.heartCount || 0,
            shareCount: p.shareCount || 0,
            commentCount: p.commentCount || 0,
            // Dùng trackSpotifyId/originalTrackSpotifyId từ posts.json để map sang Track.id
            songId: p.trackSpotifyId ? (trackSpotifyMap[p.trackSpotifyId] || null) : null,
            isCover: !!p.isCover,
            originalSongId: p.originalTrackSpotifyId ? (trackSpotifyMap[p.originalTrackSpotifyId] || null) : null,
            originalPostId: p.originalPostId || null
        }));

        await Post.bulkCreate(postsToInsert, { ignoreDuplicates: true });
        console.log(' Finish insert Posts.');
    } catch (error) {
        console.log('Error insert posts', error);
    }
}

const seedDataLike = async () => {
    try {
        console.log('Start insert Likes (append)...');

        const users = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
        const posts = await Post.findAll({
            attributes: ['id', 'userId'],
            order: [['id', 'DESC']],
            limit: 20, // chỉ seed cho 20 post mới nhất
        });

        if (!users.length || !posts.length) {
            console.log('Skip insert Likes because no users or posts');
            return;
        }

        const userIds = users.map(u => u.id);
        const likesToInsert = [];

        for (const post of posts) {
            const likeTarget = 3 + Math.floor(Math.random() * 3); // 3-5 like mỗi post

            const usedUserIds = new Set();

            if (!usedUserIds.has(post.userId)) {
                usedUserIds.add(post.userId);
                likesToInsert.push({ userId: post.userId, postId: post.id });
            }

            let idx = 0;
            while (usedUserIds.size < likeTarget) {
                const userId = userIds[idx % userIds.length];
                idx++;
                if (usedUserIds.has(userId)) continue;
                usedUserIds.add(userId);
                likesToInsert.push({ userId, postId: post.id });
            }
        }

        await Like.bulkCreate(likesToInsert, { ignoreDuplicates: true });
        console.log(' Finish insert Likes.');
    } catch (error) {
        console.log('Error insert likes', error);
    }
}

const seedDataComment = async () => {
    try {
        console.log('Start insert Comments (append)...');

        const users = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
        const posts = await Post.findAll({
            attributes: ['id'],
            order: [['id', 'DESC']],
            limit: 20, // chỉ seed cho 20 post mới nhất
        });

        if (!users.length || !posts.length) {
            console.log('Skip insert Comments because no users or posts');
            return;
        }

        const userIds = users.map(u => u.id);
        const commentsToInsert = [];

        const sampleContents = [
            'Love this post!',
            'Bài này nghe cuốn quá.',
            'On repeat all day.',
            'Nghe nhạc mà thấy chill hẳn.',
            'This track is a masterpiece.',
            'Lyrics đỉnh quá trời.',
            'Cảm ơn đã share bài này.',
            'Perfect song for coding session.',
            'Giai điệu nhẹ nhàng dễ chịu.',
            'Can you share more songs like this?'
        ];

        const randomContent = () => sampleContents[Math.floor(Math.random() * sampleContents.length)];

        for (const post of posts) {
            const totalComments = 10 + Math.floor(Math.random() * 6);
            const rootCount = Math.max(4, Math.floor(totalComments * 0.6));

            for (let i = 0; i < rootCount; i++) {
                const userId = userIds[(i + post.id) % userIds.length];
                commentsToInsert.push({
                    userId,
                    postId: post.id,
                    trackId: null,
                    content: randomContent(),
                    parentId: null,
                    fileUrl: null,
                    timecodeMs: null
                });
            }

            const replyCount = totalComments - rootCount;
            for (let i = 0; i < replyCount; i++) {
                const userId = userIds[(i + 1 + post.id) % userIds.length];
                commentsToInsert.push({
                    userId,
                    postId: post.id,
                    trackId: null,
                    content: randomContent(),
                    parentId: null,
                    fileUrl: null,
                    timecodeMs: null
                });
            }
        }

        const createdComments = await Comment.bulkCreate(commentsToInsert, { ignoreDuplicates: true, returning: true });

        const byPost = {};
        for (const c of createdComments) {
            if (!byPost[c.postId]) byPost[c.postId] = [];
            byPost[c.postId].push(c);
        }

        for (const postId of Object.keys(byPost)) {
            const list = byPost[postId];
            if (list.length < 2) continue;
            const roots = list.slice(0, Math.floor(list.length * 0.6));
            const replies = list.slice(roots.length);
            for (const reply of replies) {
                const parent = roots[Math.floor(Math.random() * roots.length)];
                reply.parentId = parent.id;
                await reply.save();
            }
        }

        console.log(' Finish insert Comments.');
    } catch (error) {
        console.log('Error insert comments', error);
    }
}

const seedDataPostReport = async () => {
    try {
        console.log('Start insert PostReports (append)...');

        const users = await User.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
        const posts = await Post.findAll({ attributes: ['id'], order: [['id', 'ASC']] });

        if (!users.length || !posts.length) {
            console.log('Skip insert PostReports because no users or posts');
            return;
        }

        const reporterIds = users.map(u => u.id).filter(id => id !== 1);
        const reasons = ['adult_content', 'self_harm', 'misinformation', 'unwanted_content'];
        const statuses = ['pending', 'reviewed', 'resolved'];

        const reportsToInsert = [];
        const targetReports = Math.min(10, posts.length);

        for (let i = 0; i < targetReports; i++) {
            const post = posts[i % posts.length];
            const reporterId = reporterIds[i % reporterIds.length] || reporterIds[0];
            const reason = reasons[i % reasons.length];
            const status = statuses[i % statuses.length];

            reportsToInsert.push({
                postId: post.id,
                reporterId,
                reason,
                status,
                reportedAt: new Date(),
                reviewedAt: status === 'pending' ? null : new Date(),
                adminNotes: status === 'resolved' ? 'Resolved in seed data.' : null
            });
        }

        await PostReport.bulkCreate(reportsToInsert, { ignoreDuplicates: true });
        console.log(' Finish insert PostReports.');
    } catch (error) {
        console.log('Error insert post reports', error);
    }
}

const seedDataConversation = async () => {
    try {
        console.log('Start insert Conversations (append)...');

        const conversationsToInsert = conversationData.map(c => ({
            type: c.type || 'private',
            name: c.name || null
        }));

        await Conversation.bulkCreate(conversationsToInsert, { ignoreDuplicates: true });
        console.log(' Finish insert Conversations.');
    } catch (error) {
        console.log('Error insert conversations', error);
    }
}

const seedDataConversationMember = async () => {
    try {
        console.log('Start insert ConversationMembers (append)...');

        const conversations = await Conversation.findAll({ attributes: ['id'], order: [['id', 'ASC']] });
        if (!conversations.length) {
            console.log('Skip insert ConversationMembers because no conversations');
            return;
        }

        const membersToInsert = conversationMemberSeedData.map(m => {
            const index = m.conversationIndex - 1;
            const conversation = conversations[index];
            if (!conversation) return null;
            return {
                conversationId: conversation.id,
                userId: m.userId,
                isAdmin: !!m.isAdmin,
                lastReadMessageId: null,
                status: 'active'
            };
        }).filter(Boolean);

        await ConversationMember.bulkCreate(membersToInsert, { ignoreDuplicates: true });
        console.log(' Finish insert ConversationMembers.');
    } catch (error) {
        console.log('Error insert conversation members', error);
    }
}

const seedDataMessage = async () => {
    try {
        console.log('Start insert Messages (append)...');

        const conversations = await Conversation.findAll({ order: [['id', 'ASC']] });
        const members = await ConversationMember.findAll({ order: [['conversation_id', 'ASC'], ['id', 'ASC']] });

        if (!conversations.length || !members.length) {
            console.log('Skip insert Messages because no conversations or members');
            return;
        }

        const byConversation = {};
        for (const m of members) {
            if (!byConversation[m.conversationId]) byConversation[m.conversationId] = [];
            byConversation[m.conversationId].push(m);
        }

        const sampleMessages = [
            'Hey, have you listened to the new track?',
            'Vừa nghe bài mới, hay cực!',
            'This song is perfect for late night coding.',
            'Nghe nhạc mà muốn nhảy luôn đó.',
            'I can’t stop replaying this track.',
            'Giai điệu bài này chill ghê.',
            'Send me your favorite playlist!',
            'Cho mình xin tên bài hát với.',
            'This chorus is stuck in my head.',
            'Nghe mà nổi da gà luôn.'
        ];

        const randomMessage = () => sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

        for (const conversation of conversations) {
            const convMembers = byConversation[conversation.id] || [];
            if (convMembers.length === 0) continue;

            const totalMessages = 15 + Math.floor(Math.random() * 6);
            const createdForConv = [];

            for (let i = 0; i < totalMessages; i++) {
                const sender = convMembers[i % convMembers.length];
                const base = {
                    conversationId: conversation.id,
                    senderId: sender.userId,
                    content: randomMessage(),
                    type: 'text',
                    fileUrl: null,
                    replyToId: null
                };

                if (i > 2 && Math.random() < 0.3 && createdForConv.length) {
                    const target = createdForConv[Math.floor(Math.random() * createdForConv.length)];
                    base.replyToId = target.id;
                }

                const msg = await Message.create(base);
                createdForConv.push(msg);
            }

            const last = createdForConv[createdForConv.length - 1];
            if (last) {
                conversation.lastMessageId = last.id;
                await conversation.save();
            }

            if (convMembers.length >= 2 && createdForConv.length) {
                const mid = createdForConv[Math.floor(createdForConv.length / 2)];
                const lastMsg = createdForConv[createdForConv.length - 1];
                convMembers[0].lastReadMessageId = lastMsg.id;
                convMembers[1].lastReadMessageId = mid.id;
                await convMembers[0].save();
                await convMembers[1].save();
            }
        }

        console.log(' Finish insert Messages.');
    } catch (error) {
        console.log('Error insert messages', error);
    }
}

const seedDataFollowUser = async () => {
    try {
        console.log('Start insert FollowUser...');

        // 1. Lấy tất cả user để tạo map (username -> id)
        // Chỉ lấy id và username để tối ưu hiệu suất
        const users = await User.findAll({
            attributes: ['id', 'username']
        });

        // 2. Tạo Map để tra cứu nhanh: { "usernameA": 1, "usernameB": 2 }
        const userMap = users.reduce((map, user) => {
            map[user.username] = user.id;
            return map;
        }, {});

        const followsToInsert = [];

        for (const item of followUserData) {
            const followerId = userMap[item.follower]; // Tìm ID người theo dõi
            const followeeId = userMap[item.followee]; // Tìm ID người được theo dõi
            console.log('followerId', followerId, 'followeeId', followeeId);

            // Validation:
            // - Cả 2 user phải tồn tại trong DB
            // - Không cho phép tự follow chính mình (followerId !== followeeId)
            if (followerId && followeeId && followerId !== followeeId) {
                followsToInsert.push({
                    followerId: followerId,
                    followeeId: followeeId
                });
            }
        }

        // 4. Insert vào DB
        if (followsToInsert.length > 0) {
            // ignoreDuplicates: true giúp bỏ qua nếu cặp (follower, followee) đã tồn tại
            // (Dựa trên primary key hoặc unique constraint trong model)
            await FollowUser.bulkCreate(followsToInsert, { ignoreDuplicates: true });
            console.log(`✅ Finish insert FollowUser: ${followsToInsert.length} records.`);
        } else {
            console.log('Pass insert FollowUser (No valid data found).');
        }

    } catch (error) {
        console.log('Error insert FollowUser:', error);
    }
};

/**
 * --- SEED DATA CHO FOLLOW ARTIST ---
 * Mapping từ username -> user ID
 * Mapping từ spotifyId -> artist ID (để đảm bảo chính xác)
 */
const seedDataFollowArtist = async () => {
    try {
        console.log('Start insert FollowArtist...');

        // 1. Lấy tất cả User để tạo map (username -> id)
        const users = await User.findAll({
            attributes: ['id', 'username']
        });
        const userMap = users.reduce((map, user) => {
            map[user.username] = user.id;
            return map;
        }, {});

        // 2. Lấy tất cả Artist để tạo map (spotifyId -> id)
        // Việc này giúp tránh lỗi nếu ID trong DB khác với ID trong file JSON (do auto-increment)
        const artists = await Artist.findAll({
            attributes: ['id', 'spotifyId']
        });
        const artistMap = artists.reduce((map, artist) => {
            map[artist.spotifyId] = artist.id;
            return map;
        }, {});

        const followsToInsert = [];
        for (const item of followArtistData) {
            const userId = userMap[item.follower]; // Tìm ID người dùng (follower)

            // Tìm ID nghệ sĩ: Ưu tiên tìm theo spotifyId cho chính xác, 
            // nếu không thấy thì mới dùng artistId từ json làm fallback
            const artistId = artistMap[item.artistSpotifyId] || item.artistId;
            console.log('User:', item.follower, '->', userId, '| Artist:', item.artistSpotifyId, '->', artistId);

            // Validation: Cả User và Artist phải tồn tại trong DB thực tế
            if (userId && artistId) {
                followsToInsert.push({
                    followerId: userId, // Tên trường này phải khớp với Model FollowArtist của bạn (có thể là userId hoặc followerId)
                    artistId: artistId,
                    artistSpotifyId: item.artistSpotifyId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // 4. Insert vào DB
        if (followsToInsert.length > 0) {
            await FollowArtist.bulkCreate(followsToInsert, { ignoreDuplicates: true });
            console.log(`✅ Finish insert FollowArtist: ${followsToInsert.length} records.`);
        } else {
            console.log('Pass insert FollowArtist (No valid data found).');
        }

    } catch (error) {
        console.log('Error insert FollowArtist:', error);
    }
};

const seedDataSearchHistory = async () => {
    try {
        console.log('Start inserting SearchHistory...');

        // 1. Lấy tất cả User để tạo map (username -> id)
        // Việc này giúp liên kết username trong JSON với userId thực tế trong DB
        const users = await User.findAll({
            attributes: ['id', 'username']
        });
        const userMap = users.reduce((map, user) => {
            map[user.username] = user.id;
            return map;
        }, {});
        // 

        const historiesToInsert = [];

        // Lặp qua dữ liệu JSON
        for (const item of searchHistoryData) {
            const userId = userMap[item.username]; // Tìm ID người dùng (userId) qua username

            // Validation: User phải tồn tại trong DB thực tế
            if (userId) {
                // Tạo đối tượng để chèn
                historiesToInsert.push({
                    userId: userId, // Tên trường này phải khớp với Model SearchHistory của bạn
                    query: item.query,
                    searchedAt: item.searchedAt,
                    createdAt: item.createdAt || new Date(), // Sử dụng createdAt từ JSON hoặc new Date()
                    updatedAt: item.updatedAt || new Date()  // Sử dụng updatedAt từ JSON hoặc new Date()
                });
            } else {
                console.log(`⚠️ Skip search history for unknown user: ${item.username}`);
            }
        }

        // 2. Insert vào DB
        if (historiesToInsert.length > 0) {
            // Sử dụng bulkCreate để chèn hàng loạt.
            // Có thể thêm { ignoreDuplicates: true } nếu bạn có unique index và muốn bỏ qua các bản ghi trùng lặp.
            await SearchHistory.bulkCreate(historiesToInsert);
            console.log(`✅ Finish inserting SearchHistory: ${historiesToInsert.length} records.`);
        } else {
            console.log('Pass inserting SearchHistory (No valid data found).');
        }

    } catch (error) {
        console.error('Error inserting SearchHistory:', error);
    }
};

const seedDataListeningHistory = async () => {
    try {
        console.log('Start inserting ListeningHistory...');

        // 1. Lấy tất cả User để tạo map (username -> id)
        const users = await User.findAll({
            attributes: ['id', 'username']
        });
        const userMap = users.reduce((map, user) => {
            map[user.username] = user.id;
            return map;
        }, {});

        const historiesToInsert = [];

        // Lặp qua dữ liệu JSON và chuẩn bị dữ liệu chèn
        for (const item of listeningHistoryData) {
            const userId = userMap[item.username]; // Tìm ID người dùng (userId) qua username

            // Validation: User phải tồn tại trong DB thực tế
            if (userId) {
                // Tạo đối tượng để chèn
                historiesToInsert.push({
                    userId: userId,
                    itemId: item.itemId, // ID nội bộ của item (track, playlist, album...)
                    itemSpotifyId: item.itemSpotifyId, // ID Spotify để đảm bảo tính duy nhất
                    itemType: item.itemType, // Loại nội dung (track, playlist, album)
                    durationListened: item.durationListened,
                    playCount: item.playCount,
                    createdAt: item.createdAt || new Date(),
                    updatedAt: item.updatedAt || new Date()
                });
            } else {
                console.log(`⚠️ Skip listening history for unknown user: ${item.username}`);
            }
        }

        // 2. Insert vào DB
        if (historiesToInsert.length > 0) {
            // Sử dụng bulkCreate để chèn hàng loạt.
            // Do Model có unique index trên ['user_id', 'item_spotify_id'], ta có thể thêm { ignoreDuplicates: true }
            // để tránh lỗi nếu chạy lại seed data.
            await ListeningHistory.bulkCreate(historiesToInsert, { ignoreDuplicates: true });
            console.log(`✅ Finish inserting ListeningHistory: ${historiesToInsert.length} records.`);
        } else {
            console.log('Pass inserting ListeningHistory (No valid data found).');
        }

    } catch (error) {
        console.error('Error inserting ListeningHistory:', error);
    }
};

const seedDataFavoriteItem = async () => {
    try {
        console.log('Start inserting FavoriteItem...');

        // 1. Lấy tất cả User để tạo map (username -> id)
        const users = await User.findAll({
            attributes: ['id', 'username']
        });
        const userMap = users.reduce((map, user) => {
            map[user.username] = user.id;
            return map;
        }, {});

        const itemsToInsert = [];

        // Lặp qua dữ liệu JSON và chuẩn bị dữ liệu chèn
        for (const item of favoriteItemData) {
            const userId = userMap[item.username]; // Tìm ID người dùng (userId) qua username

            // Validation: User phải tồn tại trong DB thực tế
            if (userId) {
                // Tạo đối tượng để chèn
                itemsToInsert.push({
                    userId: userId,
                    itemId: item.itemId, // ID nội bộ của item
                    itemSpotifyId: item.itemSpotifyId, // ID Spotify (có thể là null)
                    itemType: item.itemType, // Loại nội dung (playlist, track, album, v.v.)
                    createdAt: item.createdAt || new Date(),
                    updatedAt: item.updatedAt || new Date()
                });
            } else {
                console.log(`⚠️ Skip favorite item for unknown user: ${item.username}`);
            }
        }

        // 2. Insert vào DB
        if (itemsToInsert.length > 0) {
            // Sử dụng bulkCreate để chèn hàng loạt.
            // Sử dụng { ignoreDuplicates: true } để tránh lỗi nếu có bản ghi trùng lặp 
            // (dù index của bạn là trên ['id', 'user_id'], nhưng việc này là thực hành tốt cho seed data).
            await FavoriteItem.bulkCreate(itemsToInsert, { ignoreDuplicates: true });
            console.log(`✅ Finish inserting FavoriteItem: ${itemsToInsert.length} records.`);
        } else {
            console.log('Pass inserting FavoriteItem (No valid data found).');
        }

    } catch (error) {
        console.error('Error inserting FavoriteItem:', error);
    }
};

const useSeeder = async () => {
    // await seedDataRole();
    // await seedDataUser();

    // await seedDataGenres();
    // await seedDataArtists();
    // await seedDataArtistGenres(); /* Bảng trung gian */

    // await seedDataAlbum();
    // await seedDataArtistAlbums(); /* Bảng trung gian */

    // /** còn album track - playlist - playlist tracks */
    // await seedDataTrack();
    // await seedDataArtistTracks(); /* Bảng trung gian */
    // await seedDataFollowUser();
    // await seedDataFollowArtist();

    // await seedDataPlaylist();
    // await seedDataSearchHistory();

    // await seedDataPost();
    // await seedDataLike();
    // await seedDataComment();
    // await seedDataPostReport();
    // await seedDataConversation();
    // await seedDataConversationMember();
    // await seedDataMessage();

    // await seedDataFavoriteItem();
    // await seedDataListeningHistory();

}

/**
 * Phương thức để seeding dữ liệu vào database
 */
async function seedDatabase() {
    try {

        await useSeeder();
        console.log('✅ Finish seeding database.');

    } catch (error) {
        console.error('Lỗi khi chèn dữ liệu (Seeding):', error);
    }
}

module.exports = seedDatabase;