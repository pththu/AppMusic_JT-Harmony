import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  iconName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function CustomButton({
  title,
  onPress,
  iconName,
  variant = 'primary',
  size = 'medium',
}: CustomButtonProps) {
  const getButtonStyles = () => {
    let baseStyles = 'rounded-full px-5 py-2 flex-row items-center justify-center';
    let textStyles = 'font-semibold';

    switch (variant) {
      case 'primary':
        baseStyles += ' bg-green-600';
        textStyles += ' text-white';
        break;
      case 'secondary':
        baseStyles += ' bg-gray-800';
        textStyles += ' text-white';
        break;
      case 'outline':
        baseStyles += ' border border-gray-600';
        textStyles += ' text-gray-400';
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

    return { baseStyles, textStyles };
  };

  const { baseStyles, textStyles } = getButtonStyles();

  return (
    <TouchableOpacity className={baseStyles} onPress={onPress}>
      {iconName && <Icon name={iconName} size={18} color="white" className="mr-2" />}
      <Text className={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}
