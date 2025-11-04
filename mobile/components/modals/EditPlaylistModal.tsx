import { View, Text, useColorScheme, TouchableOpacity, Switch, Platform, Image } from 'react-native'
import React, { useState } from 'react'
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import { TextInput } from 'react-native';

const EditPlaylistModal = ({
  isModalVisible,
  setIsModalVisible,
  name,
  setName,
  description,
  setDescription,
  image,
  setImage,
  isPublic,
  setIsPublic,
  onPickImage,
  onUpdatePlaylist,
}) => {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#888" : "#666";

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        setName("");
        setDescription("");
        setImage(null);
        setIsPublic(false);
      }}
    >
      <SafeAreaView
        className={`${colorScheme === "dark" ? "bg-[#232023]" : "bg-white"
          } flex-1 px-4 justify-center`}
      >
        <View
          className={`${colorScheme === "dark" ? "bg-[#0E0C1F]" : "bg-white"
            } rounded-lg p-6 mx-4 shadow-lg`}
        >
          {/* Tiêu đề Modal */}
          <Text className="text-black self-center dark:text-white text-2xl font-bold mb-6">
            Chỉnh sửa danh sách phát
          </Text>

          {/* (MỚI) Chọn ảnh đại diện */}
          <View className="items-center mb-6">
            <TouchableOpacity className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-lg items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600"
              onPress={() => {
                onPickImage();
              }}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="w-24 h-24 rounded-lg"
                />
              ) : (
                <Icon name="camera-outline" size={40} color={iconColor} />
              )}
            </TouchableOpacity>
          </View>

          {/* Input Tên danh sách phát */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên danh sách phát"
            placeholderTextColor="#888"
            className="bg-gray-200 dark:bg-gray-800 rounded-md p-4 text-lg text-black dark:text-white mb-4" // <-- Sửa mb-8 thành mb-4
            autoFocus={true}
          />

          {/* (MỚI) Input Mô tả */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Thêm mô tả (không bắt buộc)"
            placeholderTextColor="#888"
            className="bg-gray-200 dark:bg-gray-800 rounded-md p-4 text-base text-black dark:text-white mb-8"
            multiline={true}
            numberOfLines={3}
            // Cần style inline cho chiều cao và text-align
            style={{ height: 100, textAlignVertical: "top" }}
          />

          {/* (MỚI) Toggle Công khai */}
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-black dark:text-white text-base">
              Công khai
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#22c55e" }} // Màu xanh lá khi bật
              thumbColor={
                isPublic
                  ? Platform.OS === "ios"
                    ? "white"
                    : "#f4f3f4"
                  : "#f4f3f4"
              }
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsPublic}
              value={isPublic}
            />
          </View>

          {/* Khu vực Nút bấm */}
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              className="py-3 px-6 rounded-md"
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="text-gray-500 dark:text-gray-400 text-base font-semibold">
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 py-3 px-6 rounded-md shadow"
              onPress={() => {
                setIsModalVisible(false);
                onUpdatePlaylist();
              }}
            >
              <Text className="text-white text-base font-semibold">Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default EditPlaylistModal