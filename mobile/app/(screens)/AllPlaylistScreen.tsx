import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  useColorScheme,
  Animated,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { playlistData } from "@/constants/data";
import { useNavigate } from "@/hooks/useNavigate";
import { router } from "expo-router";
import useAuthStore from "@/store/authStore";
import { GetMyPlaylists, GetPlaylistsForYou } from "@/services/musicService";
import { set } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal } from "react-native";
import AddPlaylistModal from "@/components/modals/AddPlaylistModal";

const PlaylistItem = ({ item, index, onPress, primaryIconColor }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      // Làm mờ
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      // Trượt lên
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, translateYAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Pressable
        className="flex-row w-full items-center justify-between mb-4"
        onPress={() => onPress(item)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-16 h-16 rounded-md shadow-md"
        />
        <View className="flex-1 mx-4">
          <Text className="dark:text-white text-base" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm">
            {item.totalTracks || 0} bài hát
          </Text>
        </View>
        <Pressable className="">
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default function AllPlaylistScreen() {
  const user = useAuthStore((state) => state.user);
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const primaryIconColor = colorScheme === "dark" ? "white" : "black";
  const [activeTab, setActiveTab] = useState("myPlaylists");
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectPlaylist = (playlist) => navigate("PlaylistScreen", { playlist: JSON.stringify(playlist) });

  useEffect(() => {
    const fetchSavedPlaylists = async () => {
      try {
        // Giả sử bạn có hàm API để lấy playlist đã lưu của người dùng
        const response = await GetPlaylistsForYou(["bts", "agustd", "jungkook"]);
        if (response.success) {
          setSavedPlaylists(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy playlist đã lưu:", error);
      }
    };

    const fetchMyPlaylists = async () => {
      try {
        const response = await GetMyPlaylists();
        if (response.success) {
          setMyPlaylists(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy playlist của tôi:", error);
      }
    }

    fetchSavedPlaylists();
    fetchMyPlaylists();
  }, []);

  const currentData = activeTab === "myPlaylists" ? myPlaylists : savedPlaylists;

  const TabButton = ({ title, tabName }) => {
    const isActive = activeTab === tabName;
    return (
      <TouchableOpacity
        onPress={() => setActiveTab(tabName)}
        className={`flex-1 items-center py-3 "
          }`}
      >
        <Text
          className={`font-semibold ${isActive
            ? `${colorScheme === "dark" ? "text-white" : "text-black"}`
            : "text-gray-400"
            }`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4`}>
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={primaryIconColor} />
        </TouchableOpacity>
        <View>
          <Text className="text-black dark:text-white text-xl font-semibold mb-1">
            Danh sách phát
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {user.fullName}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-4">
        <View className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 flex-row items-center">
          <Icon name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            className="ml-2 flex-1 text-black dark:text-white"
          />
        </View>
        <TouchableOpacity className="ml-4">
          <Icon name="swap-vertical" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-4">
        <TabButton title="Của tôi" tabName="myPlaylists" />
        <TabButton title="Đã lưu" tabName="saved" />
      </View>

      <Text className="text-gray-600 dark:text-gray-400 mb-4">
        {currentData.length} playlists
      </Text>

      {currentData ? (
        <FlatList
          data={currentData}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <PlaylistItem
              item={item}
              index={index}
              onPress={handleSelectPlaylist}
              primaryIconColor={primaryIconColor}
            />
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="text-gray-600 dark:text-gray-400">Đang tải danh sách phát...</Text>
        </View>
      )}

      {activeTab === "myPlaylists" && (
        <View className="absolute bottom-6 right-6 z-10 justify-end items-end p-6">
          <TouchableOpacity
            className=" bg-green-500 p-4 rounded-full shadow-lg"
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {isModalVisible && <AddPlaylistModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />}
    </SafeAreaView>
  );
}