import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueueStore } from '@/store/queueStore';
import { useTheme } from '@/components/ThemeContext';

export default function QueueScreen() {
  const [autoRecommendations, setAutoRecommendations] = useState(true);
  const { theme } = useTheme();
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  // Nhận dữ liệu bài hát đang phát và hàng đợi từ params
  // const { nowPlaying, queue } = route.params;
  const { nowPlaying, queue } = useQueueStore();

  // Kết hợp bài hát đang phát và danh sách hàng đợi
  const combinedQueue = nowPlaying
    ? [{ ...nowPlaying, isPlaying: true }, ...queue]
    : [...queue];

  const renderQueueItem = ({ item, index }) => {
    const isPlaying = item.isPlaying;

    const displayIndex = index > 0 ? index + 1 : null;
    return (
      <View
        key={`${item.id}-${index}`}
        className={`flex-row items-center py-2 ${index > 0 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}
      >
        <View className="mr-4">
        </View>
        <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-md" />
        <View className="ml-4 flex-1">
          <Text
            className={`font-semibold ${isPlaying ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}
          >
            {item.name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {item.artists?.map(a => a.name).join(', ')}
          </Text>
        </View>
        <TouchableOpacity>
          <Icon name="more-vert" size={24} color={secondaryIconColor} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] p-4">
      <View className="flex-row items-center mb-4">
        {/* Nút quay lại */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={primaryIconColor} />
        </TouchableOpacity>
      </View>

      {/* Hiển thị Now Playing riêng biệt */}
      {nowPlaying && (
        <View className="flex-row items-center mb-4">
          {nowPlaying.image && (
            <Image
              source={{ uri: nowPlaying.image }}
              className="w-12 h-12 rounded-md mr-4"
            />
          )}
          <View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Đang phát</Text>
            <Text className="text-black dark:text-white font-bold">{nowPlaying.name}</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {nowPlaying.artists?.map(a => a).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* FlatList chứa cả bài hát đang phát và hàng đợi */}
      <FlatList
        data={combinedQueue}
        renderItem={renderQueueItem}
        keyExtractor={(item, index) => item.spotifyId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <View className="flex-row justify-between items-center py-2 border-t border-gray-300 dark:border-gray-700">
            <Text className="text-black dark:text-white text-lg font-semibold">Danh sách chờ</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-black dark:text-white text-lg font-semibold">
              Gợi ý tự động
            </Text>
            <Switch
              value={autoRecommendations}
              onValueChange={setAutoRecommendations}
              trackColor={{ false: '#767577', true: '#34D399' }}
              thumbColor={autoRecommendations ? '#10B981' : '#f4f3f4'}
            />
          </View>
        )}
      />
    </View>
  );
}
