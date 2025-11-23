import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoardingStore } from '@/store/boardingStore';
import { useNavigate } from '@/hooks/useNavigate';
import useAuthStore from '@/store/authStore';
import { UpdateCompletedOnboarding } from '@/routes/ApiRouter';
import { GenerateFromActivity, GenerateFromMood } from '@/services/recommendationService';
import { ACTIVITIES } from '@/constants/data';

export default function ActivitiesScreen() {
  const router = useRouter();
  const { navigate } = useNavigate();
  const user = useAuthStore(state => state.user);
  const selectedMood = useBoardingStore(state => state.selectedMood);
  const updateUser = useAuthStore(state => state.updateUser);
  const setSelectedActivity = useBoardingStore(state => state.setSelectedActivity);
  const setRecommendBasedOnActivity = useBoardingStore(state => state.setRecommendBasedOnActivity);
  const setRecommendBasedOnMood = useBoardingStore(state => state.setRecommendBasedOnMood);
  const [selected, setSelected] = useState(null);

  const toggleSelection = (id, label) => {
    setSelected(prev => prev?.id === id ? null : { id, label });
  };

  const handleFinish = () => {
    setSelectedActivity(selected);

    const payload = selected?.label || '';
    GenerateFromActivity(payload).then(response => {
      if (response.success) {
        setRecommendBasedOnActivity(response.data);
      }
    });

    if (selectedMood) {
      GenerateFromMood(selectedMood.label).then(response => {
        if (response.success) {
          setRecommendBasedOnMood(response.data);
        }
      });
    }

    UpdateCompletedOnboarding();
    user.completedOnboarding = true;
    updateUser(user);
    navigate('Main');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-5 pt-4">
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Bạn đang làm gì? 🏃‍♂️
          </Text>
          <Text className="text-gray-500 mt-2">
            Chọn một hoạt động để bắt đầu nghe nhạc ngay.
          </Text>
        </View>

        <FlatList
          data={ACTIVITIES}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selected?.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => toggleSelection(item.id, item.label)}
                className={`w-[48%] mb-4 p-4 rounded-3xl border-2 flex-col items-center justify-center h-32 ${isSelected
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent'
                  }`}
              >
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color={isSelected ? '#22c55e' : '#9ca3af'}
                />
                <Text className={`mt-2 font-bold ${isSelected ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          }}
        />

        <View className="py-4">
          <TouchableOpacity
            onPress={handleFinish}
            className="bg-green-500 w-full py-4 rounded-full items-center shadow-lg shadow-green-500/30"
          >
            <Text className="text-white font-bold text-lg">Bắt đầu nghe nhạc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}