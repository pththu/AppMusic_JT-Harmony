import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoardingStore } from '@/store/boardingStore';

const ACTIVITIES = [
  { id: 'workout', label: 'Tập luyện', icon: 'barbell-outline' },
  { id: 'study', label: 'Học tập', icon: 'school-outline' },
  { id: 'commute', label: 'Di chuyển', icon: 'bus-outline' },
  { id: 'sleep', label: 'Ngủ', icon: 'moon-outline' },
  { id: 'party', label: 'Tiệc tùng', icon: 'musical-notes-outline' },
  { id: 'gaming', label: 'Chơi game', icon: 'game-controller-outline' },
  { id: 'relax', label: 'Thư giãn', icon: 'leaf-outline' },
  { id: 'focus', label: 'Tập trung', icon: 'eye-outline' },
  { id: 'running', label: 'Chạy bộ', icon: 'walk-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'body-outline' },
  { id: 'cooking', label: 'Nấu ăn', icon: 'restaurant-outline' },
  { id: 'reading', label: 'Đọc sách', icon: 'book-outline' },
  { id: 'meditation', label: 'Thiền', icon: 'medkit-outline' },
  { id: 'driving', label: 'Lái xe', icon: 'car-outline' },
];

export default function ActivitySelectionModal({ visible, onClose, onConfirm }) {
  const colorScheme = useColorScheme();
  const selectedActivity = useBoardingStore(state => state.selectedActivity);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (visible && selectedActivity) {
      setSelected(selectedActivity);
    }
  }, [visible, selectedActivity]);

  const toggleSelection = (item: any) => {
    setSelected((prev: any) => prev?.id === item.id ? null : item);
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[75%] w-full">

          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Bạn đang làm gì? 🏃‍♂️
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <View className="flex-1 p-5">
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
                    onPress={() => toggleSelection(item)}
                    className={`w-[48%] mb-4 p-4 rounded-3xl border-2 flex-col items-center justify-center h-28 ${isSelected
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent'
                      }`}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color={isSelected ? '#22c55e' : '#9ca3af'}
                    />
                    <Text className={`mt-2 font-bold text-center ${isSelected ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )
              }}
            />
          </View>

          {/* Footer */}
          <View className="p-5 border-t border-gray-100 dark:border-gray-800">
            <TouchableOpacity
              onPress={handleConfirm}
              className={`w-full py-4 rounded-full items-center shadow-lg ${selected ? 'bg-green-500 shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              disabled={!selected}
            >
              <Text className="text-white font-bold text-lg">Cập nhật</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}