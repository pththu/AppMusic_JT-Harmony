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

const GENRES = [
  { id: "3", name: "POP", color: "#4facfe", colorEnd: "#e0c3fc", icon: "heart" },
  { id: "4", name: "K-POP", color: "#e8198b", colorEnd: "#f794a4", icon: "people" },
  { id: "6", name: "V-POP", color: "#ff0844", colorEnd: "#f9d423", icon: "star" },
  { id: "2", name: "C-POP", color: "#f5576c", colorEnd: "#fee140", icon: "snow" },
  { id: "5", name: "J-POP", color: "#e8198b", colorEnd: "#efefef", icon: "disc" },
  { id: "7", name: "RAP", color: "#c71d6f", colorEnd: "#96deda", icon: "mic" },
  { id: "12", name: "ROCK", color: "#e8198b", colorEnd: "#FFBD71", icon: "mic" },
  { id: "8", name: "HIP-HOP", color: "#2b5876", colorEnd: "#dad4ec", icon: "headset" },
  { id: "9", name: "DANCE", color: "#009efd", colorEnd: "#38f9d7", icon: "body" },
  { id: "10", name: "INDIE", color: "#a18cd1", colorEnd: "#FBC2EB", icon: "leaf" },
  { id: "1", name: "TAMIL", color: "#eacda3", colorEnd: "#94B447", icon: "musical-notes" },
  { id: "11", name: "JAZZ", color: "#FF7A7B", colorEnd: "#FFBD71", icon: "musical-note" },
];

const LocalCategoryItem = ({ name, color, colorEnd, icon, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 m-1.5"
      style={{ aspectRatio: 1.6 }}
    >
      <LinearGradient
        colors={[color, colorEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-lg p-3 justify-between overflow-hidden"
      >
        <View className="self-start">
          <Icon name={icon as any} size={28} color="#FFFFFF" />
        </View>
        <Text className="text-white font-bold text-base">
          {name}
        </Text>
        {isSelected && (
          <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

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
          data={GENRES}
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