import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

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

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const inputBg = 'bg-gray-200 dark:bg-gray-800';
  const inputTextClass = 'text-black dark:text-white';
  const iconPlaceholderColor = '#9CA3AF'; // Tailwind gray-400

  return (
    <View className="mb-4">
      <View className={`flex-row items-center rounded-md p-3 ${inputBg}`}>
        
        <Icon name={iconName} size={20} color={iconPlaceholderColor} className="mr-3" />
        
        <TextInput
          className={`flex-1 ${inputTextClass}`}
          placeholder={placeholder}
          placeholderTextColor={iconPlaceholderColor} 
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
              color={iconPlaceholderColor}
            />
          </Pressable>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
