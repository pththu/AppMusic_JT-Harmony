import { AddFavoriteItem, RemoveFavoriteItem } from "@/services/favoritesService";
import { ShareArtist } from "@/services/followService";
import { SaveToListeningHistory } from "@/services/historiesService";
import { AddTracksToPlaylists, ShareAlbum, SharePlaylist, ShareTrack, UpdatePlaylistPrivacy } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useFollowStore } from "@/store/followStore";
import { useHistoriesStore } from "@/store/historiesStore";
import { usePlayerStore } from "@/store/playerStore";
import { useState } from "react";
import { Share } from "react-native";
import { useArtistData } from "./useArtistData";
import { useCustomAlert } from "./useCustomAlert";
import { useNavigate } from "./useNavigate";
import { usePlaylistData } from "./usePlaylistData";

export const useMusicAction = () => {

  const { navigate } = useNavigate();
  const { info, error, success, confirm, warning } = useCustomAlert();

  const user = useAuthStore((state) => state.user);
  const isGuest = useAuthStore((state) => state.isGuest);
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist);
  const currentAlbum = usePlayerStore((state) => state.currentAlbum);
  const currentArtist = useFollowStore((state) => state.currentArtist);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const favoriteItems = useFavoritesStore((state) => state.favoriteItems);

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const updateCurrentPlaylist = usePlayerStore((state) => state.updateCurrentPlaylist);
  const updateTrack = usePlayerStore((state) => state.updateTrack);
  const updatePrivacy = usePlayerStore((state) => state.updatePrivacy);
  const updateTotalTracksInMyPlaylists = usePlayerStore((state) => state.updateTotalTracksInMyPlaylists);
  const addListenHistory = useHistoriesStore((state) => state.addListenHistory);
  const addFavoriteItem = useFavoritesStore((state) => state.addFavoriteItem);
  const addTrackToQueue = usePlayerStore((state) => state.addTrackToQueue);
  const removeFavoriteItem = useFavoritesStore((state) => state.removeFavoriteItem);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [songModalVisible, setSongModalVisible] = useState(false);
  const [artistModalVisible, setArtistModalVisible] = useState(false);
  const [addTrackToPlaylistModalVisible, setAddTrackToPlaylistModalVisible] = useState(false);

  const { setModalVisible } = usePlaylistData(currentPlaylist);
  const { setArtistOptionModalVisible } = useArtistData(currentArtist);

  const handleSelectPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate("PlaylistScreen");
  };

  const handleSelectAlbum = (album) => {
    setCurrentAlbum(album);
    navigate("AlbumScreen");
  };

  const handleSelectArtist = (artist) => {
    setCurrentArtist(artist);
    navigate("ArtistScreen");
  }

  const handleTrackOptionPress = (track) => {
    setSelectedTrack(track); // Lưu bài hát đã chọn
    setSongModalVisible(true); // Mở modal
  };

  const handlePlayPlaylist = async () => {
    if (!listTrack || listTrack.length === 0) {
      warning('Playlist không có bài hát để phát!');
      return;
    }

    playPlaylist(listTrack, 0);
    const queueData = listTrack.filter((item, index) => {
      if (index > 0) return item;
    });
    setQueue(queueData);
    setCurrentTrack(listTrack[0])
    savePlaylistToListeningHistory();
  };

  const handlePlayAlbum = async () => {
    if (!listTrack || listTrack?.length === 0) {
      warning('Album không có bài hát để phát!');
      return;
    }

    playPlaylist(listTrack, 0);
    const queueData = listTrack.filter((item, index) => {
      if (index > 0)
        return item;
    });
    setQueue(queueData);
    setCurrentTrack(listTrack[0])

    saveAlbumToListeningHistory();
  }

  const handlePlayTrack = async (track, index) => {
    playPlaylist(listTrack, index);
    const queueData = listTrack.filter((item, i) => {
      if (i > index)
        return item;
    });
    setCurrentTrack(track);
    setQueue(queueData);
  };

  const handleSharePlaylist = async () => {
    if (isGuest) {
      warning("Tài khoản khách không thể chia sẻ playlist!");
      return;
    };

    try {
      let shareMessage = `${user?.fullName}: `;

      if (currentPlaylist?.name) {
        shareMessage += `${currentPlaylist?.name}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (currentPlaylist?.imageUrl) {
        shareMessage += `${currentPlaylist?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${currentPlaylist?.id}`; // Deep link giả định
      shareMessage += `Xem bài viết: ${postLink}`;

      const result = await Share.share({
        message: shareMessage,
        // url: postLink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        // Update share count after successful share
        const response = await SharePlaylist({
          playlistId: currentPlaylist?.id,
          playlistSpotifyId: currentPlaylist?.spotifyId
        });
        if (response.success) {
          success('Đã chia sẻ');
          currentPlaylist.id = response.data.playlistId;
          updateCurrentPlaylist(currentPlaylist);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ playlist. Vui lòng thử lại sau.');
    }
  }

  const handleShareTrack = async (track) => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    try {
      const artistName = track.artists?.map(a => a.name).join(', ');
      let shareMessage = `${user?.fullName}: `;

      if (track?.name) {
        shareMessage += `Nghe thử bài hát này: ${track.name} - ${artistName}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (track?.imageUrl) {
        shareMessage += `${track?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${track?.id}`; // Deep link giả định
      shareMessage += `Xem bài hát: ${postLink}`;

      const result = await Share.share({
        message: shareMessage,
        // url: postLink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        // Update share count after successful share
        const response = await ShareTrack({
          trackId: track?.id,
          trackSpotifyId: track?.spotifyId
        });
        if (response.success) {
          success('Đã chia sẻ');
          selectedTrack.id = response.data.trackId;
          updateTrack(selectedTrack);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi chia sẻ bài hát.');
    }
    setSongModalVisible(false);
  };

  const handleShareAlbum = async () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }
    setModalVisible(false);
    try {
      let shareMessage = `${user?.fullName} muốn chia sẻ với bạn album: `;
      shareMessage += `${currentAlbum?.name}\n\n`;
      if (currentAlbum?.imageUrl) {
        shareMessage += `${currentAlbum?.imageUrl}\n\n`;
      }
      const albumLink = `app://album/${currentAlbum?.spotifyId}`;
      shareMessage += `Nghe album: ${albumLink}`;

      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        success('Đã chia sẻ');
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        const response = await ShareAlbum({
          albumId: currentAlbum?.id,
          albumSpotifyId: currentAlbum?.spotifyId
        });

        if (response.success) {
          currentAlbum.id = response.data?.albumId;
          setCurrentAlbum(currentAlbum);
          console.log('album sau khi them id: ', currentAlbum);
        }
      }
    } catch (err) {
      console.log('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ album.');
    }
  };

  const handleShareArtist = async () => {
    if (isGuest) {
      info("Hãy đăng nhập để sử dụng chức năng này.");
      return;
    }

    try {
      let shareMessage = `${user?.fullName}: `;

      if (currentArtist?.name) {
        shareMessage += `${currentArtist?.name}\n\n`;
      } else {
        shareMessage += `Bài đăng của ${user?.fullName}\n\n`;
      }

      // Thêm URL hình ảnh nếu có
      if (currentArtist?.imageUrl) {
        shareMessage += `${currentArtist?.imageUrl}\n\n`;
      }

      // Thêm liên kết đến bài viết
      const postLink = `app://post/${currentArtist?.id}`; // Deep link giả định
      shareMessage += `Xem bài viết: ${postLink}`;

      const result = await Share.share({
        message: shareMessage,
        // url: postLink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType)
        } else {
          console.log('Chia sẻ thành công!');
        }
        // Update share count after successful share
        const response = await ShareArtist({
          artistId: currentArtist?.id,
          artistSpotifyId: currentArtist?.spotifyId
        })

        if (response.success) {
          currentArtist.id = response.data.artistId;
          currentArtist.shareCount += 1;
          setCurrentArtist(currentArtist);
          success('Đã chia sẻ');
          setArtistOptionModalVisible(false);
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (err) {
      console.log('Lỗi khi chia sẻ:', err);
      error('Lỗi khi chia sẻ thông tin nghệ sĩ. Vui lòng thử lại sau.');
    }
  };

  const handleAddFavorite = async (item, type, setIsFavoriteLoading, setIsFavorite) => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    try {
      setIsFavoriteLoading(true);

      console.log('fav')
      const response = await AddFavoriteItem({
        itemType: type,
        itemId: item.id,
        itemSpotifyId: item.spotifyId
      });
      if (response.success) {
        setIsFavorite(true);
        setIsFavoriteLoading(false);
        addFavoriteItem(response.data[0]);
      }
    } catch (err) {
      console.log(err)
      error('Lỗi khi thêm vào mục yêu thích.');
    }
  }

  const handleRemoveFavorite = async (item, type, setIsFavoriteLoading, setIsFavorite) => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    try {
      console.log('un')
      setIsFavoriteLoading(true);
      const favoriteItem = favoriteItems.find((favItem) => {
        if (favItem?.itemType === type) {
          if ((item?.id && (favItem?.itemId === item?.id))
            || (item?.spotifyId && (favItem?.itemSpotifyId === item?.spotifyId))) {
            return true;
          }
        }
        return false;
      });

      if (!favoriteItem) {
        error('Playlist không có trong mục yêu thích.');
        return;
      }

      const response = await RemoveFavoriteItem(favoriteItem.id);
      if (response.success) {
        removeFavoriteItem(favoriteItem);
        setIsFavorite(false);
        setIsFavoriteLoading(false);
      }
    } catch (err) {
      console.log(err);
      error('Lỗi khi xóa playlist khỏi mục yêu thích.');
    }
  };

  const handleAddToQueue = () => {
    console.log('handleAddToQueue')
    if (!listTrack || listTrack.length === 0) {
      warning('Playlist không có bài hát để thêm vào hàng đợi!');
      return;
    }

    // Thêm toàn bộ bài hát trong playlist này vào Queue
    addTrackToQueue(listTrack);
    success(`Đã thêm ${listTrack.length} bài hát vào hàng đợi!`);
    setModalVisible(false);
  };

  const handleAddTrackToQueue = (track) => {
    addTrackToQueue([track]);
    setSongModalVisible(false);
  };

  const handleTrackViewAlbum = (track) => {
    if (track.album && track.album.spotifyId) {
      const albumData = {
        ...track.album,
        artists: track.artists || [],
      };
      navigate("AlbumScreen", { album: JSON.stringify(albumData) });
      setSongModalVisible(false);
    } else {
      warning("Không tìm thấy thông tin album.");
    }
  };

  const handleTrackViewArtist = (track) => {
    if (!track.artists || track.artists.length === 0) {
      warning("Không tìm thấy thông tin nghệ sĩ.");
      return;
    }
    if (track.artists.length === 1) {
      navigate("ArtistScreen", { artist: JSON.stringify(track.artists[0]) });
      setSongModalVisible(false);
    } else {
      setSongModalVisible(false);
      setArtistModalVisible(true);
    }
  };

  const handleAddToAnotherPlaylist = async (playlistIds) => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    if (!listTrack || !listTrack.length) {
      warning('Playlist không có bài hát để thêm vào danh sách phát khác!');
      return;
    }

    if (!playlistIds || !playlistIds.length) {
      warning('Vui lòng chọn ít nhất một playlist để thêm bài hát!');
      return;
    }

    try {
      const trackIds = [];
      listTrack.forEach(track => {
        trackIds.push(track.spotifyId);
      });

      const response = await AddTracksToPlaylists({
        playlistIds: playlistIds,
        trackSpotifyIds: trackIds
      })

      if (response.success) {
        playlistIds.forEach(id => {
          updateTotalTracksInMyPlaylists(id, listTrack.length);
        });
        success('Đã thêm bài hát vào playlist thành công!');
      }

    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát vào playlist. Vui lòng thử lại sau.');
    }
  };

  const handleChangePrivacy = async () => {
    try {
      const response = await UpdatePlaylistPrivacy({ playlistId: currentPlaylist?.id });
      if (response.success) {
        updatePrivacy(currentPlaylist?.id);
        success('Đã cập nhật trạng thái playlist')
      }
    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thay đổi trạng thái playlist. Vui lòng thử lại sau.');
    }
  }

  const handleTrackAddToPlaylist = () => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    setSongModalVisible(false);
    setAddTrackToPlaylistModalVisible(true);
  };

  const handleConfirmAddTrackToPlaylists = async (playlistIds) => {
    if (isGuest) {
      info('Hãy đăng nhập để sử dụng chức năng này!');
      return;
    }
    if (!playlistIds || playlistIds.length === 0) {
      warning("Vui lòng chọn ít nhất một playlist.");
      return;
    }
    if (!selectedTrack) {
      error("Lỗi", "Không tìm thấy bài hát đã chọn.");
      return;
    }

    try {
      const trackSpotifyIds = [selectedTrack.spotifyId];
      const response = await AddTracksToPlaylists({
        playlistIds: playlistIds,
        trackSpotifyIds: trackSpotifyIds
      });

      if (response.success) {
        playlistIds.forEach(id => {
          updateTotalTracksInMyPlaylists(id, 1);
        });
        console.log('Đã thêm bài hát vào playlist thành công!');
      }
    } catch (err) {
      console.log(err);
      error('Lỗi', 'Đã có lỗi xảy ra khi thêm bài hát.');
    } finally {
      setAddTrackToPlaylistModalVisible(false);
    }
  };

  const savePlaylistToListeningHistory = () => {
    if (!currentPlaylist) return;
    if (isGuest) return;
    const payload = {
      itemType: 'playlist',
      itemId: currentPlaylist?.id || '',
      itemSpotifyId: currentPlaylist?.spotifyId,
      durationListened: 0
    };
    SaveToListeningHistory(payload).then((response) => {
      if (response.success) {
        if (response.updated) {
          console.log('Cập nhật lịch sử nghe playlist thành công:', response.data);
        } else {
          console.log('Tạo mới lịch sử nghe playlist thành công:', response.data);
          addListenHistory(response.data);
        }
      }
    });
  }

  const saveAlbumToListeningHistory = () => {
    if (isGuest) return;
    if (!currentAlbum) return;
    const payload = {
      itemType: 'album',
      itemId: currentAlbum?.id,
      itemSpotifyId: currentAlbum?.spotifyId,
      durationListened: 0
    };

    SaveToListeningHistory(payload).then((response) => {
      if (response.success) {
        if (response.updated) {
          console.log('Cập nhật lịch sử nghe album thành công:', response.data);
        } else {
          console.log('Tạo mới lịch sử nghe album thành công:', response.data);
          addListenHistory(response.data);
        }
      }
    });
  }

  const saveArtistToListeningHistory = () => {
    if (isGuest) return;
    const payload = {
      itemType: 'artist',
      itemId: currentArtist?.id,
      itemSpotifyId: currentArtist?.spotifyId,
      durationListened: 0
    }
    SaveToListeningHistory(payload).then((response) => {
      if (response.success) {
        if (response.updated) {
          console.log('Cập nhật lịch sử nghe artist thành công:', response.data);
        } else {
          console.log('Tạo mới lịch sử nghe artist thành công:', response.data);
          addListenHistory(response.data);
        }
      }
    })
  }

  return {
    selectedTrack,
    songModalVisible,
    artistModalVisible,
    addTrackToPlaylistModalVisible,

    handleSelectPlaylist,
    handleSelectAlbum,
    handleSelectArtist,
    handleTrackOptionPress,
    handlePlayPlaylist,
    handlePlayAlbum,
    handlePlayTrack,
    handleSharePlaylist,
    handleShareTrack,
    handleShareAlbum,
    handleShareArtist,
    handleAddFavorite,
    handleRemoveFavorite,
    handleAddToQueue,
    handleAddTrackToQueue,
    handleTrackViewAlbum,
    handleTrackViewArtist,
    handleTrackAddToPlaylist,
    handleAddToAnotherPlaylist,
    handleChangePrivacy,
    handleConfirmAddTrackToPlaylists,

    savePlaylistToListeningHistory,
    saveAlbumToListeningHistory,
    saveArtistToListeningHistory,
    setSelectedTrack,
    setSongModalVisible,
    setArtistModalVisible,
    setAddTrackToPlaylistModalVisible
  };
}