import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHistoriesStore } from '@/store/historiesStore';
import { usePlayerStore } from '@/store/playerStore';
import { useFollowStore } from '@/store/followStore';
import { useNavigate } from '@/hooks/useNavigate';
import SongItem from '@/components/items/SongItem';
import AlbumItem from '@/components/items/AlbumItem';
import PlaylistItem from '@/components/items/PlaylistItem';
import { MINI_PLAYER_HEIGHT } from "@/components/player/MiniPlayer";

const TabButton = ({ title, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 items-center py-3 border-b-2 ${active
      ? 'border-green-500' 
      : 'border-transparent'
      }`}
  >
    <Text className={`text-base font-semibold ${active
      ? 'text-green-600'
      : 'text-gray-500 dark:text-gray-400'
      }`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const HistoryArtistItem = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-2 space-x-4 gap-4"
    activeOpacity={0.7}
  >
    <Image
      source={{ uri: item?.imageUrl || item?.imgUrl || "https://via.placeholder.com/150" }}
      className="w-14 h-14 rounded-full"
      resizeMode="cover"
    />
    <Text className="text-black dark:text-white text-base font-medium flex-1" numberOfLines={1}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

export default function ListenHistoryScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('track'); // track, album, playlist, artist

  const listenHistory = useHistoriesStore((state) => state.listenHistory);
  const isMiniPlayerVisible = usePlayerStore((state) => state.isMiniPlayerVisible);
  const listTrack = usePlayerStore((state) => state.listTrack);
  const setListTrack = usePlayerStore((state) => state.setListTrack);
  const setCurrentAlbum = usePlayerStore((state) => state.setCurrentAlbum);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const setCurrentArtist = useFollowStore((state) => state.setCurrentArtist);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);

  const iconColor = colorScheme === 'dark' ? 'white' : 'black';

  const albumList = useMemo(() => {
    return listenHistory
      .filter((item) => item.itemType === 'album')
      .map((item) => item);
  }, [listenHistory]);

  const playlistList = useMemo(() => {
    return listenHistory
      .filter((item) => item.itemType === 'playlist')
      .map((item) => item);
  }, [listenHistory]);

  const artistList = useMemo(() => {
    return listenHistory
      .filter((item) => item.itemType === 'artist')
      .map((item) => item);
  }, [listenHistory]);

  const trackList = useMemo(() => {
    return listenHistory
      .filter((item) => item.itemType === 'track')
      .map((item) => item);
  }, [listenHistory]);

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

  const handlePlayTrack = async (track, index) => {
    setListTrack(trackList.map(item => item.item));
    const list = trackList.map(item => item.item);
    playPlaylist(list, index);
    const queueData = list.filter((item, i) => {
      if (i > index)
        return item;
    });
    setCurrentTrack(track);
    setQueue(queueData);
  };

  const renderTrackItem = ({ item, index }) => (
    <View className='px-2'>
      <SongItem
        item={item.item}
        image={item.item?.imageUrl || ""}
        onPress={() => handlePlayTrack(item.item, index)}
        onOptionsPress={() => { }}
        isHistoryItem={true}
        updateAt={new Date(item.updatedAt)}
      />
    </View>
  );

  const renderAlbumItem = ({ item }) => (
    <View className="">
      <AlbumItem
        title={item.item.name}
        image={item.item?.imageUrl || ""}
        onPress={() => handleSelectAlbum(item.item)}
      />
    </View>
  );

  const renderPlaylistItem = ({ item }) => (
    <View className="py-2">
      <PlaylistItem
        item={item.item}
        totalTrack={item.item.totalTracks || 0}
        onPress={() => handleSelectPlaylist(item.item)}
      />
    </View>
  );

  const renderArtistItem = ({ item }) => (
    <HistoryArtistItem
      item={item.item}
      onPress={() => handleSelectArtist(item.item)}
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'track':
        return (
          <FlatList
            key="track"
            data={trackList}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        );
      case 'album':
        return (
          <FlatList
            key="album"
            data={albumList}
            renderItem={renderAlbumItem}
            keyExtractor={(item) => item.id}
            numColumns={3} // Grid 3 cột
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
          />
        );
      case 'playlist':
        return (
          <FlatList
            key="playlist"
            data={playlistList}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            numColumns={3} // Grid 3 cột
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 6,
              paddingBottom: 20
            }}
          />
        );
      case 'artist':
        return (
          <FlatList
            key="artist"
            data={artistList}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}
      style={{ paddingBottom: isMiniPlayerVisible ? MINI_PLAYER_HEIGHT : 0 }}
    >
      {/* Header */}
      <View className="flex-row items-center px-4">
        <TouchableOpacity onPress={() => router.back()} className="p-1 mr-4">
          <Icon name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-black dark:text-white">
          Xem lại lịch sử
        </Text>
      </View>

      {/* Tab Bar */}
      <View className="flex-row justify-around border-b border-gray-200 dark:border-gray-800">
        <TabButton title="Bài hát" active={activeTab === 'track'} onPress={() => setActiveTab('track')} />
        <TabButton title="Album" active={activeTab === 'album'} onPress={() => setActiveTab('album')} />
        <TabButton title="Playlist" active={activeTab === 'playlist'} onPress={() => setActiveTab('playlist')} />
        <TabButton title="Nghệ sĩ" active={activeTab === 'artist'} onPress={() => setActiveTab('artist')} />
      </View>

      {/* Content */}
      <View className="flex-1 p-2 pt-2">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}