import { useEffect, useRef } from "react";
import { Image, Pressable, Text, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const PlaylistFavoriteItem = ({ item, index, onPress, onPressOptions, primaryIconColor, colorScheme }) => {
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
  }, []);

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
          <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} font-semiboldF`} numberOfLines={1}>
            {item?.name}
          </Text>
          <Text className="dark:text-gray-400 text-sm">
            {item?.totalTracks || 0} bài hát
          </Text>
        </View>
        <Pressable className="p-2" onPress={() => onPressOptions(item)}>
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default PlaylistFavoriteItem;