const sequelize = require('../configs/database');

const User = require('../models/User');
const Role = require('../models/role');
const Genres = require('../models/genres');
const Artist = require('../models/artist');
const Album = require('../models/album');
const Track = require('../models/track');
const Playlist = require('../models/playlist');

// Đọc file JSON trực tiếp
const roleData = require('../seeders/roles.json');
const userData = require('../seeders/users.json');
const genresData = require('../seeders/genres.json');
const artistData = require('../seeders/artists.json');
const albumData = require('../seeders/albums.json');
const trackData = require('../seeders/tracks.json');
const playlistData = require('../seeders/playlists.json');

const mapArtist = async() => {
    const artists = await Artist.findAll({ attributes: ['id', 'name'] });
    const artistMap = artists.reduce((map, artist) => {
        map[artist.name] = artist.id;
        return map;
    }, {});
    return artistMap;
}

const mapAlbum = async() => {
    const albums = await Album.findAll({ attributes: ['id', 'name'] });
    const albumMap = albums.reduce((map, album) => {
        map[album.name] = album.id;
        return map;
    }, {});
    return albumMap;
}

const mapGenres = async() => {
    const genres = await Genres.findAll({ attributes: ['id', 'name'] });
    const genreMap = genres.reduce((map, genre) => {
        map[genre.name] = genre.id;
        return map;
    }, {});
    return genreMap;
}

const mapTrack = async() => {
    const tracks = await Track.findAll({ attributes: ['id', 'name'] });
    const trackMap = tracks.reduce((map, track) => {
        map[track.name] = track.id;
        return map;
    }, {});
    return trackMap;
}

/**
 * --- 1. SEED DATA CHO ROLE ---
 * Kiểm tra nếu bảng Role đã có dữ liệu (quan trọng để tránh trùng lặp)
 * Sử dụng bulkCreate để chèn tất cả data cùng lúc (hiệu suất cao)
 */
const seedDataRole = async() => {
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
const seedDataUser = async() => {
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
const seedDataGenres = async() => {
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
const seedDataArtists = async() => {
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
const seedDataArtistGenres = async() => {
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
const seedDataAlbum = async() => {
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
const seedDataArtistAlbums = async() => {
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
const seedDataTrack = async() => {
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
const seedDataArtistTracks = async() => {
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
const seedDataPlaylist = async() => {
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
            console.log(' Finish insert Playlists.');
        } else {
            console.log('Pass insert Playlist.');
        }

    } catch (error) {
        console.log('Error insert playlist', error);
    }
}

/**
 * Phương thức để seeding dữ liệu vào database
 */
async function seedDatabase() {
    try {
        await seedDataRole();
        await seedDataUser();

        await seedDataGenres();
        await seedDataArtists();
        await seedDataArtistGenres(); /* Bảng trung gian */

        await seedDataAlbum();
        await seedDataArtistAlbums(); /* Bảng trung gian */

        /** còn album track - playlist - playlist tracks */
        await seedDataTrack();
        await seedDataArtistTracks(); /* Bảng trung gian */

        await seedDataPlaylist();
        console.log(' Finish seeding database.');

    } catch (error) {
        console.error('Lỗi khi chèn dữ liệu (Seeding):', error);
    }
}

module.exports = seedDatabase;