// controllers/musicController.js
const { TOP_50_PLAYLIST_ID } = require('../configs/constants');
const spotify = require('../configs/spotify');
const youtube = require('../configs/youtube');
const { Playlist, Track, Album, Artist, PlaylistTrack, User, Genres } = require('../models');
const Op = require('sequelize').Op;
const { get } = require("../routes/musicRoute");

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

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

const findSpotifyPlaylist = async (req, res) => {
  try {
    const { query } = req.query; // Lấy query từ URL, ví dụ: /spotify/playlists?query=lofi
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    const data = await spotify.searchPlaylists(query);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to search playlists" });
  }
};

// ví dụ: /youtube/search?song=Hello&artist=Adele
const findYoutubeVideo = async (req, res) => {
  try {
    const { song, artist } = req.body;
    if (!song || !artist) {
      return res
        .status(400)
        .json({ error: "Song and artist parameters are required" });
    }
    const data = await youtube.searchVideo(song, artist);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to search on YouTube" });
  }
};

const findAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const data = await spotify.findAlbumById(albumId);
    return res.status(200).json({
      message: "Album retrieval successful",
      data,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to find album by ID on Spotify",
    });
  }
};

const findPlaylistById = async (req, res) => {
  try {
    const { market } = req.body;
    console.log(market);
    if (!market || !TOP_50_PLAYLIST_ID[market]) {
      return res
        .status(400)
        .json({ error: "Invalid or missing market parameter" });
    }

    const playlistData = await spotify.findPlaylistById(
      TOP_50_PLAYLIST_ID[market]
    );
    return res.status(200).json({
      message: "Playlist retrieval successful",
      data: playlistData,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to find playlist by ID on Spotify",
    });
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

    return res.status(200).json({
      message: 'Tìm bài hát thành công',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to search tracks on Spotify" });
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

    if (dataFormated.length > 20) {
      return res.status(200).json({
        message: 'Playlist search successful',
        data: dataFormated,
        success: true
      });
    }

    data = await spotify.searchPlaylists({ name, artist });
    data.map(item => dataFormated.push(formatPlaylist(item, null)));

    return res.status(200).json({
      message: 'Playlist search successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to search playlists on Spotify",
    });
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
    res.status(500).json({
      message:
        error.message || "Failed to search albums on Spotify: controller",
    });
  }
};


const searchArtists = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
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
    res.status(500).json({
      message: error.message || "Failed to search artists on Spotify",
    });
  }
};

const getTracksFromPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { type } = req.body;
    let playlist = null;
    let data = [];
    let track = null;
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
            track = await Track.findOne({
              where: { spotifyId },
              include: [
                { model: Album },
                { model: Artist, as: 'artists' }
              ]
            });

            const idTemp = track?.id || null;
            if (!track || !track?.name) {
              track = await spotify.findTrackById(spotifyId);
              if (idTemp) {
                track.tempId = idTemp;
              }

            } else {
              album = track.Album;
            }
            artist = [];
            for (const a of track?.artists) {
              artist.push(formatArtist(a, null));
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

    return res.status(200).json({
      message: 'Get tracks from playlist successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get tracks from playlist on Spotify",
    });
  }
};

const getTracksFromAlbum = async (req, res) => {
  try {
    const { spotifyId } = req.params;
    const dataFormated = [];

    if (!spotifyId) {
      return res.status(400).json({ error: 'spotifyId parameter is required' });
    }

    const data = await spotify.getAlbumTracks(spotifyId);

    if (!data || data.length === 0) {
      return res.status(200).json({ message: 'Không tìm thấy bài hát nào trong album này', success: false });
    }

    for (const track of data) {
      const artists = [];
      for (const a of track.artists) {
        const artist = await spotify.findArtistById(a.id);
        artists.push(formatArtist(artist, null));
      }
      const itemFormat = formatTrack(track, artists, null, null);
      dataFormated.push(itemFormat);
    }

    return res.status(200).json({
      message: 'Lấy nhạc thành công',
      data: dataFormated,
      success: true
    });
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
      return res.status(200).json({
        message: "Playlist name parameter is required",
        success: false,
      });
    }

    for (const name of playlistName) {
      const responsePlaylist = await spotify.searchPlaylists({ name });
      playlists.push(...responsePlaylist);
    }

    for (const playlist of playlists) {
      dataFormated.push(formatPlaylist(playlist, null));
    }

    return res.status(200).json({
      message: 'Get personalized playlists successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message || "Failed to get personalized playlists on Spotify",
    });
  }
};

const getAlbumsForYou = async (req, res) => {
  try {
    const { albumName } = req.body;
    const albums = [];
    const dataFormated = [];

    if (albumName.length === 0) {
      return res
        .status(200)
        .json({ message: "Album name parameter is required", success: false });
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
    res.status(500).json({
      message: error.message || "Failed to get personalized albums on Spotify",
    });
  }
};


const getArtistsForYou = async (req, res) => {
  try {
    const { artistNames = [], genres = [] } = req.body;
    const allResults = [];
    const dataFormated = [];

    if (artistNames.length === 0 && genres.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần có artistNames hoặc genres", success: false });
    }

    for (const name of artistNames) {
      const query = `artist: ${name}`;
      console.log("Đang tìm theo:", query);
      const responseArtist = await spotify.searchArtists(query);
      allResults.push(...responseArtist);
    }

    for (const genre of genres) {
      const query = `genre:${genre}`;
      console.log("Đang tìm theo:", query);
      const responseGenre = await spotify.searchArtists(query);
      allResults.push(...responseGenre);
    }

    for (const artist of allResults) {
      if (dataFormated.findIndex(a => a.spotifyId === artist.id) === -1) {
        dataFormated.push(formatArtist(artist, null));
      }
    }

    const finalData = shuffle(dataFormated).slice(0, 12);

    return res.status(200).json({
      message: 'Get artist for you successful',
      data: finalData,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get artist for you on Spotify",
    });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Playlist }]
    })
    const dataFormated = [];
    if (!user) return res.status(404).json({ message: 'Người dùng không tìm thấy', success: false });
    for (const playlist of user.Playlists) {
      dataFormated.push(formatPlaylist(playlist, user));
    }

    return res.status(200).json({
      message: 'Get my playlists successful',
      data: dataFormated,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get my playlists on Spotify",
    });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, trackSpotifyId } = req.body;
    const userId = req.user.id;
    const data = {};

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
    const dataFormated = formatTrack(track, null, null, null);
    dataFormated.playlistTrack = {
      id: row.id
    }

    return res.status(200).json({
      message: 'Thêm bài hát vào playlist thành công',
      data: dataFormated,
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


const findVideoIdForTrack = async (req, res) => {
  try {
    const { trackSpotifyId } = req.params;
    console.log('trackSpotifyId', trackSpotifyId);
    let videoData = null;
    let videoId = null;
    let row = null;
    if (!trackSpotifyId) {
      return res.status(400).json({ message: 'Track Spotify ID is required', success: false });
    }

    let track = await Track.findOne({
      where: { spotifyId: trackSpotifyId },
      include: [
        { model: Artist, as: 'artists' }
      ]
    });
    console.log('track', track)

    if (track) {
      if (track.videoId) {
        videoId = track.videoId;
      } else if (!track.videoId) {
        videoData = await youtube.searchVideo(track.name, track.artists[0]?.name || '');
        videoId = videoData.videoId;
        track.videoId = videoId;
        await track.save();
      }
    } else {
      track = await spotify.findTrackById(trackSpotifyId);
      console.log(track.name);
      console.log(track.artists[0]?.name)
      videoData = await youtube.searchVideo(track.name, track.artists[0]?.name || '');
      videoId = videoData.videoId;
      console.log(videoId);
      const row = await Track.create({
        spotifyId: trackSpotifyId,
        videoId: videoId,
        shareCount: 0,
        playCount: 0
      })

      console.log(1)
      if (!row) {
        res.status(500).json({ message: 'Failed to create track with video ID', success: false });
      }
    }

    return res.status(200).json({
      message: 'Đã tìm thấy video id',
      data: videoId,
      success: true
    })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to find video ID for track' });
  }
}
// đang test
const getTracks = async (req, res) => {
  try {
    const tracks = await Track.findAll({
      include: [
        {
          model: Artist,
          as: "artists",
          attributes: ["id", "name", "spotifyId", "imageUrl"],
          through: { attributes: [] },
        },
        {
          model: Album,
          attributes: ["id", "name", "imageUrl", "spotifyId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform data to match mobile app expectations
    const transformedTracks = tracks.map((track) => ({
      id: track.id,
      title: track.name,
      artist:
        track.artists && track.artists.length > 0
          ? track.artists[0].name
          : "Unknown Artist",
      album: track.Album ? track.Album.name : null,
      duration: track.duration,
      spotifyId: track.spotifyId,
      videoId: track.videoId,
      imageUrl: track.Album ? track.Album.imageUrl : null,
    }));

    return res.status(200).json({
      message: "Get tracks successful",
      data: transformedTracks,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to get tracks" });
  }
};

const getTopTrackFromArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    console.log('top: ', artistId)
    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required", success: false });
    }

    const tracks = await spotify.getArtistTopTracks(artistId);

    if (!tracks || tracks.length === 0) {
      return res.status(200).json({
        message: 'No top tracks found for this artist',
        data: [],
        success: true
      });
    }

    const dataFormated = tracks.map(track => {
      console.log('name: ', track.name)
      return formatTrack(track, null, null, null);
    });

    return res.status(200).json({
      message: 'Get artist top tracks successful',
      data: dataFormated,
      success: true
    });

  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to get artist top tracks",
    });
  }
};

const getAlbumsFromArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    console.log('album: ', artistId)
    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required", success: false });
    }

    const albums = await spotify.getArtistAlbums(artistId);
    if (!albums || albums.length === 0) {
      return res.status(200).json({
        message: 'No albums found for this artist',
        data: [],
        success: true
      });
    }

    const dataFormated = albums.map(album => {
      return formatAlbum(album, null);
    });

    return res.status(200).json({
      message: 'Get artist albums successful',
      data: dataFormated,
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get artist albums",
    });
  }
};

const getTracksFromArtist = async (req, res) => {
  try {
    const { artistName } = req.body;
    if (!artistName) {
      return res.status(400).json({ message: "artistName is required in body", success: false });
    }

    const spotifyQueryString = `artist:"${artistName}"`;

    // 2. Gọi service spotify.searchTracks (lấy tối đa 50 bài)
    const spotifyData = await spotify.searchTracks(spotifyQueryString, 'track', 50);

    if (!spotifyData || spotifyData.length === 0) {
      return res.status(200).json({
        message: 'No tracks found for this artist name',
        data: [],
        success: true
      });
    }

    // 3. Dùng formatTrack để chuẩn hóa dữ liệu
    const dataFormated = spotifyData.map(track => {
      return formatTrack(track, null, null, null);
    });

    // 4. Trả về kết quả
    return res.status(200).json({
      message: 'Get tracks from artist successful',
      data: dataFormated,
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to get tracks from artist",
    });
  }
};

module.exports = {
  findSpotifyPlaylist,
  findYoutubeVideo,
  findPlaylistById,
  findAlbumById,
  findVideoIdForTrack,
  getTracksFromPlaylist,
  getTracksFromAlbum,
  getPlaylistsForYou,
  getAlbumsForYou,
  getArtistsForYou,
  getMyPlaylists,
  getTracks,
  getTopTrackFromArtist,
  getAlbumsFromArtist,
  getTracksFromArtist,
  searchTracks,
  searchPlaylists,
  searchAlbums,
  searchArtists,
  addTrackToPlaylist,
  addTrackToPlaylistAfterConfirm,
  addTracksToPlaylists,
  removeTrackFromPlaylist,
};
