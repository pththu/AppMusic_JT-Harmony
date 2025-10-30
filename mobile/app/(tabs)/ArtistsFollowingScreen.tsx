import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from '@/components/ThemeContext';

const artists = [
  {
    id: "1",
    name: "One Republic",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    name: "Coldplay",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "3",
    name: "The Chainsmokers",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "4",
    name: "Linkin Park",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "5",
    name: "Sia",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "6",
    name: "Ellie Goulding",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "7",
    name: "Katy Perry",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "8",
    name: "Maroon 5",
    image:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

export default function ArtistsFollowingScreen({ route }: { route: any }) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const primaryIconColor = theme === 'dark' ? 'white' : 'black';
  const secondaryIconColor = theme === 'dark' ? '#888' : 'gray';

  const handleBackPress = () => {
    if (route?.params?.fromProfile) {
      navigation.navigate("Profile" as never);
    } else {
      navigation.goBack();
    }
  };
  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F] px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon name="arrow-back" size={24} color={primaryIconColor} />
        </TouchableOpacity>
        <View>
          <Text className="text-black dark:text-white text-2xl font-semibold mb-2">
            Artists Following
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">8 artists following</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 flex-row items-center">
          <Icon name="search" size={20} color={secondaryIconColor} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={secondaryIconColor}
            className="ml-2 flex-1 text-black dark:text-white"
          />
        </View>
        <TouchableOpacity className="ml-4">
          <Icon name="swap-vertical" size={24} color={secondaryIconColor} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={artists}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity className="items-center p-2 flex-1">
            <Image
              source={{ uri: item.image }}
              className="w-20 h-20 rounded-full mb-2"
            />
            <Text className="text-black dark:text-white text-center">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
