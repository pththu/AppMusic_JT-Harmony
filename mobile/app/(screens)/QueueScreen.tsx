import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { usePlayerStore } from '@/store/playerStore';
import { Pressable } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useCustomAlert } from '@/hooks/useCustomAlert';

export default function QueueScreen() {
  const { info, error, success } = useCustomAlert();

  const queue = usePlayerStore((state) => state.queue);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const clearQueue = usePlayerStore((state) => state.clearQueue);
  const removeTrackFromQueue = usePlayerStore((state) => state.removeTrackFromQueue);
  // console.log('queue', queue);

  const [autoRecommendations, setAutoRecommendations] = useState(true);
  const colorScheme = useColorScheme();
  const primaryIconColor = colorScheme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = colorScheme === 'dark' ? '#888' : 'gray';

  const handleRemoveTrackFromQueue = (track) => {
    try {
      removeTrackFromQueue([track]);
    } catch (err) {
      console.log('Error removing track from queue: ', err);
      error('Lỗi khi xóa bài hát khỏi danh sách chờ');
    }
  };

  const renderQueueItem = ({ item, index }) => {
    return (
      <View
        key={`${item.id}-${index}`}
        className={`flex-row items-center py-2 border-b ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
      >
        <View className="mr-4">
        </View>
        <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-md" />
        <View className="ml-4 flex-1">
          <Text
            className={`font-semibold ${colorScheme === 'dark' ? ' text-white' : 'text-black'}`}
          >
            {item.name}
          </Text>
          <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            {item.artists?.map(a => a.name).join(', ')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleRemoveTrackFromQueue(item)}>
          <SimpleLineIcons name="close" color={colorScheme === 'dark' ? '#888' : 'black'} size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white '} p-4`}>
      <View className="flex-row items-center mb-4">
        {/* Nút quay lại */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={primaryIconColor} />
        </TouchableOpacity>
      </View>

      {currentTrack && (
        <View className="flex-row items-center mb-4">
          {currentTrack?.imageUrl && (
            <Image
              source={{ uri: currentTrack?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1761533935/kltn/playlist_default.png' }}
              className="w-12 h-12 rounded-md mr-4"
            />
          )}
          <View>
            <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Đang phát</Text>
            <Text className={`${colorScheme === 'dark' ? 'text-green-400' : 'text-green-700'} font-semibold`}>{currentTrack.name}</Text>
            <Text className={`${colorScheme === 'dark' ? 'text-green-400' : 'text-green-700'} text-sm`}>
              {currentTrack?.artists?.map(a => a.name).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* FlatList chứa cả bài hát đang phát và hàng đợi */}
      <FlatList
        data={queue}
        renderItem={renderQueueItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <View className={`flex-row justify-between items-center border-t ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-300 '}`}>
            <View className={`flex-row justify-between items-center py-2`}>
              <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>Danh sách chờ</Text>
            </View>
            <Pressable className="p-2" onPress={() => {
              clearQueue();
            }}>
              <Text className={`text-red-500 font-semibold`}>
                Xoá hàng đợi
              </Text>
            </Pressable>
          </View>

        )
        }
        ListFooterComponent={() => (
          <View className="flex-row justify-between items-center mt-4">
            <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-lg font-semibold`}>
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
    </View >
  );
}
