const sequelize = require('../configs/database')

// Import all models
const User = require('./User');
const Notification = require('./notification');
const Post = require('./post');
const Comment = require('./comment');
const StatDailyPlays = require('./stat_daily_plays');
const SyncStatus = require('./sync_status');
const FollowArtist = require('./follow_artist');
const FollowUser = require('./follow_user');

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

// User - Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'User'
});

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

User.hasMany(ListeningHistory, { foreignKey: 'userId' });
ListeningHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FollowArtist, { foreignKey: 'followerId' });
FollowArtist.belongsTo(User, { foreignKey: 'followerId' });

Artist.hasMany(FollowArtist, { foreignKey: 'artistId' });
FollowArtist.belongsTo(Artist, { foreignKey: 'artistId' });

User.hasMany(FollowUser, { foreignKey: 'followerId' });
FollowUser.belongsTo(User, { foreignKey: 'followerId' });

User.hasMany(FollowUser, { foreignKey: 'followeeId' });
FollowUser.belongsTo(User, { foreignKey: 'followeeId' });

// User ↔ Playlist (1-N)
User.hasMany(Playlist, { foreignKey: 'userId' });
Playlist.belongsTo(User, { foreignKey: 'userId' });

Track.hasMany(PlaylistTrack, { foreignKey: 'trackId' });
PlaylistTrack.belongsTo(Track, { foreignKey: 'trackId' });

Playlist.hasMany(PlaylistTrack, { foreignKey: 'playlistId' });
PlaylistTrack.belongsTo(Playlist, { foreignKey: 'playlistId' });

// ================= Export ================= //
module.exports = {
    sequelize,
    Track,
    Playlist,
    Artist,
    Album,
    User,
    Comment,
    FollowArtist,
    FollowUser,
    Genres,
    Notification,
    Role,
    Post,
    StatDailyPlays,
    SyncStatus,
}