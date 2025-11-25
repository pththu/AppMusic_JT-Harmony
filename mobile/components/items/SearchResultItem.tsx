import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const SearchResultItem = ({ item, index, onPress, onPressOptions, primaryIconColor, colorScheme }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 400, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const getSubtitle = () => {
    if (item.resultType === 'favAlbum') {
      const artists = item.artists?.map(a => a.name).join(', ') || 'Nghệ sĩ không rõ';
      return `Album • ${artists}`;
    }
    // Cả myPlaylist và favPlaylist đều là playlist
    const ownerName = item.owner?.name || 'Của bạn';
    return `Playlist • ${ownerName}`;
  };

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
          <Text className="dark:text-gray-400 text-sm" numberOfLines={1}>
            {getSubtitle()}
          </Text>
        </View>
        <Pressable className="p-2" onPress={() => onPressOptions(item)}>
          <Icon name="ellipsis-vertical" size={20} color={primaryIconColor} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default SearchResultItem;