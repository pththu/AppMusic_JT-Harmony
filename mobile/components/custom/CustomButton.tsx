import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const getButtonStyles = () => {
    let baseStyles = 'rounded-full flex-row items-center justify-center';
    let textStyles = 'font-semibold';
    let iconClassName = '';
    const iconSize = size === 'large' ? 20 : 18;
    
    switch (variant) {
      case 'primary':
        baseStyles += ' bg-green-600';
        textStyles += ' text-black dark:text-white';
        iconClassName = 'text-black dark:text-white';
        break;
      case 'secondary':
        baseStyles += ' bg-gray-100 dark:bg-gray-800';
        textStyles += ' text-black dark:text-white';
        iconClassName = 'text-black dark:text-white';
        break;
      case 'outline':
        baseStyles += ' border border-gray-300 dark:border-gray-600';
        textStyles += ' text-gray-600 dark:text-gray-400';
        iconClassName = 'text-gray-600 dark:text-gray-400';
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
      case 'medium': 
        baseStyles += ' px-5 py-2';
        textStyles += ' text-base';
        break;
    } 

    baseStyles += ` ${className}`; 
    
    const iconMargin = title ? 'mr-2' : '';
    
    return { baseStyles, textStyles, iconClassName, iconMargin, iconSize };
  };

  const { baseStyles, textStyles, iconClassName, iconMargin, iconSize } = getButtonStyles();

  return (
    <TouchableOpacity className={baseStyles} onPress={onPress}>
      {iconName && (
        <Icon
          name={iconName}
          size={iconSize}
          className={`${iconClassName} ${iconMargin}`}
        />
      )}
      <Text className={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}
