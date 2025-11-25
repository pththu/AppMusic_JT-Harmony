import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate } from '@/hooks/useNavigate';
import useAuthStore from '@/store/authStore';
import { useBoardingStore } from '@/store/boardingStore';
import { UpdateCompletedOnboarding } from '@/routes/ApiRouter';
import { MOODS } from '@/constants/data';

// chỉ chọn 1 tâm trạng
export default function MoodsScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const setSelectedMood = useBoardingStore(state => state.setSelectedMood);
  const [selected, setSelected] = useState(null);

  const toggleSelection = (id, label) => {
    setSelected(prev => prev?.id === id ? null : { id, label });
  };

  const handlePass = () => {
    user.completedOnboarding = true;
    UpdateCompletedOnboarding();
    updateUser(user);
    navigate('Main');
  }

  const handleNext = () => {
    setSelectedMood(selected);
    navigate('Activities')
  };

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
            Tâm trạng hôm nay? ✨
          </Text>
          <Text className="text-gray-500 mt-2">
            Chúng tôi sẽ gợi ý nhạc phù hợp với cảm xúc của bạn.
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap">
            {MOODS.map((item) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleSelection(item.id, item.label)}
                  className={`mr-3 mb-4 px-6 py-4 rounded-full border ${isSelected
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    }`}
                >
                  <Text className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

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