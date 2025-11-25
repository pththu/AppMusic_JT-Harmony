import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const TrackItem = React.memo(({ item, isDarkMode, onAdd }: { item: any; isDarkMode: boolean; onAdd: (track: any) => void; }) => {
  const textColor = isDarkMode ? "text-white" : "text-black";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-600";
  const primaryColor = "#22c55e";

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center flex-1 pr-4">
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
          className="w-12 h-12 rounded-sm mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className={`text-base ${textColor}`} numberOfLines={1}>
            {item.name}
          </Text>
          <Text className={`text-sm ${subTextColor}`} numberOfLines={1}>
            {item.artists?.map(a => a.name).join(', ')}
          </Text>
        </View>
      </View>

      {/* Nút Thêm (+) */}
      <TouchableOpacity
        onPress={() => onAdd(item)}
        className="w-10 h-10 justify-center items-center rounded-full"
      >
        <Icon name="add-circle-outline" size={28} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );
});

export default TrackItem;