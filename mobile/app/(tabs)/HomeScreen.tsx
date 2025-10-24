import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { playlistData, albumData, trackData, artistData } from "@/constants/data";
import ArtistItem from "@/components/artists/ArtistItem";
import { useCustomAlert } from "@/hooks/useCustomAlert";

import { useTheme } from "@/components/ThemeContext";

const tabs = [
  { id: "forYou", label: "Dành cho bạn" },
  { id: "trending", label: "Thịnh hành" }
];

export default function HomeScreen() {
  const { navigate } = useNavigate();
  const { theme } = useTheme();
  const { success, error } = useCustomAlert();
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState("forYou");
  const animation = useRef(new Animated.Value(0)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTranslateY = useRef(new Animated.Value(20)).current;
  const [hasNotification] = useState(true);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabPositions, setTabPositions] = useState<number[]>([]);
  const [tabsLayouted, setTabsLayouted] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(greetingOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(greetingTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [greetingOpacity, greetingTranslateY]);

  useEffect(() => {
    if (tabWidths.length === tabs.length) {
      setTabsLayouted(true);
    }
  }, [tabWidths]);

  const onTabPress = (tabId: string) => {
    const index = tabs.findIndex((tab) => tab.id === tabId);
    if (tabId === activeTab) return;

    Animated.timing(animation, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setActiveTab(tabId);
  };

  const onLayout = (event: any, index: number) => {
    const { width, x } = event.nativeEvent.layout;
    setTabWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
    setTabPositions((prev) => {
      const newPositions = [...prev];
      newPositions[index] = x;
      return newPositions;
    });
  };

  const tabUnderlineLeft = tabsLayouted
    ? animation.interpolate({
      inputRange: tabs.map((_, i) => i),
      outputRange: tabPositions.map((pos) => pos - 20),
    })
    : 0;

  const tabUnderlineWidth = tabsLayouted
    ? animation.interpolate({
      inputRange: tabs.map((_, i) => i),
      outputRange: tabWidths,
    })
    : 0;

  const iconColor = theme === 'light' ? '#000' : '#fff';

  return (
    <Animated.ScrollView className="flex-1 bg-white dark:bg-[#0E0C1F]">
      <View className="flex-row justify-between items-center mx-5 mt-10 mb-2">
        <Animated.Text
          className="text-black dark:text-white text-2xl font-bold"
          style={{
            opacity: greetingOpacity,
            transform: [{ translateY: greetingTranslateY }],
          }}
        >
          Hi, {String(user?.fullName || user?.username)} 👋
        </Animated.Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative">
            <Icon name="notifications-outline" size={28} color={iconColor} />
            {hasNotification && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("Profile")}>
            <Image
              source={{ uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="relative mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              onLayout={(event) => onLayout(event, index)}
              className="mr-5 py-2"
            >
              <Text
                className={`text-xl font-bold ${activeTab === tab.id
                  ? "text-black dark:text-white font-bold"
                  : "text-gray-500 dark:text-gray-500 font-normal"
                  }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {tabsLayouted && (
          <Animated.View
            className="h-0.5 bg-black dark:bg-white absolute -bottom-2"
            style={{
              width: tabUnderlineWidth,
              transform: [{ translateX: tabUnderlineLeft }],
            }}
          />
        )}
      </View>

      {activeTab === "forYou" && (
        <ScrollView className="px-5">
          {/* Featuring Today Card */}
          <View className="mb-6 w-full h-64 rounded-lg overflow-hidden">
            <ImageBackground
              source={{ uri: playlistData[7].imageUrl }}
              className="w-full h-full justify-end"
              resizeMode="cover"
            >
              <View className="flex-1 items-end justify-end bg-black/50">
                <View className="p-4">
                  <Text className="text-white text-xl font-bold">
                    {playlistData[5].name}
                  </Text>
                  <Text className="text-gray-300 text-wrap text-sm">{playlistData[5].description}</Text>
                  <CustomButton
                    title="Play"
                    onPress={() => { }}
                    className="mt-2 bg-green-500 px-4 py-2 rounded-full"
                  />
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Recently Played Horizontal List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Danh sách phát đề xuất cho bạn
              </Text>
              <CustomButton title="Xem thêm" onPress={() => { }} />
            </View>
            <FlatList
              horizontal
              data={playlistData}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Mixes for you Horizontal List */}
          <View className="mb-6">
            <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              Album được chọn lọc dành cho bạn
            </Text>
            <FlatList
              horizontal
              data={albumData}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      )}
      {activeTab === "trending" && (
        <ScrollView className="px-5">
          {/* Recently Played Horizontal List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Danh sách phát thịnh hành
              </Text>
            </View>
            <FlatList
              horizontal
              data={playlistData}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                Album phổ biến
              </Text>
            </View>
            <FlatList
              horizontal
              data={playlistData}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.name}
                  image={item.imageUrl}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View className="">
            <Text className={`text-${colorScheme === "dark" ? "white" : "black"} font-bold text-lg ml-3 mb-3`}>
              Trending artists
            </Text>
            <FlatList
              data={artistData}
              horizontal
              keyExtractor={(item) => item.spotifyId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 12,
                marginBottom: 20,
              }}
              renderItem={({ item }) => (
                <ArtistItem
                  name={item.name}
                  image={item.imageUrl}
                  onPress={() =>
                    navigate("ArtistScreen", { artist: JSON.stringify(item) })
                  }
                />
              )}
            />
          </View>
        </ScrollView>
      )}
    </Animated.ScrollView>
  );
}
