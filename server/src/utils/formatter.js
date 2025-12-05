const formatUser = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    gender: user.gender === true ? 'male' : 'female',
    status: user.status,
    roleId: user.roleId,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

const formatTrack = (track, artist, album, videoId) => {
  return {
    id: track?.tempId || (track?.spotifyId && track.id ? track.id : null),
    spotifyId: track?.spotifyId || (!track?.spotifyId ? track.id : null) || null,
    videoId: videoId || null,
    name: track?.name || null,
    artists: artist || [
      ...track?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist?.name || null,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null
      })) || [],
    ],
    album: {
      spotifyId: track.album?.id || album?.spotifyId || null,
      name: track.album?.name || album?.name || null,
      imageUrl: track.album?.images?.[0]?.url || album?.imageUrl || null,
    },
    lyrics: track?.lyrics || null,
    duration: track?.duration_ms || track?.duration || 0,
    explicit: track?.explicit,
    trackNumber: track?.track_number || track?.trackNumber || null,
    discNumber: track?.disc_number || track?.discNumber || null,
    imageUrl: track?.album?.images?.[0]?.url || album?.imageUrl || null,
    playCount: track?.playCount || 0,
    shareCount: track?.shareCount || 0,
  }
};

const formatPlaylist = (playlist, owner) => {
  return {
    id: owner?.id ? playlist?.id : (!playlist?.spotifyId ? null : playlist?.id),
    spotifyId: owner?.id ? null : (!playlist?.spotifyId ? playlist?.id : playlist?.spotifyId),
    name: playlist.name,
    owner: {
      id: owner?.id || null,
      spotifyId: owner?.spotifyId || (!owner?.spotifyId ? playlist?.owner?.id : null) || null,
      name: playlist?.owner?.display_name || owner?.fullName || null,
    },
    description: playlist.description,
    imageUrl: playlist?.images?.[0]?.url || playlist?.imageUrl || null,
    totalTracks: playlist?.tracks?.total || playlist?.totalTracks || 0,
    isPublic: playlist?.public || playlist?.isPublic || false,
    type: playlist.type,
  }
}

const formatAlbum = (album, artists) => {
  return {
    id: album?.spotifyId && album.id ? album.id : null,
    spotifyId: album?.spotifyId || (!album?.spotifyId ? album.id : null) || null,
    name: album.name,
    artists: [
      ...album?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist.name,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null,
      })) || artists || [],
    ],
    imageUrl: album?.images?.[0]?.url || album?.imageUrl || null,
    releaseDate: album?.release_date ? new Date(album.release_date).toISOString() : null,
    totalTracks: album?.total_tracks || album?.totalTracks || 0,
    type: album.type,
  }
}

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

const formatHisoryListening = (history) => {
  return {
    id: history.id,
    userId: history.userId,
    itemId: history.itemId === 'null' ? null : history.itemId,
    itemSpotifyId: history.itemSpotifyId === 'null' ? null : history.itemSpotifyId,
    itemType: history.itemType,
    durationListened: history.durationListened,
    playCount: history.playCount,
    createdAt: history.createdAt,
    updatedAt: history.updatedAt,
    user: history.User ? formatUser(history.User) : null 
  }
}

export {
  formatUser,
  formatTrack,
  formatPlaylist,
  formatAlbum,
  formatArtist,
  formatHisoryListening,
}