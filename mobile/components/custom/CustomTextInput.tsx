import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Pressable, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming MaterialIcons is available

interface CustomTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export default function CustomTextInput({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
}: CustomTextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const colorScheme = useColorScheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="mb-4">
      <View className={`flex-row items-center ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-200"} rounded-md p-3`}>
        <Icon name={iconName} size={20} color="#888" className="mr-3" />
        <TextInput
          className={`flex-1 ${colorScheme === "dark" ? "text-white" : "text-black"}`}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {secureTextEntry && (
          <Pressable onPress={togglePasswordVisibility}>
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color="#888"
            />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
