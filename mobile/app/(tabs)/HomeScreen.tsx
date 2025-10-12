import CustomButton from "@/components/custom/CustomButton";
import AlbumItem from "@/components/items/AlbumItem";
import SongItem from "@/components/items/SongItem";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from "@/store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

// Dữ liệu mockup đã được thêm image URL
const tabs = [
  { id: "forYou", label: "For you" },
  { id: "relax", label: "Relax" },
  { id: "workout", label: "Workout" },
  { id: "travel", label: "Travel" },
];

const forYouData = [
  {
    id: "1",
    title: "Featuring Today",
    content: "New ENGLISH SONGS",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    title: "Recently Played",
    content: "Your recent songs",
    horizontalData: [
      {
        id: "2.1",
        title: "Album A",
        image:
          "https://images.pexels.com/photos/208696/pexels-photo-208696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      {
        id: "2.2",
        title: "Album B",
        image:
          "https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      {
        id: "2.3",
        title: "Album C",
        image:
          "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    ],
  },
  {
    id: "3",
    title: "Mixes for you",
    content: "Personalized mixes",
    mixes: [
      {
        id: "3.1",
        title: "Daily Mix 1",
        image:
          "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      {
        id: "3.2",
        title: "Daily Mix 2",
        image:
          "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
      {
        id: "3.3",
        title: "Daily Mix 3",
        image:
          "https://images.pexels.com/photos/33545/sunrise-festival-page-rock.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      },
    ],
  },
];

const relaxData = [
  {
    id: "1",
    title: "Today's Refreshing Song-Recommendations",
    content: "Peace - 22 songs",
    image:
      "https://images.pexels.com/photos/268415/pexels-photo-268415.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    title: "Weightless",
    artist: "Marconi Union",
    image:
      "https://images.pexels.com/photos/1037993/pexels-photo-1037993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "3",
    title: "Nothing I Can",
    artist: "Helios",
    image:
      "https://images.pexels.com/photos/1381670/pexels-photo-1381670.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "4",
    title: "Small Memory",
    artist: "Jon Hopkins - Insides",
    image:
      "https://images.pexels.com/photos/1672635/pexels-photo-1672635.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "5",
    title: "Close To Home",
    artist: "Lyle Mays",
    image:
      "https://images.pexels.com/photos/972665/pexels-photo-972665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

export default function HomeScreen() {

  const { navigate } = useNavigate();
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
      outputRange: tabPositions,
    })
    : 0;

  const tabUnderlineWidth = tabsLayouted
    ? animation.interpolate({
      inputRange: tabs.map((_, i) => i),
      outputRange: tabWidths,
    })
    : 0;

  const containerBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [colorScheme === "dark" ? "#000" : "#fff", colorScheme === "dark" ? "#121212" : "#f5f5f5"],
  });

  return (
    <Animated.ScrollView
      className="flex-1 bg-[#0E0C1F]"
      style={{ backgroundColor: containerBackgroundColor }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mx-5 mt-10 mb-2">
        <Animated.Text
          className={`${colorScheme === "dark" ? "text-white" : "text-black"} text-2xl font-bold`}
          style={{
            opacity: greetingOpacity,
            transform: [{ translateY: greetingTranslateY }],
          }}
        >
          Hi, {user?.fullName || user?.username} 👋
        </Animated.Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative">
            <Icon name="notifications-outline" size={28} color={colorScheme === "dark" ? "#888" : "#000"} />
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

      {/* Tabs and Underline */}
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
                  ? `${colorScheme === "dark" ? "text-white" : "text-black"} font-bold`
                  : `${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"} font-medium`
                  }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {tabsLayouted && (
          <Animated.View
            className="h-0.5 bg-white absolute -bottom-2"
            style={{
              width: tabUnderlineWidth,
              transform: [{ translateX: tabUnderlineLeft }],
            }}
          />
        )}
      </View>

      {/* Content */}
      {activeTab === "forYou" && (
        <ScrollView className="px-5">
          {/* Featuring Today Card */}
          <View className="mb-6 rounded-lg overflow-hidden">
            <Image
              source={{ uri: forYouData[0].image }}
              className="w-full h-48 rounded-lg"
            />
            <View className="absolute bottom-4 left-4">
              <Text className="text-white text-xl font-bold">
                {forYouData[0].title}
              </Text>
              <Text className="text-gray-300">{forYouData[0].content}</Text>
              <CustomButton
                title="Play"
                onPress={() => { }}
                className="mt-2 bg-green-500 px-4 py-2 rounded-full"
              />
            </View>
          </View>

          {/* Recently Played Horizontal List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                {forYouData[1].title}
              </Text>
              <CustomButton title="See more" onPress={() => { }} />
            </View>
            <FlatList
              horizontal
              data={forYouData[1].horizontalData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.title}
                  image={item.image}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Mixes for you Horizontal List */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-2">
              {forYouData[2].title}
            </Text>
            <FlatList
              horizontal
              data={forYouData[2].mixes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AlbumItem
                  title={item.title}
                  image={item.image}
                  onPress={() => { }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      )}

      {activeTab === "relax" && (
        <ScrollView className="px-5">
          {/* Today's Refreshing Song-Recommendations Card */}
          <View className="mb-6 rounded-lg overflow-hidden">
            <Image
              source={{ uri: relaxData[0].image }}
              className="w-full h-48 rounded-lg"
            />
            <View className="absolute bottom-4 left-4">
              <Text className="text-white text-xl font-bold">
                {relaxData[0].title}
              </Text>
              <Text className="text-gray-300">{relaxData[0].content}</Text>
            </View>
          </View>

          {/* Relax Songs List */}
          {relaxData.slice(1).map((item) => (
            <SongItem
              key={item.id}
              title={item.title}
              subtitle={item.artist || ""}
              image={item.image}
              onPress={() => { }}
              onOptionsPress={() => { }}
            />
          ))}
        </ScrollView>
      )}
    </Animated.ScrollView>
  );
}