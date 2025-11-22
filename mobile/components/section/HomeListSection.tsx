import { View, Text, ActivityIndicator, useColorScheme, FlatList } from 'react-native'
import React from 'react'
import PlaylistItem from '../items/PlaylistItem';
import AlbumItem from '../items/AlbumItem';
import ArtistItemHome from '../artists/ArtistHomeItem';

interface ArtistItemHomeProps {
  title: string;
  data: any[];
  isLoading: boolean;
  onSelectAlbum: (item: any) => void;
  onSelectArtist: (item: any) => void;
  onSelectPlaylist: (item: any) => void;
  onSelectTrack: (item: any) => void;
}

const HomeListSection = React.memo(({ title, data, isLoading, onSelectAlbum, onSelectArtist, onSelectPlaylist, onSelectTrack }: ArtistItemHomeProps) => {
  const colorScheme = useColorScheme();
  return (
    <View className="mb-6">
      <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
        {title}
      </Text>
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải ...</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          initialNumToRender={5}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            if (item.type === 'playlist') {
              return (
                <PlaylistItem
                  item={item}
                  totalTrack={item.totalTracks || 0}
                  onPress={() => onSelectPlaylist(item)}
                />
              );
            } else if (item.type === 'album') {
              return (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => onSelectAlbum(item)}
                />
              );
            } else if (item.type === 'artist') {
              return (
                <ArtistItemHome
                  name={item.name}
                  image={item?.imageUrl || item?.imgUrl}
                  onPress={() => onSelectArtist(item)}
                />
              );
            }
          }}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  )
});

export default HomeListSection