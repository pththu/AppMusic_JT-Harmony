import { Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const QuickActionChip = ({ icon, label, isActive, onPress, colorScheme }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${isActive
      ? 'bg-green-500 border-green-500'
      : colorScheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      }`}
  >
    <Icon name={icon} size={18} color={isActive ? '#fff' : (colorScheme === 'dark' ? '#ccc' : '#555')} />
    <Text className={`ml-2 font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default QuickActionChip;