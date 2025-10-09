import React from 'react';
import { Text, Pressable, View, useColorScheme } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  iconName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function CustomButton({
  title,
  onPress,
  iconName,
  variant = 'primary',
  size = 'medium',
  className = '',
}: CustomButtonProps) {
  const colorScheme = useColorScheme();
  const getButtonStyles = () => {
    let baseStyles = 'rounded-full flex-row items-center justify-center';
    let textStyles = 'font-semibold';

    switch (variant) {
      case 'primary':
        baseStyles += ' bg-green-600';
        textStyles += colorScheme === "dark" ? ' text-white' : ' text-black';
        break;
      case 'secondary':
        baseStyles += ' bg-gray-800';
        textStyles += ' text-white';
        break;
      case 'outline':
        baseStyles += ' border border-gray-600';
        textStyles += colorScheme === "dark" ? ' text-gray-400' : ' text-black';
        break;
    }

    switch (size) {
      case 'small':
        baseStyles += ' px-3 py-1';
        textStyles += ' text-sm';
        break;
      case 'large':
        baseStyles += ' px-6 py-3';
        textStyles += ' text-lg';
        break;
    } 

    baseStyles += ` ${className}`; 

    const iconColor = variant === 'primary' ? (colorScheme === "dark" ? 'white' : '#000000') : variant === 'outline' ? (colorScheme === "dark" ? '#9CA3AF' : '#000000') : 'white';
    const iconMargin = title ? 'mr-2' : '';

    return { baseStyles, textStyles, iconColor, iconMargin };
  };

  const { baseStyles, textStyles, iconColor, iconMargin } = getButtonStyles();

  return (
    <Pressable className={baseStyles} onPress={onPress}>
      {iconName && (
        <View style={{ marginRight: iconMargin === 'mr-2' ? 8 : 0 }}>
          <Icon
            name={iconName as any}
            size={18}
            color={iconColor}
          />
        </View>
      )}
      <Text className={textStyles}>{title}</Text>
    </Pressable>
  );
}