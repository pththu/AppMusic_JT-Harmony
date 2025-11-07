const { FavoriteItem, User, Track, Album, Artist, Playlist } = require('../models');
const spotify = require('../configs/spotify');


const formatTrack = (track, artist, album, videoId) => {
  return {
    id: track?.tempId || (track?.spotifyId && track.id ? track.id : null),
    spotifyId: track?.spotifyId || (!track?.spotifyId ? track.id : null) || null,
    videoId: videoId || null,
    name: track?.name || null,
    artists: [
      ...track?.artists?.map(artist => ({
        spotifyId: artist?.spotifyId || (!artist?.spotifyId ? artist.id : null) || null,
        name: artist?.name || null,
        imageUrl: artist?.images?.[0]?.uri || artist?.imageUrl || null
      })) || artist || [],
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


const GetAll = async (req, res) => {
  try {
    const favorites = await FavoriteItem.findAll({
      include: [{ model: User, as: 'User' }]
    });
    console.log(favorites)
    res.status(200).json({ message: 'Favorites retrieved successfully', data: favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get by pk
const GetByPk = async (req, res) => {
  try {
    const { id } = req.params;
    const favorite = await FavoriteItem.findByPk(id, {
      include: [{ model: User, as: 'User' }]
    });
    if (!favorite) {
      return res.status(404).json({ message: 'Không tìm thấy mục yêu thích' });
    }
    res.status(200).json({ message: 'Favorite retrieved successfully', data: favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get by user id
const GetByUserId = async (req, res) => {
  try {
    const favorites = await FavoriteItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'User' }]
    });
    if (!favorites || favorites.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy mục yêu thích của người dùng này' });
    }
    res.status(200).json({ message: 'Favorites retrieved successfully', data: favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const GetItemsGroupedByType = async (req, res) => {
  const userId = req.user.id;

  try {
    // === BƯỚC 1: Lấy các bản ghi yêu thích thô ===
    const favorites = await FavoriteItem.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      limit: 50
    });

    if (favorites.length === 0) {
      return res.status(200).json({ message: 'Danh sách yêu thích trống', data: [] });
    }

    const itemIdsByType = { track: [], album: [], playlist: [] };

    for (const favorite of favorites) {
      const itemType = favorite.itemType;
      if (itemType) {
        itemIdsByType[itemType].push({
          id: favorite.id,
          itemId: favorite.itemId,
          itemSpotifyId: favorite.itemSpotifyId
        });
      }
    }

    const dataFormated = { tracks: [], albums: [], playlists: [] };

    if (itemIdsByType.track) {
      for (const item of itemIdsByType.track) {
        const spotifyId = item?.itemSpotifyId;
        const itemId = item?.itemId;
        const uniqueFavoriteId = item?.id;

        let album = null;
        let artist = [];
        let track = null;
        if (spotifyId) {
          track = await Track.findOne({
            where: { spotifyId },
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          const idTemp = track?.id || null;

          if (!track || !track.name) {
            track = await spotify.findTrackById(spotifyId);
            if (idTemp) {
              track.tempId = idTemp;
            }
          } else {
            album = track.Album;
            artist = [];
            for (const a of track.artists) {
              artist.push(a);
            }
          }
          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: uniqueFavoriteId
          };
          dataFormated.tracks.push(itemFormat);
        } else {
          track = await Track.findByPk(itemId, {
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          album = track.Album;
          artist = [];
          for (const a of track.artists) {
            artist.push(a);
          }

          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: uniqueFavoriteId
          };
          dataFormated.tracks.push(itemFormat);
        }
      }
    }

    if (itemIdsByType.album) {
      for (const item of itemIdsByType.album) {
        const spotifyId = item?.itemSpotifyId;
        const itemId = item?.itemId;
        const uniqueFavoriteId = item?.id;

        if (spotifyId) {
          const spotifyId = item.itemSpotifyId;
          const uniqueFavoriteId = item.id;

          const album = await spotify.findAlbumById(spotifyId);
          if (album) {
            const itemFormat = formatAlbum(album, null);
            itemFormat.favoriteItem = {
              id: uniqueFavoriteId
            };
            dataFormated.albums.push(itemFormat);
          }
        } else {
          const album = await Album.findByPk(itemId, {
            include: [
              { model: Artist, as: 'artists' }
            ]
          });

          if (album) {
            const itemFormat = formatAlbum(album, null);
            itemFormat.favoriteItem = {
              id: uniqueFavoriteId
            };
            dataFormated.albums.push(itemFormat);
          }
        }
      }
    }

    if (itemIdsByType.playlist) {
      for (const item of itemIdsByType.playlist) {
        const spotifyId = item?.itemSpotifyId;
        const itemId = item?.itemId;
        const uniqueFavoriteId = item?.id;
        if (spotifyId) {
          const playlist = await spotify.findPlaylistById(spotifyId);
          if (playlist) {
            const itemFormat = formatPlaylist(playlist, null);
            itemFormat.favoriteItem = {
              id: uniqueFavoriteId
            };
            dataFormated.playlists.push(itemFormat);
          }
        } else {
          const playlist = await Playlist.findByPk(itemId, { include: [{ model: User }] });
          if (playlist) {
            const itemFormat = formatPlaylist(playlist, playlist.User);
            itemFormat.favoriteItem = {
              id: uniqueFavoriteId
            };
            dataFormated.playlists.push(itemFormat);
          }
        }
      }
    }

    const trackMap = new Map(dataFormated.tracks.map(t => [t.favoriteItem.id, t]));
    const albumMap = new Map(dataFormated.albums.map(a => [a.favoriteItem.id, a]));
    const playlistMap = new Map(dataFormated.playlists.map(a => [a.favoriteItem.id, a]));

    const combinedHistory = favorites.map(favorites => {
      let itemDetail = null;
      const id = favorites.id;

      if (favorites.itemType === 'track') {
        itemDetail = trackMap.get(id);
      } else if (favorites.itemType === 'album') {
        itemDetail = albumMap.get(id);
      } else if (favorites.itemType === 'playlist') {
        itemDetail = playlistMap.get(id);
      }

      if (itemDetail) {
        return {
          ...favorites.toJSON(),
          item: itemDetail
        };
      }
      return null;
    }).filter(item => item !== null);

    return res.status(200).json({
      message: 'Danh sách yêu thích retrieved successfully',
      data: combinedHistory,
      success: true
    });

  } catch (error) {
    console.error("Error retrieving grouped history:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

const GetPlaylistFavorite = async (req, res) => {
  console.log(1111)
  try {
    const dataFormated = [];

    const favorites = await FavoriteItem.findAll({
      where: { userId: req.user.id, itemType: 'playlist' }
    });

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({ message: 'Không tìm thấy mục yêu thích của người dùng này', success: true, data: [] });
    }

    for (const favorite of favorites) {
      if (favorite?.itemSpotifyId) {
        const playlist = await spotify.findPlaylistById(favorite.itemSpotifyId);
        if (playlist) {
          const playlistFormat = formatPlaylist(playlist, null);
          dataFormated.push(playlistFormat);
        }
      } else if (favorite?.itemId) {
        const playlist = await Playlist.findByPk(favorite.itemId, {
          include: [{ model: User }]
        });
        if (playlist) {
          const playlistFormat = formatPlaylist(playlist, playlist.User);
          dataFormated.push(playlistFormat);
        }
      }
    }

    return res.status(200).json({
      message: 'Danh sách yêu thích retrieved successfully',
      success: true,
      data: dataFormated
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const CreateOne = async (req, res) => {
  try {
    const { itemType, itemId, itemSpotifyId } = req.body;
    const dataFormated = []
    let album = null;
    let track = null;
    let playlist = null;
    let artist = [];
    if (!itemType && (!itemId || !itemSpotifyId)) {
      console.log('thieu')
      return res.status(400).json({ message: 'Thiếu thông tin yêu thích' });
    }

    const favorite = await FavoriteItem.create({
      userId: req.user.id,
      itemType,
      itemId,
      itemSpotifyId
    });

    if (!favorite) {
      console.log('error')
      return res.status(500).json({ message: 'Thêm vào mục yêu thích thất bại' });
    }

    switch (itemType) {
      case 'track':
        console.log('track')
        artist = [];
        if (itemSpotifyId) {
          console.log('first')
          track = await Track.findOne({
            where: { spotifyId: itemSpotifyId },
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          console.log('no')
          const idTemp = track?.id || null;

          if (!track || !track.name) {
            console.log('ýe')
            track = await spotify.findTrackById(itemSpotifyId);
            if (idTemp) {
              track.tempId = idTemp;
            }
          } else {
            console.log('temp')
            album = track.Album;
            artist = [];
            for (const a of track.artists) {
              artist.push(a);
            }
          }
          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          console.log('tracks')
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        } else {
          track = await Track.findByPk(itemId, {
            include: [
              { model: Album },
              { model: Artist, as: 'artists' }
            ]
          });

          album = track.Album;
          artist = [];
          for (const a of track.artists) {
            artist.push(a);
          }

          const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      case 'album':
        const album = await spotify.findAlbumById(itemSpotifyId);
        if (album) {
          const itemFormat = formatAlbum(album, null);
          itemFormat.favoriteItem = {
            id: favorite.id
          };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      case 'playlist':
        playlist = await spotify.findPlaylistById(itemSpotifyId);
        if (playlist) {
          const itemFormat = formatPlaylist(playlist, null);
          itemFormat.favoriteItem = { id: favorite.id };
          dataFormated.push({
            ...favorite.toJSON(),
            item: itemFormat
          });
        }
        break;
      default:
        return res.status(400).json({ message: 'Loại mục yêu thích không hợp lệ' });
    }

    console.log('data format', dataFormated);

    return res.status(201).json({
      message: 'Favorite created successfully',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const DeleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await FavoriteItem.destroy({ where: { id } });
    console.log(row);
    return res.status(201).json({ message: 'Đã xóa khỏi mục yêu thích', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  GetAll,
  GetByPk,
  GetByUserId,
  GetItemsGroupedByType,
  GetPlaylistFavorite,
  CreateOne,
  DeleteOne,
};