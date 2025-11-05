// controllers/musicController.js
const { TOP_50_PLAYLIST_ID } = require('../configs/constants');
const spotify = require('../configs/spotify');
const youtube = require('../configs/youtube');
const { Playlist, Track, Album, Artist, PlaylistTrack, User, Genres } = require('../models');
const Op = require('sequelize').Op;

const formatTrack = (track, artist, album, videoId) => {
  return {
    id: track?.spotifyId && track.id ? track.id : null,
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


// Tìm kiếm playlist trên Spotify
const findSpotifyPlaylist = async (req, res) => {
  try {
    const { query } = req.query; // Lấy query từ URL, ví dụ: /spotify/playlists?query=lofi
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const data = await spotify.searchPlaylists(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search playlists' });
  }
};

// Lấy các bài hát hàng đầu của nghệ sĩ trên Spotify
const findArtistTopTracks = async (req, res) => {
  try {
    const { artistId } = req.params; // Lấy ID nghệ sĩ từ URL, ví dụ: /spotify/artists/06HL4z0CvFAxyc27GXpf02/top-tracks
    const data = await spotify.getArtistTopTracks(artistId);
    res.json(data.tracks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get artist top tracks' });
  }
};

// ví dụ: /youtube/search?song=Hello&artist=Adele
const findYoutubeVideo = async (req, res) => {
  try {
    const { song, artist } = req.body;
    if (!song || !artist) {
      return res.status(400).json({ error: 'Song and artist parameters are required' });
    }
    const data = await youtube.searchVideo(song, artist);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search on YouTube' });
  }
};

const findAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const data = await spotify.findAlbumById(albumId);
    return res.status(200).json({
      message: 'Album retrieval successful',
      data,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to find album by ID on Spotify' });
  }
}

const findPlaylistById = async (req, res) => {
  try {
    const { market } = req.body;
    console.log(market)
    if (!market || !TOP_50_PLAYLIST_ID[market]) {
      return res.status(400).json({ error: 'Invalid or missing market parameter' });
    }

    const playlistData = await spotify.findPlaylistById(TOP_50_PLAYLIST_ID[market]);
    return res.status(200).json({
      message: 'Playlist retrieval successful',
      data: playlistData,
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to find playlist by ID on Spotify' });
  }
};

///////////////////////////////////////////////////////////////
/**
 * Tìm kiếm bài hát trên Spotify với các tham số linh hoạt
 */

const buildSearchCondition = (param, key, queryObj, whereObj) => {
  if (!param) return;
  const values = Array.isArray(param) ? param : [param];

  // const orConditions = values.map(value => ({
  //   name: { [Op.iLike]: `%${value}%` }
  // }));

  const orConditions = values.map(value => (
    { [Op.iLike]: `%${value}%` }
  ));

  whereObj.name = orConditions.length > 1 ? { [Op.or]: orConditions } : orConditions[0];
  queryObj[key] = values.map(v => String(v).toLowerCase()).join(' OR ');
};

const searchTracks = async (req, res) => {
  try {
    const query = {};
    const whereTrack = {};
    const whereArtist = {};
    const whereAlbum = {};
    const whereGenre = {};

    const { artist, trackName, album, type, genre, limit } = req.body;

    if (!artist && !trackName && !album && !genre) {
      return res.status(400).json({ error: 'At least one search parameter (trackName, artist, album, or genre) is required' });
    }

    if (trackName) {
      query.track = trackName;
      whereTrack.name = { [Op.iLike]: `%${trackName}%` };
    };

    buildSearchCondition(album, 'album', query, whereAlbum);
    buildSearchCondition(artist, 'artist', query, whereArtist);
    buildSearchCondition(genre, 'genre', query, whereGenre);

    const dataFormated = [];
    let data = await Track.findAll({
      where: whereTrack,
      include: [
        {
          model: Album,
          where: Object.keys(whereAlbum).length ? whereAlbum : undefined,
          required: Object.keys(whereAlbum).length > 0
        },
        {
          model: Artist,
          as: 'artists',
          where: Object.keys(whereArtist).length ? whereArtist : undefined,
          required: Object.keys(whereArtist).length > 0,
          include: [
            {
              model: Genres,
              as: 'genres',
              where: Object.keys(whereGenre).length ? whereGenre : undefined,
              required: Object.keys(whereGenre).length > 0
            }
          ]
        }
      ],
      limit: Number.parseInt(limit) || 20,
      order: [['createdAt', 'DESC']]
    });

    if (data.length > 0) {
      for (const track of data) {
        const album = track.Album;
        const artist = [];
        for (const a of track.artists) {
          artist.push(a);
        }
        const itemFormat = formatTrack(track, artist, album, track?.videoId || null)
        dataFormated.push(itemFormat);
      }
    }

    // chuyển đổi thành chuỗi truy vấn
    const spotifyQueryString = Object.entries(query)
      .map(([key, value]) => `${key.toLowerCase()}:("${String(value)}")`)
      .join(' ');
    console.log("Spotify Query:", spotifyQueryString);

    if ((limit && dataFormated.length < limit) || dataFormated.length < 30) {
      let spotifyData = [];
      if (spotifyQueryString.length > 0) {
        spotifyData = await spotify.searchTracks(spotifyQueryString, type || 'track', Number.parseInt(limit) || null);
      }
      spotifyData.map(track => dataFormated.push(formatTrack(track, null, null, null)));
    }

    console.log("toonrg", dataFormated.length)
    return res.status(200).json({
      message: 'Tìm bài hát thành công',
      data: dataFormated,
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search tracks on Spotify' });
  }
};

const searchPlaylists = async (req, res) => {
  try {
    const { name, artist } = req.body;

    if (!name && !artist) {
      return res.status(400).json({ error: 'Name or artist parameter is required' });
    }
    const dataFormated = [];
    let data = await Playlist.findAll(
      { where: { name: { [Op.iLike]: '%' + name.toLowerCase() + '%' } } }
    );

    console.log('data playlsist', data.length);
    if (data.length > 0) {
      for (const playlist of data) {
        let user = null;
        if (playlist.userId) {
          user = await User.findByPk(playlist.userId);
        }
        const itemFormat = formatPlaylist(playlist, user);
        dataFormated.push(itemFormat);
      }
    }
    console.log('dataFormated 1', dataFormated);

    if (dataFormated.length > 20) {
      return res.status(200).json({
        message: 'Playlist search successful',
        data: dataFormated,
        success: true
      });
    }

    data = await spotify.searchPlaylists({ name, artist });
    console.log(data[0])
    data.map(item => dataFormated.push(formatPlaylist(item, null)));

    return res.status(200).json({
      message: 'Playlist search successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search playlists on Spotify' });
  }
};

const searchAlbums = async (req, res) => {
  try {
    const { name, artist } = req.body;
    if (!name && !artist) {
      return res.status(400).json({ error: 'Name or artist parameter is required' });
    }

    const dataFormated = [];
    let data = await Album.findAll(
      {
        where: { name: { [Op.like]: '%' + name + '%' } },
        include: { model: Artist, as: 'artists' }
      });
    if (data.length > 0) {
      data.forEach(album => {
        const dataArtist = [];
        album.artists.forEach(artist => {
          dataArtist.push(artist)
        });
        const itemFormat = formatAlbum(album, dataArtist)
        dataFormated.push(itemFormat);
      })
    }

    console.log('local', dataFormated)
    if (data.length > 20) {
      return res.status(200).json({
        message: 'Album search successful',
        data: dataFormated,
        success: true
      });
    }

    data = await spotify.searchAlbums({ name, artist });
    data.map(item => {
      const itemFormat = formatAlbum(item, []);
      dataFormated.push(itemFormat);
    });

    return res.status(200).json({
      message: 'Album search successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search albums on Spotify: controller' });
  }
};


const searchArtists = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const dataFormated = [];
    let data = await Artist.findAll({
      where: { name: { [Op.iLike]: '%' + name + '%' } },
      include: { model: Genres, as: 'genres' }
    });

    if (data.length > 0) {
      for (const artist of data) {
        const genres = [];
        for (const genre of artist.genres) {
          genres.push(genre.name);
        }
        console.log(genres)
        const itemFormat = formatArtist(artist, genres);
        dataFormated.push(itemFormat);
      }
    }

    if (dataFormated.length > 20) {
      return res.status(200).json({
        message: 'Artist search successful',
        data: dataFormated,
        success: true
      });
    }
    data = await spotify.searchArtists(name);
    data.map(item => { dataFormated.push(formatArtist(item, null)) });
    return res.status(200).json({
      message: 'Artist search successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to search artists on Spotify' });
  }
}

const getTracksFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { type } = req.body;
    let playlist = null;
    let data = [];
    const dataFormated = [];
    if (type === 'local') {
      playlist = await Playlist.findByPk(playlistId, {
        include: [{ model: PlaylistTrack }]
      })

      if (playlist.PlaylistTracks.length > 0) {
        for (const item of playlist.PlaylistTracks) {
          const spotifyId = item.trackSpotifyId;
          const uniquePlaylistTrackId = item.id;

          let album = null;
          let artist = [];
          if (spotifyId) {
            let track = await Track.findOne({
              where: { spotifyId },
              include: [
                { model: Album },
                { model: Artist, as: 'artists' }
              ]
            });

            if (!track) {
              track = await spotify.findTrackById(spotifyId);
              console.log(track)
            } else {
              album = track.Album;
              artist = [];
              for (const a of track.artists) {
                artist.push(a);
              }
            }
            const itemFormat = formatTrack(track, artist, album, track?.videoId || null);
            itemFormat.playlistTrack = {
              id: uniquePlaylistTrackId
            };
            dataFormated.push(itemFormat);
          }
        }
      }
    } else if (type === 'api') {
      data = await spotify.getPlaylistTracks(playlistId);
      data.map((track) => {
        const itemFormat = formatTrack(track, null, null, null);
        itemFormat.playlistTrack = null;
        dataFormated.push(itemFormat);
      })
    }

    console.log('paylistId: ', playlistId)
    if (!dataFormated || dataFormated.length === 0) {
      return res.status(200).json({ message: 'Không tìm thấy bài hát nào trong playlist này', success: false });
    }

    console.log('Tổng: ', dataFormated.length)

    return res.status(200).json({
      message: 'Get tracks from playlist successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get tracks from playlist on Spotify' });
  }
};

const getTracksFromAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    console.log(albumId)

    let data = await Album.findOne(
      {
        where: { spotifyId: albumId },
        include: {
          model: Track,
          include: [
            {
              model: Artist,
              as: 'artists',
              attributes: ['id', 'name', 'spotifyId', 'imageUrl'],
              through: { attributes: [] }
            }
          ]
        }
      });

    if (data) {
      console.log('local')

      const dataFormated = []
      for (const track of data.Tracks) {
        const artists = [];
        for (const artist of track.artists) {
          artists.push(artist);
        }
        const itemFormat = formatTrack(track, artists, data, null);
        dataFormated.push(itemFormat);
      }

      return res.status(200).json({
        message: 'Lấy nhạc thành công',
        data: dataFormated,
        success: true
      });
    } else {
      console.log('api')
      let albumData = null;
      Promise.all([
        albumData = formatAlbum(await spotify.findAlbumById(albumId), null),
        data = await spotify.getAlbumTracks(albumId)
      ]);
      const dataFormated = data.map(item => formatTrack(item, null, albumData, null));
      return res.status(200).json({
        message: 'Lấy nhạc thành công',
        data: dataFormated,
        success: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi không xác định' });
  }
};

const getPlaylistsForYou = async (req, res) => {
  try {
    const { playlistName } = req.body;
    const playlists = [];
    const dataFormated = [];

    if (playlistName?.length === 0) {
      return res.status(200).json({ message: 'Playlist name parameter is required', success: false });
    }

    for (const name of playlistName) {
      const responsePlaylist = await spotify.searchPlaylists({ name });
      playlists.push(...responsePlaylist);
    }

    for (const playlist of playlists) {
      console.log(playlist)
      dataFormated.push(formatPlaylist(playlist, null));
    }

    console.log('tổng số playlist nhận được: ', playlists.length);

    return res.status(200).json({
      message: 'Get personalized playlists successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get personalized playlists on Spotify' });
  }
}

const getAlbumsForYou = async (req, res) => {
  try {
    const { albumName } = req.body;
    const albums = [];
    const dataFormated = [];

    if (albumName.length === 0) {
      return res.status(200).json({ message: 'Album name parameter is required', success: false });
    }

    for (const name of albumName) {
      const responseAlbum = await spotify.searchAlbums({ name });
      albums.push(...responseAlbum);
    }

    for (const album of albums) {
      dataFormated.push(formatAlbum(album, null));
    }

    return res.status(200).json({
      message: 'Album search successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get personalized albums on Spotify' });
  }
};

const getArtistsForYou = async (req, res) => {
  try {
    const { artistName } = req.body;
    const artists = [];
    const dataFormated = [];

    if (artistName.length === 0) {
      return res.status(200).json({ message: 'Artist name parameter is required', success: false });
    }

    for (const name of artistName) {
      const responseArtist = await spotify.searchArtists({ name });
      artists.push(...responseArtist);
    }

    for (const artist of artists) {
      console.log(artist)
      dataFormated.push(formatArtist(artist, null));
    }

    return res.status(200).json({
      message: 'Get artist for you successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get artist for you on Spotify' });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Playlist }]
    })
    const dataFormated = [];
    if (!user) return res.status(404).json({ message: 'Người dùng không tìm thấy', success: false });
    console.log(user);
    for (const playlist of user.Playlists) {
      dataFormated.push(formatPlaylist(playlist, user));
    }

    return res.status(200).json({
      message: 'Get my playlists successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get my playlists on Spotify' });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, trackSpotifyId } = req.body;
    const userId = req.user.id;
    const data = {};

    console.log(req.params);
    console.log(req.body);

    if (playlistId) data.playlistId = playlistId;
    if (trackId) data.trackId = trackId;
    if (trackSpotifyId) data.trackSpotifyId = trackSpotifyId;

    const playlist = await Playlist.findByPk(playlistId, {
      include: [
        {
          model: PlaylistTrack,
          attributes: ['id', 'playlistId', 'trackId', 'trackSpotifyId'],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!playlist) {
      return res.status(400).json({
        message: 'Không tìm thấy playlist',
        success: false
      })
    }

    if (playlist.userId !== userId) {
      return res.status(403).json({
        message: 'Bạn không có quyền thêm bài hát vào playlist này',
        success: false
      });
    }

    const isExistingTrackInPlaylist = playlist.PlaylistTracks.some(pt => {
      if (trackId) {
        return pt.trackId === trackId;
      }
      if (trackSpotifyId) {
        return pt.trackSpotifyId === trackSpotifyId;
      }
    });

    if (isExistingTrackInPlaylist) {
      return res.status(200).json({
        message: 'Bài hát đã tồn tại trong playlist. Bạn có muốn thêm lần nữa không?',
        success: false,
        isExisting: true
      });
    }

    const row = await PlaylistTrack.create(data);
    if (!row) {
      return res.status(500).json({
        message: 'Thêm bài hát vào playlist thất bại',
        success: false
      });
    }

    playlist.totalTracks += 1;
    await playlist.save();

    const track = await spotify.findTrackById(trackSpotifyId)

    return res.status(200).json({
      message: 'Thêm bài hát vào playlist thành công',
      data: formatTrack(track, null, null, null),
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add track to playlist' });
  }
};

const addTracksToPlaylists = async (req, res) => {
  try {
    const { playlistIds, trackIds } = req.body;
    let dataFormated = [];

    if (!playlistIds || !trackIds || playlistIds.length === 0 || trackIds.length === 0) {
      return res.status(400).json({ message: 'Playlist IDs and Track IDs are required', success: false });
    }

    for (const trackId of trackIds) {
      const track = await spotify.findTrackById(trackId)
      if (!track) continue;
      dataFormated.push(formatTrack(track, null, null, null));
    }

    for (const playlistId of playlistIds) {
      let data = [];

      if (!playlistId) continue;

      const playlist = await Playlist.findByPk(playlistId, {
        include: [
          {
            model: PlaylistTrack,
            attributes: ['id', 'playlistId', 'trackId', 'trackSpotifyId'],
            order: [['createdAt', 'ASC']]
          }
        ]
      });

      if (!playlist) {
        return res.status(400).json({
          message: `Không tìm thấy playlist với ID: ${playlistId}`,
          success: false
        })
      }

      for (const trackId of trackIds) {
        data.push({
          playlistId: playlistId,
          trackSpotifyId: trackId
        })
      }

      const row = await PlaylistTrack.bulkCreate(data, { ignoreDuplicates: true });
      if (!row) {
        return res.status(500).json({
          message: 'Thêm bài hát vào playlist thất bại',
          success: false
        });
      }

      playlist.totalTracks += trackIds.length;
      await playlist.save();
    }

    return res.status(200).json({
      message: 'Thêm bài hát vào playlist thành công',
      data: dataFormated,
      success: true
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add tracks to playlists' });
  }
};

const addTrackToPlaylistAfterConfirm = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, trackSpotifyId } = req.body;
    const data = {};
    if (playlistId) data.playlistId = playlistId;
    if (trackId) data.trackId = trackId;
    if (trackSpotifyId) data.trackSpotifyId = trackSpotifyId;
    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(400).json({
        message: 'Không tìm thấy playlist',
        success: false
      });
    }

    const row = await PlaylistTrack.create(data);
    if (!row) {
      return res.status(500).json({
        message: 'Thêm bài hát vào playlist thất bại',
        success: false
      });
    }

    playlist.totalTracks += 1;
    await playlist.save();

    const track = await spotify.findTrackById(trackSpotifyId)

    return res.status(200).json({
      message: 'Thêm bài hát vào playlist thành công',
      data: formatTrack(track, null, null, null),
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add track to playlist after confirm' });
  }
};

const removeTrackFromPlaylist = async (req, res) => {
  try {
    const { playlistId, playlistTrackId } = req.params;

    if (!playlistId || !playlistTrackId) {
      return res.status(400).json({ message: 'Playlist ID và Playlist Track ID là bắt buộc', success: false });
    }

    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Không tìm thấy playlist', success: false });
    }

    const row = await PlaylistTrack.destroy({
      where: {
        id: playlistTrackId
      }
    });

    if (!row) {
      return res.status(500).json({ message: 'Có lỗi xảy ra khi xóa track khỏi playlist', success: false });
    }

    playlist.totalTracks = Math.max(0, playlist.totalTracks - 1);
    await playlist.save();

    return res.status(200).json({ message: 'Đã xóa track khỏi playlist', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra khi xóa track khỏi playlist' });
  }
};

module.exports = {
  findSpotifyPlaylist,
  findArtistTopTracks,
  findYoutubeVideo,
  findPlaylistById,
  findAlbumById,
  getTracksFromPlaylist,
  getTracksFromAlbum,
  getPlaylistsForYou,
  getAlbumsForYou,
  getArtistsForYou,
  getMyPlaylists,
  searchTracks,
  searchPlaylists,
  searchAlbums,
  searchArtists,
  addTrackToPlaylist,
  addTrackToPlaylistAfterConfirm,
  addTracksToPlaylists,
  removeTrackFromPlaylist,
};