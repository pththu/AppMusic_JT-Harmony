import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { usePlayerStore } from "@/store/playerStore";

const PlaylistItem = ({ playlist, isSelected, onToggle, colorScheme }) => {
  const textColor = colorScheme === "dark" ? "text-white" : "text-black";
  const subTextColor = colorScheme === "dark" ? "text-gray-400" : "text-gray-600";
  const iconColor = colorScheme === "dark" ? "#22c55e" : "#22c55e";

  return (
    <Pressable
      className="flex-row items-center justify-between py-3 px-2"
      onPress={() => onToggle(playlist?.id)}
    >
      <View className="flex-row items-center flex-1">
        <Image
          source={{ uri: playlist?.imageUrl }}
          className="w-12 h-12 rounded-lg"
        />
        <View className="ml-3 flex-1">
          <Text className={`text-base font-medium ${textColor}`} numberOfLines={1}>
            {playlist?.name}
          </Text>
          <Text className={`text-sm ${subTextColor}`}>
            {playlist?.totalTracks || 0} bài hát
          </Text>
        </View>
      </View>

      <View className={`w-6 h-6 rounded-full border-2 justify-center items-center
          ${colorScheme === "dark" ? "border-green-400" : "bg-green-500"}`}>
        <View className={`w-3 h-3 rounded-full
            ${isSelected ? (colorScheme === "dark" ? "bg-green-400" : "bg-green-500") : "bg-transparent"}`} />
      </View>
    </Pressable>
  );
};

const AddToAnotherPlaylistModal = ({
  isVisible,
  setIsVisible,
  data,
  onAddToPlaylist,
  onCreateNewPlaylist = () => console.log('Tạo playlist mới'),
}) => {
  const colorScheme = useColorScheme();
  const myPlaylists = usePlayerStore((state) => state.myPlaylists);
  const isDarkMode = colorScheme === "dark";
  const modalBgColor = isDarkMode ? "bg-[#0B1215]" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const inputBgColor = isDarkMode ? "bg-[#1C2429]" : "bg-gray-100";
  const primaryColor = "#22c55e";
  const [searchText, setSearchText] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const handleToggleSelection = (id) => {
    setSelectedPlaylistId(prevId => (prevId === id ? null : id));
  };

  const handleAdd = () => {
    if (selectedPlaylistId) {
      onAddToPlaylist(selectedPlaylistId);
      setIsVisible(false);
    }
  };

  console.log(myPlaylists)

  return (
    <Modal
      transparent={true}
      animationType='slide'
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <Pressable
        onPress={() => setIsVisible(false)}
        className="flex-1 bg-black/50 justify-end"
      >
        <Pressable
          onPress={() => { }}
          className={`w-full h-[70%] ${modalBgColor} rounded-t-2xl p-5`}
        >
          <View className="flex-col pb-4 border-b border-gray-700/50">

            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-xl font-bold ${textColor}`}>
                Thêm vào Playlist
              </Text>
              <TouchableOpacity onPress={onCreateNewPlaylist} className="px-3 py-1 rounded-full" style={{ backgroundColor: primaryColor }}>
                <Text className="text-white text-sm font-semibold">
                  + Tạo mới
                </Text>
              </TouchableOpacity>
            </View>

            <View className={`flex-row items-center rounded-lg p-2`} style={{ backgroundColor: inputBgColor }}>
              <Icon name="search" size={20} color="#888" />
              <TextInput
                placeholder="Tìm kiếm danh sách phát..."
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                className={`ml-2 flex-1 text-base ${textColor}`}
              />
            </View>
          </View>

          {/* thông tin danh sách phát hiện tại */}
          <View className="flex-row items-end gap-2 mt-4 mb-2">
            <Image source={{ uri: data?.imageUrl }} className="w-16 h-16 rounded-lg" />
            <View>
              <Text className={`text-lg font-semibold mt-2 ${textColor}`} numberOfLines={1}>
                {data?.name}
              </Text>
              <Text className={`text-sm mb-1 ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                ({data?.totalTracks || 0} bài hát)
              </Text>
            </View>
          </View>

          <View>
            <Text className={`text-md font-semibold mt-4 mb-2 ${textColor}`}>
              Chọn danh sách phát
            </Text>
          </View>
          <View className="flex-1">
            <FlatList
              data={myPlaylists.filter(p => p.id !== data.id)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="mt-2 flex-1"
              renderItem={({ item }) => (
                <PlaylistItem
                  playlist={item}
                  isSelected={item.id === selectedPlaylistId}
                  onToggle={handleToggleSelection}
                  colorScheme={colorScheme}
                />
              )}
              ListEmptyComponent={() => (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-500">Không tìm thấy playlist nào.</Text>
                </View>
              )}
            />
          </View>

          {/* Các nút hành động */}
          <View className="flex-row mt-4 pt-4 border-t border-gray-700/50">
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="flex-1 py-3 items-center rounded-full mr-2"
              style={{ backgroundColor: isDarkMode ? '#333' : '#eee' }}
            >
              <Text className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold`}>
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              disabled={!selectedPlaylistId}
              className="flex-1 py-3 items-center rounded-full ml-2"
              style={{
                backgroundColor: selectedPlaylistId ? primaryColor : (isDarkMode ? '#0f4021' : '#a7f3d0')
              }}
            >
              <Text className="text-white font-bold">
                Thêm ({selectedPlaylistId ? 1 : 0})
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddToAnotherPlaylistModal;