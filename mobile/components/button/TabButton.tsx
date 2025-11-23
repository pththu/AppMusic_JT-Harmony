import { Text, TouchableOpacity, useColorScheme } from "react-native";

const TabButton = ({ title, tabName, onPress, isActive }) => {
  const colorScheme = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center py-3`}
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

export default TabButton;