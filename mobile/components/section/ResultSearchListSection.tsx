import { Image, Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ResultSearchListSection = ({ 
  item,
  isDark = false,
  onItemPerss = (item) => {},
}) => {
  const itemType = item.type || "Track";
  let iconName = "musical-notes";
  if (itemType === "Album") iconName = "disc";
  else if (itemType === "Artist") iconName = "person";
  else if (itemType === "Playlist") iconName = "list";
  else if (itemType === "User") iconName = "people-circle";

  return (
    <TouchableOpacity
      onPress={() => onItemPerss(item)}
      className="flex-row items-center py-2"
    >
      {itemType === 'User' ? (
        <>
          <Image
            source={{ uri: item?.avatarUrl }}
            style={{
              width: 50,
              height: 50,
              borderRadius: itemType === "Artist" || itemType === "User" ? 25 : 4,
            }}
          />
          <View className="ml-3 flex-1">
            <Text
              className={`text-${isDark ? "white" : "black"} font-semibold text-base`}
            >
              {item.fullName}
            </Text>
            <Text
              className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
            >
              {itemType} • {item.username || ""}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={isDark ? "#888" : "#777"} />
        </>
      ) : (
        <>
          {item.imageUrl ? (
            <Image
              source={{ uri: item?.imageUrl }}
              style={{
                width: 50,
                height: 50,
                borderRadius: itemType === "Artist" || itemType === "User" ? 25 : 4,
              }}
            />
          ) : (
            <View
              className={`w-12 h-12 rounded-${itemType === "Artist" || itemType === "User" ? "full" : "sm"
                } items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-300"
                }`}
            >
              <Icon name={iconName} size={24} color={isDark ? "#fff" : "#000"} />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text
              className={`text-${isDark ? "white" : "black"} font-semibold text-base`}
            >
              {item.name || item.title}
            </Text>
            <Text
              className={`text-${isDark ? "gray-400" : "gray-600"} text-xs`}
            >
              {itemType} • {item.subtitle || item.artists?.[0]?.name || ""}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={isDark ? "#888" : "#777"} />
        </>
      )}
    </TouchableOpacity>
  );
};

export default ResultSearchListSection;