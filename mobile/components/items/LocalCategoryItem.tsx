import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const LocalCategoryItem = ({ name, color, colorEnd, icon, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 m-1.5"
      style={{ aspectRatio: 1.6 }}
    >
      <LinearGradient
        colors={[color, colorEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-lg p-3 justify-between overflow-hidden"
      >
        <View className="self-start">
          <Icon name={icon} size={28} color="#FFFFFF" />
        </View>
        <Text className="text-white font-bold text-base">
          {name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default LocalCategoryItem;