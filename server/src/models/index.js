const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

// Import all models
const User = require('./user');
const Role = require('./roles');
const Artist = require('./artist');
const Song = require('./song');
const Album = require('./album');
const Playlist = require('./playlist');
const Notification = require('./notification');
const Post = require('./post');
const Comment = require('./comment');
const Genre = require('./genres');
const Follow = require('./follows');
const PlaylistSong = require('./playlist_song');
const FavoriteSong = require('./favorite_song');
const ListeningHistory = require('./listening_history');
const DownloadSong = require('./download_song');
const SearchHistory = require('./search_history');
const StatDailyPlays = require('./stat_daily_plays');
const SyncStatus = require('./sync_status');
const Recommendation = require('./recommendation');
const AlbumSong = require('./album_songs');
const CommentLike = require('./commentLike');
const Like = require('./like');
const Conversation = require('./conversation');
const ConversationMember = require('./conversationMember');
const Message = require('./message');

// ================= Associations ================= //
// // Album ↔ Song (N-N) thông qua AlbumSong
Album.belongsToMany(Song, {
    through: AlbumSong,
    foreignKey: 'albumId',
    otherKey: 'songId',
    as: 'songs'
})
Song.belongsToMany(Album, {
    through: AlbumSong,
    foreignKey: 'songId',
    otherKey: 'albumId',
    as: 'albums'
})

// User - role
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// User - Sync status
User.hasMany(SyncStatus, { foreignKey: 'userId' });
SyncStatus.belongsTo(User, { foreignKey: 'userId' });

// User - Playlists
User.hasMany(Playlist, { foreignKey: 'userId' });
Playlist.belongsTo(User, { foreignKey: 'userId' });

// User - Favorite Songs
User.hasMany(FavoriteSong, { foreignKey: 'userId' });
FavoriteSong.belongsTo(User, { foreignKey: 'userId' });

// User - Search History
User.hasMany(SearchHistory, { foreignKey: 'userId' });
SearchHistory.belongsTo(User, { foreignKey: 'userId' });

// User - Listening History
User.hasMany(ListeningHistory, { foreignKey: 'userId' });
ListeningHistory.belongsTo(User, { foreignKey: 'userId' });

// User - Post
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

// User - Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

// User - Download
User.hasMany(DownloadSong, { foreignKey: 'userId' });
DownloadSong.belongsTo(User, { foreignKey: 'userId' });

// User - Follow
// 1. QUAN HỆ: Người theo dõi (Follower)
// Follow.followerId là ID của người đang theo dõi
User.hasMany(Follow, { foreignKey: 'followerId', as: 'FollowersFromUser' }); // Thêm alias User.hasMany để tránh xung đột
Follow.belongsTo(User, {
    foreignKey: 'followerId',
    as: 'Follower' // ✅ Cần alias này cho includes trong getUserFollowers
});

// 2. QUAN HỆ: Người được theo dõi (Followee)
// Follow.userFolloweeId là ID của người được theo dõi
User.hasMany(Follow, { foreignKey: 'userFolloweeId', as: 'FollowingByOthers' }); // Thêm alias User.hasMany để tránh xung đột
Follow.belongsTo(User, {
    foreignKey: 'userFolloweeId',
    as: 'Followee' // ✅ Cần alias này cho includes trong getUserFollowing
});

// User - Notification
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User - Recommendation
User.hasMany(Recommendation, { foreignKey: 'userId' });
Recommendation.belongsTo(User, { foreignKey: 'userId' });

// User - Favorite song
User.hasMany(FavoriteSong, { foreignKey: 'userId' });
FavoriteSong.belongsTo(User, { foreignKey: 'userId' });

// Quan hệ Người dùng - Lượt thích Bình luận (User <-> CommentLike)
// Điều này cho phép bạn biết một người dùng đã thích những comment nào
User.hasMany(CommentLike, { foreignKey: 'userId', as: 'CommentLikes' });
CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Song - Playlist
Song.belongsToMany(Playlist, {
    through: PlaylistSong,
    foreignKey: 'songId',
    otherKey: 'playlistId'
});
Playlist.belongsToMany(Song, {
    through: PlaylistSong,
    foreignKey: 'playlistId',
    otherKey: 'songId'
});

// Song - Album
Song.belongsTo(Album, { foreignKey: 'albumId' });
Album.hasMany(Song, { foreignKey: 'albumId' });

// Song - Recommendation
Song.hasMany(Recommendation, { foreignKey: 'songId' });
Recommendation.belongsTo(Song, { foreignKey: 'songId' });

// Song - Artist
Song.belongsToMany(Artist, {
    through: 'songs_artists',
    foreignKey: 'songId',
    otherKey: 'artistId'
});
Artist.belongsToMany(Song, {
    through: 'songs_artists',
    foreignKey: 'artistId',
    otherKey: 'songId'
});

// Song - Genres
Song.belongsToMany(Genre, {
    through: 'songs_genres',
    foreignKey: 'songId',
    otherKey: 'genreId'
});
Genre.belongsToMany(Song, {
    through: 'songs_genres',
    foreignKey: 'genreId',
    otherKey: 'songId'
});

// Song - Favorite Song
Song.hasMany(FavoriteSong, { foreignKey: 'songId' });
FavoriteSong.belongsTo(Song, { foreignKey: 'songId' });

// Download Song - Song
DownloadSong.belongsTo(Song, { foreignKey: 'songId' });
Song.hasMany(DownloadSong, { foreignKey: 'songId' });

// StatDailyPlay = Song
StatDailyPlays.belongsTo(Song, { foreignKey: 'songId' });
Song.hasMany(StatDailyPlays, { foreignKey: 'songId' });

// Post - Comment
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Quan hệ Bài đăng - Bài hát (Post <-> Song)
Post.belongsTo(Song, { foreignKey: 'songId', as: 'Song' });
Song.hasMany(Post, { foreignKey: 'songId', as: 'Posts' });

// Comment - Comment
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'Replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'Parent' });

// Quan hệ Bình luận - Lượt thích (Comment <-> CommentLike)
Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'Likes' });
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'Comment' });

// Artist - Follow
Artist.hasMany(Follow, { foreignKey: 'artistFolloweeId' });
Follow.belongsTo(Artist, { foreignKey: 'artistFolloweeId' });

// Album - Artist
Album.belongsTo(Artist, { foreignKey: 'artistId' });
Artist.hasMany(Album, { foreignKey: 'artistId' });

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
    Song,
    Playlist,
    PlaylistSong,
    Artist,
    Album,
    User,
    Comment,
    FavoriteSong,
    Follow,
    Genre,
    ListeningHistory,
    Notification,
    Recommendation,
    Role,
    SearchHistory,
    Post,
    StatDailyPlays,
    SyncStatus,
    DownloadSong,
    AlbumSong,
    CommentLike,
    Like,
    Conversation,
    ConversationMember,
    Message,
}