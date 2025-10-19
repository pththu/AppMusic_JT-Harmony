const sequelize = require('../configs/database')

// Import all models
const User = require('./User');
const Notification = require('./notification');
const Post = require('./post');
const Comment = require('./comment');
const Follow = require('./follows');
const StatDailyPlays = require('./stat_daily_plays');
const SyncStatus = require('./sync_status');

const Role = require('./role');
const Genres = require('./genres');
const Artist = require('./artist');
const Album = require('./album');
const Track = require('./track');
const Playlist = require('./playlist');

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

// User - Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

// User - Follow
User.hasMany(Follow, { foreignKey: 'followerId' });
Follow.belongsTo(User, { foreignKey: 'followerId' });

User.hasMany(Follow, { foreignKey: 'userFolloweeId' });
Follow.belongsTo(User, { foreignKey: 'userFolloweeId' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Post - Comment
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// Comment - Comment
Comment.hasMany(Comment, { foreignKey: 'parentId' });
Comment.belongsTo(Comment, { foreignKey: 'parentId' });

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Genres.belongsToMany(Artist, {
    through: 'artist_genres',
    foreignKey: 'genre_id',
    otherKey: 'artist_id',
    as: 'artists'
});
Artist.belongsToMany(Genres, {
    through: 'artist_genres',
    foreignKey: 'artist_id',
    otherKey: 'genre_id',
    as: 'genres'
})

Album.belongsToMany(Artist, {
    through: 'artist_albums',
    foreignKey: 'album_id',
    otherKey: 'artist_id',
    as: 'artists'
});
Artist.belongsToMany(Album, {
    through: 'artist_albums',
    foreignKey: 'artist_id',
    otherKey: 'album_id',
    as: 'albums'
});

Track.belongsToMany(Artist, {
    through: 'artist_tracks',
    foreignKey: 'track_id',
    otherKey: 'artist_id',
    as: 'artists'
});
Artist.belongsToMany(Track, {
    through: 'artist_tracks',
    foreignKey: 'artist_id',
    otherKey: 'track_id',
    as: 'tracks'
});

Album.hasMany(Track, { foreignKey: 'albumId' });
Track.belongsTo(Album, { foreignKey: 'albumId' });

Playlist.belongsToMany(Track, {
    through: 'playlist_tracks',
    foreignKey: 'playlist_id',
    otherKey: 'track_id',
    as: 'tracks'
});

Track.belongsToMany(Playlist, {
    through: 'playlist_tracks',
    foreignKey: 'track_id',
    otherKey: 'playlist_id',
    as: 'playlists'
});

// ================= Export ================= //
module.exports = {
    sequelize,
    Track,
    Playlist,
    Artist,
    Album,
    User,
    Comment,
    Follow,
    Genres,
    Notification,
    Role,
    Post,
    StatDailyPlays,
    SyncStatus,
}