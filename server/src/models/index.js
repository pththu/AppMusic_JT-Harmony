const sequelize = require('../configs/database')

// Import all models
const User = require('./User');
const Notification = require('./notification');
const Post = require('./post');
const Comment = require('./comment');
const StatDailyPlays = require('./stat_daily_plays');
const SyncStatus = require('./sync_status');
const Recommendation = require('./recommendation');
const CommentLike = require('./commentLike');
const Like = require('./like');
const Conversation = require('./conversation');
const ConversationMember = require('./conversationMember');
const Message = require('./message');
const FollowArtist = require('./follow_artist');
const FollowUser = require('./follow_user');
const PostReport = require('./postReport');

const Role = require('./role');
const Genres = require('./genres');
const Artist = require('./artist');
const Album = require('./album');
const Track = require('./track');
const Playlist = require('./playlist');
const PlaylistTrack = require('./playlist_track');
const ListeningHistory = require('./listening_history');

// ================= Associations ================= //
// // Album ↔ Track (N-N) thông qua AlbumTrack

// User - Sync status
User.hasMany(SyncStatus, { foreignKey: 'userId' });
SyncStatus.belongsTo(User, { foreignKey: 'userId' });

// User - Post
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

// User - PostReport
User.hasMany(PostReport, { foreignKey: 'reporterId' });
PostReport.belongsTo(User, { foreignKey: 'reporterId', as: 'Reporter' });

// Post - PostReport
Post.hasMany(PostReport, { foreignKey: 'postId' });
PostReport.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

// User - Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

// User - Notification
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User - Recommendation
User.hasMany(Recommendation, { foreignKey: 'userId' });
Recommendation.belongsTo(User, { foreignKey: 'userId' });

// Quan hệ Người dùng - Lượt thích Bình luận (User <-> CommentLike)
// Điều này cho phép bạn biết một người dùng đã thích những comment nào
User.hasMany(CommentLike, { foreignKey: 'userId', as: 'CommentLikes' });
CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Post - Comment
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Comment - Comment
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'Replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'Parent' });

// Quan hệ Bình luận - Lượt thích (Comment <-> CommentLike)
Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'Likes' });
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'Comment' });

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Genres.belongsToMany(Artist, {
    through: 'artist_genres',
    foreignKey: 'genre_id',
    otherKey: 'artist_id',
    as: 'artists',
    onDelete: 'CASCADE',
    hooks: true
});
Artist.belongsToMany(Genres, {
    through: 'artist_genres',
    foreignKey: 'artist_id',
    otherKey: 'genre_id',
    as: 'genres',
    onDelete: 'CASCADE',
    hooks: true
})

Album.belongsToMany(Artist, {
    through: 'artist_albums',
    foreignKey: 'album_id',
    otherKey: 'artist_id',
    as: 'artists',
    onDelete: 'CASCADE',
    hooks: true
});
Artist.belongsToMany(Album, {
    through: 'artist_albums',
    foreignKey: 'artist_id',
    otherKey: 'album_id',
    as: 'albums',
    onDelete: 'CASCADE',
    hooks: true
});

Track.belongsToMany(Artist, {
    through: 'artist_tracks',
    foreignKey: 'track_id',
    otherKey: 'artist_id',
    as: 'artists',
    onDelete: 'CASCADE',
    hooks: true
});
Artist.belongsToMany(Track, {
    through: 'artist_tracks',
    foreignKey: 'artist_id',
    otherKey: 'track_id',
    as: 'tracks',
    onDelete: 'CASCADE',
    hooks: true
});

Album.hasMany(Track, { foreignKey: 'albumId', onDelete: 'CASCADE', hooks: true });
Track.belongsTo(Album, { foreignKey: 'albumId', onDelete: 'CASCADE', hooks: true });

User.hasMany(ListeningHistory, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
ListeningHistory.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });

User.hasMany(FollowArtist, { foreignKey: 'followerId', onDelete: 'CASCADE', hooks: true });
FollowArtist.belongsTo(User, { foreignKey: 'followerId', onDelete: 'CASCADE', hooks: true });

Artist.hasMany(FollowArtist, { foreignKey: 'artistId', onDelete: 'CASCADE', hooks: true });
FollowArtist.belongsTo(Artist, { foreignKey: 'artistId', onDelete: 'CASCADE', hooks: true });

User.hasMany(FollowUser, { foreignKey: 'followerId', onDelete: 'CASCADE', hooks: true });
FollowUser.belongsTo(User, { foreignKey: 'followerId', onDelete: 'CASCADE', hooks: true });

User.hasMany(FollowUser, { foreignKey: 'followeeId', onDelete: 'CASCADE', hooks: true });
FollowUser.belongsTo(User, { foreignKey: 'followeeId', onDelete: 'CASCADE', hooks: true });

// User ↔ Playlist (1-N)
User.hasMany(Playlist, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Playlist.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });

Track.hasMany(PlaylistTrack, { foreignKey: 'trackId', onDelete: 'CASCADE', hooks: true });
PlaylistTrack.belongsTo(Track, { foreignKey: 'trackId', onDelete: 'CASCADE', hooks: true });

Playlist.hasMany(PlaylistTrack, { foreignKey: 'playlistId', onDelete: 'CASCADE', hooks: true });
PlaylistTrack.belongsTo(Playlist, { foreignKey: 'playlistId', onDelete: 'CASCADE', hooks: true });

// Track.belongsToMany(Playlist, {
//     through: PlaylistTrack,
//     foreignKey: 'trackId',
//     otherKey: 'playlistId',
//     as: 'playlists',
//     onDelete: 'CASCADE',
//     hooks: true
// });

// Playlist.belongsToMany(Track, {
//     through: PlaylistTrack,
//     foreignKey: 'playlistId',
//     otherKey: 'trackId',
//     as: 'tracks',
//     onDelete: 'CASCADE',
//     hooks: true
// });

// Like - User & Post
Like.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'Post' });

// Conversation - Message (1-N)
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'Messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'Conversation' });

// Conversation - Message (Latest Message - 1-1)
// Dùng để lấy tin nhắn cuối cùng trong danh sách cuộc trò chuyện
Conversation.belongsTo(Message, { foreignKey: 'lastMessageId', as: 'LastMessage' });
// Message.hasOne(Conversation, { foreignKey: 'lastMessageId', as: 'ConversationOfLastMessage' }); // Có thể bỏ qua

// Conversation - User (N-N) thông qua ConversationMember
Conversation.belongsToMany(User, {
    through: ConversationMember,
    foreignKey: 'conversationId',
    otherKey: 'userId',
    as: 'Participants' // User tham gia cuộc trò chuyện
});
User.belongsToMany(Conversation, {
    through: ConversationMember,
    foreignKey: 'userId',
    otherKey: 'conversationId',
    as: 'Conversations' // Danh sách cuộc trò chuyện của User
});

// Conversation - Creator (1-1)
Conversation.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

// Message - Sender (1-1)
Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });

// Model trung gian ConversationMember - User & Conversation (1-N)
ConversationMember.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'Conversation' });
ConversationMember.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Conversation.hasMany(ConversationMember, { foreignKey: 'conversationId', as: 'Members' });
User.hasMany(ConversationMember, { foreignKey: 'userId', as: 'Memberships' });

// ================= Export ================= //
module.exports = {
    sequelize,
    Track,
    Playlist,
    PlaylistTrack,
    Artist,
    Album,
    User,
    Comment,
    FollowArtist,
    FollowUser,
    PostReport,
    Genres,
    Notification,
    Role,
    Post,
    StatDailyPlays,
    SyncStatus,
    CommentLike,
    Like,
    Conversation,
    ConversationMember,
    Message,
}