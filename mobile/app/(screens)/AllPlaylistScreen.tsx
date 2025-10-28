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
import { usePlayerStore } from "@/store/playerStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import * as ImagePicker from 'expo-image-picker';
import { CreatePlaylist } from "@/services/musicService";

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
          source={{ uri: item?.imageUrl }}
          className="w-16 h-16 rounded-md shadow-md"
        />
        <View className="flex-1 mx-4">
          <Text className="dark:text-white text-base" numberOfLines={1}>
            {item?.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm">
            {item?.totalTracks || 0} bài hát
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
  const myPlaylistsStore = usePlayerStore((state) => state.myPlaylists);
  const setMyPlaylistsStore = usePlayerStore((state) => state.setMyPlaylists);
  const addToMyPlaylists = usePlayerStore((state) => state.addToMyPlaylists);
  const setCurrentPlaylist = usePlayerStore((state) => state.setCurrentPlaylist);
  const { navigate } = useNavigate();
  const colorScheme = useColorScheme();
  const primaryIconColor = colorScheme === "dark" ? "white" : "black";
  const [activeTab, setActiveTab] = useState("myPlaylists");
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { success, error, warning } = useCustomAlert();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSelectPlaylist = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate("PlaylistScreen", { playlist: JSON.stringify(playlist) })
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      warning('Ứng dụng cần quyền truy cập thư viện ảnh!');
      return false;
    }
    return true;
  };

  const handlePickerImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      error('Quyền truy cập bị từ chối!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddPlaylist = async () => {
    setLoading(true);
    try {
      const payload = {
        image: image || null,
        name: name,
        description: description,
        isPublic: isPublic
      };
      const response = await CreatePlaylist(payload);
      console.log('response from ui', response);

      if (response.success) {
        setImage(null);
        success('Tạo playlist thành công!');
        setIsModalVisible(false);
        addToMyPlaylists(response.playlist);
      }
    } catch (error) {
      error('Không thể tạo playlist. Vui lòng thử lại!', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchSavedPlaylists = async () => {
      try {
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
          setMyPlaylistsStore(response.data);
        }
      } catch (error) {
        console.log("Lỗi khi lấy playlist của tôi:", error);
      }
    }

    fetchSavedPlaylists();
    fetchMyPlaylists();
    console.log('my playlist', myPlaylistsStore);
  }, []);

  const currentData = activeTab === "myPlaylists" ? myPlaylistsStore : savedPlaylists;

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

      {isModalVisible &&
        <AddPlaylistModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          image={image}
          setImage={setImage}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          onPickImage={handlePickerImage}
          onCreatePlaylist={handleAddPlaylist}
        />}
    </SafeAreaView>
  );
}