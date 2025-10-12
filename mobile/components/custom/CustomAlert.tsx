import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { AlertConfig, AlertButton } from '@/types/alert';
import { DEFAULT_ALERT_BUTTONS, ALERT_ANIMATIONS } from '@/constants/AlerConfig';

interface CustomAlertProps {
  config: AlertConfig;
  onHide: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({ config, onHide }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' ? true : false;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ALERT_ANIMATIONS.SPRING_CONFIG,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ALERT_ANIMATIONS.DURATION.SHOW,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHide = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...ALERT_ANIMATIONS.SPRING_CONFIG,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: ALERT_ANIMATIONS.DURATION.HIDE,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const handleBackdropPress = () => {
    if (config.dismissible !== false) {
      handleHide();
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    handleHide();
  };

  const getIconByType = () => {
    switch (config.type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'information-circle';
    }
  };

  const getIconContainerClass = () => {
    const baseClass = 'self-center w-16 h-16 rounded-full justify-center items-center mt-6 mb-4';
    switch (config.type) {
      case 'success':
        return `${baseClass} ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`;
      case 'warning':
        return `${baseClass} ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`;
      case 'error':
        return `${baseClass} ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`;
      default:
        return `${baseClass} ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`;
    }
  };

  const getIconColor = () => {
    switch (config.type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const getButtonStyle = (button: AlertButton, index: number, totalButtons: number) => {
    let baseClass = 'flex-1 py-4 justify-center items-center';

    // Background colors based on theme
    const bgWhite = isDark ? 'bg-gray-500' : 'bg-gray-300';
    const bgGray = isDark ? 'bg-gray-500' : 'bg-gray-300';
    const bgRed = isDark ? 'bg-red-500' : 'bg-red-300';
    const bgGreen = isDark ? 'bg-green-500' : 'bg-green-300';

    baseClass += ` ${bgWhite}`;

    // Single button
    if (totalButtons === 1) {
      baseClass += ' rounded-bl-xl rounded-br-xl';
    }
    // Multiple buttons
    else {
      const borderColor = isDark ? 'border-gray-600' : 'border-gray-200';
      if (index === 0) {
        baseClass += ` rounded-bl-xl border-r ${borderColor}`;
      } else if (index === totalButtons - 1) {
        baseClass += ` rounded-br-xl border-l ${borderColor}`;
      } else {
        baseClass += ` border-l border-r ${borderColor}`;
      }
    }

    // Button specific styles
    if (button.style === 'cancel') {
      baseClass = baseClass.replace(bgWhite, bgRed);
    } else if (button.style === 'destructive') {
      baseClass = baseClass.replace(bgWhite, bgGreen);
    } else if (button.style === 'default') {
      baseClass = baseClass.replace(bgWhite, bgGreen);
    }

    return baseClass;
  };

  const getButtonTextStyle = (button: AlertButton) => {
    let textClass = 'text-base font-semibold';

    switch (button.style) {
      case 'cancel':
        return textClass + (isDark ? ' text-gray-100' : ' text-gray-700');
      case 'destructive':
        return textClass + (isDark ? ' text-white' : ' text-red-700');
      default:
        return textClass + (isDark ? ' text-white' : ' text-green-700');
    }
  };

  const buttons = config.buttons || DEFAULT_ALERT_BUTTONS;
  const containerBg = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const titleColor = isDark ? 'text-white' : 'text-gray-900';
  const messageColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-200';

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          className="flex-1 justify-center items-center px-6"
          style={[
            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' },
            { opacity: opacityAnim }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              className={`${containerBg} rounded-xl shadow-2xl w-full max-w-sm overflow-hidden`}
              style={[
                { width: screenWidth * 0.85, maxWidth: 340 },
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {/* Icon */}
              {config.type && (
                <View className={getIconContainerClass()}>
                  <Ionicons
                    name={getIconByType() as any}
                    size={28}
                    color={getIconColor()}
                  />
                </View>
              )}

              {/* Content */}
              <View className="px-6 pb-6 items-center">
                <Text className={`text-xl font-bold ${titleColor} text-center mb-3`}>
                  {config.title}
                </Text>
                {config.message && (
                  <Text className={`text-base ${messageColor} text-center leading-6`}>
                    {config.message}
                  </Text>
                )}
              </View>

              {/* Buttons */}
              <View className={`flex-row border-t ${borderColor}`}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    className={getButtonStyle(button, index, buttons.length)}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text className={getButtonTextStyle(button)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomAlert;