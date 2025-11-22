import React, { useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigate } from '@/hooks/useNavigate';
import LibraryItemButton from '@/components/button/LibraryItemButton';
import SongItem from '@/components/items/SongItem';
import { usePlayerStore } from '@/store/playerStore';
import { trackData, albumData } from "@/constants/data";
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";
import { useHistoriesStore } from '@/store/historiesStore';
import AlbumItem from '@/components/items/AlbumItem';
import PlaylistItem from '@/components/items/PlaylistItem';
import { useFollowStore } from '@/store/followStore';
import ArtistItem from '@/components/artists/ArtistItem';
import { ScrollView } from 'react-native';
import useAuthStore from '@/store/authStore';

const libraryItems = [
  {
    id: '1',
    title: 'Bài hát yêu thích',
    icon: 'favorite',
    screen: 'LikedSongsScreen',
    color: '#ffb5b5',
  },
  {
    id: '2',
    title: 'Nghệ sĩ',
    icon: 'person',
    screen: 'ArtistsFollowingScreen',
    color: '#FFA500',
  },
  {
    id: '3',
    title: 'Mục yêu thích',
    icon: 'list',
    screen: 'AllPlaylistScreen',
    color: '#82d8ff',
  },
  {
    id: '4',
    title: 'Đã tải xuống',
    icon: 'cloud-download',
    screen: 'DownloadsScreen',
    color: '#88d89a',
  },
];

export default function YourLibraryScreen() {

  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();

  const isGuest = useAuthStore((state) => state.isGuest);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const listenHistory = useHistoriesStore((state) => state.listenHistory);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const albumList = useMemo(() => {
    const albums = listenHistory
      .filter((item) => item.itemType === 'album')
      .map((item) => item);
    return albums;
  }, [listenHistory]);

  const playlistList = useMemo(() => {
    const playlists = listenHistory
      .filter((item) => item.itemType === 'playlist')
      .map((item) => item);
    return playlists;
  }, [listenHistory]);

  const artistList = useMemo(() => {
    const artists = listenHistory
      .filter((item) => item.itemType === 'artist')
      .map((item) => item);
    return artists;
  }, [listenHistory]);

  const trackList = useMemo(() => {
    const tracks = listenHistory
      .filter((item) => item.itemType === 'track')
      .map((item) => item);
    return tracks;
  }, [listenHistory]);

  const handleSelectSong = (track, index) => {

  };

  const handleSelectAlbum = (album) => {
    setCurrentAlbum(album);
    navigate("AlbumScreen");
  };

  const handleSelectArtist = (artist) => {
    setCurrentArtist(artist);
    navigate("ArtistScreen");
  }

  const handleSelectPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate("PlaylistScreen");
  };



  return (
    <SafeAreaView
      className={`flex-1 px-4 pt-4 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}
      style={{ paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
        <Text className="text-black dark:text-white text-2xl font-semibold mb-4">
          Thư viện của bạn
        </Text>
        <View className="mb-6  flex-row gap-2 flex-wrap justify-between p-1">
          {libraryItems?.map((item, index) => (
            <LibraryItemButton
              key={index.toString()}
              title={item.title}
              icon={item.icon}
              onPress={() => navigate(item.screen)}
              color={item.color}
            />
          ))}
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-black dark:text-white text-xl font-semibold">
            Gần đây
          </Text>
          {
            listenHistory.length > 0 && (
              <TouchableOpacity className='p-4' onPress={() => navigate("ListenHistoryScreen")}>
                <Text className="text-gray-400 dark:text-gray-300">Xem thêm</Text>
              </TouchableOpacity>
            )
          }
        </View>
        {
          isGuest ? (
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-10">
              Vui lòng đăng nhập để xem lịch sử nghe của bạn.
            </Text>
          ) : (
            <>
              {
                listenHistory.length > 0 ? (
                  <>
                    <View className='flex-1'>
                      {
                        trackList.length > 0 && (
                          <Text className="text-black dark:text-white text-lg mb-2 italic">
                            Bài hát
                          </Text>
                        )
                      }
                      {trackList.slice(0, 5).map((item, index) => (
                        <SongItem
                          key={item.id}
                          item={item.item}
                          image={item.item?.imageUrl || ""}
                          onPress={() => handleSelectSong(item, index)}
                          onOptionsPress={() => { }}
                          isHistoryItem={true}
                          updateAt={new Date(item.updatedAt)}
                        />
                      ))}
                    </View>
                    <View>
                      {
                        albumList.length > 0 && (
                          <Text className="text-black dark:text-white text-lg mb-2 italic">
                            Album
                          </Text>
                        )
                      }
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {albumList.slice(0, 5).map((item, index) => (
                          <AlbumItem
                            key={item.id}
                            title={item.item.name}
                            image={item.item?.imageUrl || ""}
                            onPress={() => handleSelectAlbum(item.item)}
                          />
                        ))}
                      </ScrollView>
                    </View>
                    <View>
                      {
                        playlistList.length > 0 && (
                          <Text className="text-black dark:text-white text-lg mb-2 italic">
                            Playlist
                          </Text>
                        )
                      }
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {playlistList.slice(0, 5).map((item, index) => (
                          <PlaylistItem
                            key={item.id}
                            item={item.item}
                            totalTrack={item.item.totalTracks || 0}
                            onPress={() => handleSelectPlaylist(item.item)}
                          />
                        ))}
                      </ScrollView>
                    </View>
                    <View className="">
                      {
                        artistList.length > 0 && (
                          <Text className="text-black dark:text-white text-lg mb-2 italic">
                            Nghệ sĩ
                          </Text>
                        )
                      }
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {artistList.slice(0, 5).map((item, index) => (
                          <ArtistItem
                            key={item.id}
                            name={item.item.name}
                            image={item.item?.imageUrl || item.item?.imgUrl}
                            onPress={() => handleSelectArtist(item.item)}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  </>
                ) : (
                  <Text className="text-gray-500 dark:text-gray-400 text-center mt-10">
                    Bạn không có lịch sử nghe gần đây.
                  </Text>
                )
              }
            </>
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}