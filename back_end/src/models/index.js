const sequelize = require('./init')

const Song = require('./song')
const Playlist = require('./playlist')
const PlaylistSong = require('./playlist_song')
const Artist = require('./artist')
const Album = require('./album')
const User = require('./user')

// ================= Associations ================= //

// Artist ↔ Album (1-N)
Artist.hasMany(Album, { foreignKey: 'artistId', as: 'albums' })
Album.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' })

// Artist ↔ Song (1-N)
Artist.hasMany(Song, { foreignKey: 'artistId', as: 'songs' })
Song.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' })

// Album ↔ Song (1-N)
Album.hasMany(Song, { foreignKey: 'albumId', as: 'songs' })
Song.belongsTo(Album, { foreignKey: 'albumId', as: 'album' })

// Playlist ↔ Song (N-N) thông qua PlaylistSong
Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: 'playlistId',
  otherKey: 'songId',
  as: 'songs'
})
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: 'songId',
  otherKey: 'playlistId',
  as: 'playlists'
})

// User ↔ Playlist (1-N)
User.hasMany(Playlist, { foreignKey: 'userId', as: 'playlists' })
Playlist.belongsTo(User, { foreignKey: 'userId', as: 'owner' })

// ================= Export ================= //
module.exports = {
  sequelize,
  models: {
    Song,
    Playlist,
    PlaylistSong,
    Artist,
    Album,
    User
  }
}
