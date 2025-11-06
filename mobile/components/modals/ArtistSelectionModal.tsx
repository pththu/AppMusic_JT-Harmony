import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  useColorScheme,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// Component con cho từng nghệ sĩ
const ArtistItem = ({ artist, onPress, colorScheme }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center py-4">
    <Image
      source={{ uri: artist?.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1756819623/default-avatar-icon-of-social-media-user-vector_t2fvta.jpg' }}
      className="w-12 h-12 rounded-full"
    />
    <Text
      className={`text-base ml-5 font-medium ${colorScheme === "dark" ? "text-white" : "text-black"}`}
    >
      {artist.name}
    </Text>
  </TouchableOpacity>
);

const ArtistSelectionModal = ({
  isVisible,
  setIsVisible,
  artists,
  onSelectArtist,
}) => {
  const colorScheme = useColorScheme();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
        Animated.timing(slideAnim, { toValue: 500, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <Pressable onPress={handleClose} className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: backdropOpacity }]} />
        <Animated.View style={[{ transform: [{ translateY: slideAnim }] }]}>
          <Pressable onPress={() => { }} className={`${colorScheme === "dark" ? "bg-[#0B1215]" : "bg-white"} w-full rounded-t-2xl p-4 pb-6`}>
            <View className="w-12 h-0.5 bg-gray-500 rounded-full self-center mb-4" />
            <Text className={`text-lg font-bold mb-2 ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              Chọn nghệ sĩ
            </Text>
            <View className={`border-t ${colorScheme === 'dark' ? 'border-gray-600' : 'border-gray-200'} mb-4`}>
              {artists.map((artist, index) => (
                <ArtistItem
                  key={artist.spotifyId || index}
                  artist={artist}
                  onPress={() => onSelectArtist(artist)}
                  colorScheme={colorScheme}
                />
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default ArtistSelectionModal;