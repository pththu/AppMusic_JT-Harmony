import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GetArtistsForYou } from '@/services/musicService';
import { FollowArtist } from '@/services/followService';
import { useNavigate } from '@/hooks/useNavigate';
import { useArtistStore } from '@/store/artistStore';
import useAuthStore from '@/store/authStore';
import { UpdateCompletedOnboarding } from '@/routes/ApiRouter';

export default function ArtistScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const user = useAuthStore(state => state.user);
  const addArtistFollowed = useArtistStore(state => state.addArtistFollowed);
  const updateUser = useAuthStore(state => state.updateUser);
  const [selected, setSelected] = useState<string[]>([]);
  const artistNames = ["BTS", "buitruonglinh", "Hoàng Dũng", "Taylor Swift", "Sơn Tùng M-TP", "Đen Vâu", "Justin Bieber", "Mono", "Charlie Puth", "HIEUTHUHAI", "Chillies", "Binz"];
  const [artists, setArtists] = useState([]);

  const toggleSelection = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePass = () => {
    UpdateCompletedOnboarding();
    user.completedOnboarding = true;
    updateUser(user);
    navigate('Main');
  }

  const handleNext = () => {
    handleFollow();
    navigate('Genres')
  };

  const handleFollow = async () => {
    try {
      for (const spotifyId of selected) {
        const response = await FollowArtist({ artistSpotifyId: spotifyId });
        if (response.success) {
          addArtistFollowed(response.data);
        }
      }
    } catch (error) {
      console.log('Error following artists: ', error);
    }
  };

  const fetchArtistData = async () => {
    try {
      const response = await GetArtistsForYou({ artistNames: artistNames });
      if (response.success) {
        setArtists(response.data);
      }
    } catch (error) {
      console.log('Error fetching artists: ', error);
    }
  }

  useEffect(() => {
    fetchArtistData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-5 pt-4">
        <View className="mb-6">
          <TouchableOpacity onPress={() => handlePass()} className="self-end">
            <Text className="text-gray-400 font-medium">Bỏ qua</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            Nghệ sĩ yêu thích 🎤
          </Text>
          <Text className="text-gray-500 mt-2 text-base">
            Chọn nghệ sĩ bạn muốn theo dõi để nhận thông báo mới nhất.
          </Text>
        </View>

        <FlatList
          data={artists}
          numColumns={3}
          keyExtractor={(item, index) => item.id + '-' + index + '-' + item.spotifyId}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.spotifyId);
            return (
              <TouchableOpacity
                onPress={() => toggleSelection(item.spotifyId)}
                className="items-center mb-6 w-[30%]"
              >
                <View className={`relative p-1 rounded-full border-2 ${isSelected ? 'border-green-500' : 'border-transparent'}`}>
                  <Image
                    source={{ uri: item?.imageUrl }}
                    className="w-20 h-20 rounded-full bg-gray-200"
                  />
                  {isSelected && (
                    <View className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white dark:border-black">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </View>
                <Text className="mt-2 text-center text-sm font-medium text-gray-800 dark:text-gray-200" numberOfLines={1}>
                  {item?.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <View className="py-4 border-t border-gray-100 dark:border-gray-800">
          <TouchableOpacity
            onPress={handleNext}
            className={`w-full py-4 rounded-full items-center shadow-sm bg-green-500`}
          >
            <Text className={`font-bold text-lg text-white`}>
              Tiếp tục ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}