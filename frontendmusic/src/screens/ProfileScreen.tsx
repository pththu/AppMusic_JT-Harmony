import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SettingsContext } from '../context/SettingsContext';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const settings = useContext(SettingsContext);

  return (
    <View className="flex-1 bg-black p-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">My Profile</Text>
        <TouchableOpacity
          className="bg-gray-700 rounded-full px-4 py-1"
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text className="text-white font-semibold">Edit</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-6">
        <Image
          source={{ uri: 'https://images.dog.ceo/breeds/pug/n02110958_10076.jpg' }}
          className="w-24 h-24 rounded-full mb-4 border-4 border-white"
        />
        <Text className="text-white text-xl font-semibold">...</Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-400 mb-1">Email</Text>
        <Text className="text-white mb-3">...</Text>

        <Text className="text-gray-400 mb-1">Phone Number</Text>
        <Text className="text-white">...</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <View className="bg-gray-900 rounded-lg p-4 flex-1 mr-2 items-center">
          <Icon name="heart" size={24} color="white" />
          <Text className="text-white font-semibold mt-2">... songs</Text>
        </View>
        <View className="bg-gray-900 rounded-lg p-4 flex-1 mx-1 items-center">
          <Icon name="list" size={24} color="white" />
          <Text className="text-white font-semibold mt-2">... playlists</Text>
        </View>
        <View className="bg-gray-900 rounded-lg p-4 flex-1 ml-2 items-center">
          <Icon name="person" size={24} color="white" />
          <Text className="text-white font-semibold mt-2">... artists</Text>
        </View>
      </View>

      <View>
        <Text className="text-white font-semibold mb-2">Settings</Text>
        <TouchableOpacity
          className="py-3 border-b border-gray-700"
          onPress={() => navigation.navigate('MusicLanguage')}
        >
          <Text className="text-gray-400">
            Music Language(s): {settings?.musicLanguages.join(', ')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-3 border-b border-gray-700"
          onPress={() => navigation.navigate('StreamingQuality')}
        >
          <Text className="text-gray-400">
            Streaming Quality: {settings?.streamingQuality}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="py-3 border-b border-gray-700"
          onPress={() => navigation.navigate('DownloadQuality')}
        >
          <Text className="text-gray-400">
            Download Quality: {settings?.downloadQuality}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
