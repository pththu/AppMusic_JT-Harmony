import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate } from '@/hooks/useNavigate';
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { AddFavoriteGenres, UpdateCompletedOnboarding } from '@/routes/ApiRouter';
import useAuthStore from '@/store/authStore';
import { useBoardingStore } from '@/store/boardingStore';
import { BROWSE_CATEGORIES } from '@/constants/data';
import LocalCategoryItem from '@/components/items/LocalCategoryItem';

export default function GenresScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const [selected, setSelected] = useState([]);
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const setSelectedGenres = useBoardingStore(state => state.setSelectedGenres);

  const toggleSelection = (id, name) => {
    setSelected(prev => prev.some(i => i.id === id) ? prev.filter(i => i.id !== id) : [...prev, { id, name }]);
  };

  const handlePass = () => {
    UpdateCompletedOnboarding();
    user.completedOnboarding = true;
    updateUser(user);
    navigate('Main');
  }

  const handleNext = async () => {
    const genresSelected = selected.map(i => i.name);
    setSelectedGenres(genresSelected);
    const res = await AddFavoriteGenres(genresSelected);
    user.favoritesGenres = res.data.favoritesGenres;
    updateUser(user);
    navigate('Moods');
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-5 pt-4">
        <View className="mb-6">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePass()}>
              <Text className="text-gray-400 font-medium">Bỏ qua</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Gu nhạc của bạn? 🎧
          </Text>
        </View>

        <FlatList
          data={BROWSE_CATEGORIES}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selected.some(i => i.id === item.id);
            return (
              <LocalCategoryItem
                name={item.name}
                color={item.color}
                colorEnd={item.colorEnd}
                icon={item.icon}
                isSelected={isSelected}
                onPress={() => toggleSelection(item.id, item.name)}
              />
            )
          }}
        />

        <View className="py-4">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-green-500 w-full py-4 rounded-full items-center shadow-lg shadow-green-500/30"
          >
            <Text className="text-white font-bold text-lg">Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}