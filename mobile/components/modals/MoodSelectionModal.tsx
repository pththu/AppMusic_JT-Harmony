import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoardingStore } from '@/store/boardingStore';

const MOODS = [
  { id: 'happy', label: 'Vui vẻ 😊' },
  { id: 'sad', label: 'Buồn 😢' },
  { id: 'focused', label: 'Tập trung 🧠' },
  { id: 'chill', label: 'Chill 🍃' },
  { id: 'energetic', label: 'Năng động ⚡' },
  { id: 'romantic', label: 'Lãng mạn 🌹' },
  { id: 'sleepy', label: 'Buồn ngủ 😴' },
  { id: 'angry', label: 'Bực bội 😡' },
  { id: 'motivated', label: 'Có động lực 🚀' },
  { id: 'stressed', label: 'Căng thẳng 😰' },
  { id: 'nostalgic', label: 'Hoài niệm 🎞️' },
  { id: 'boring', label: 'Chán nản 😐' },
  { id: "heartbroken", label: 'Đau khổ 💔' },
];

export default function MoodSelectionModal({ visible, onClose, onConfirm }) {
  const colorScheme = useColorScheme();
  const selectedMood = useBoardingStore(state => state.selectedMood);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (visible && selectedMood) {
      setSelected(selectedMood);
    }
  }, [visible, selectedMood]);

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
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[70%] w-full">

          {/* Header Modal */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Tâm trạng hôm nay? ✨
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap pb-10">
              {MOODS.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleSelection(item)}
                    className={`mr-3 mb-4 px-5 py-3 rounded-full border ${isSelected
                      ? 'bg-green-500 border-green-500'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                  >
                    <Text className={`font-medium text-base ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Button */}
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