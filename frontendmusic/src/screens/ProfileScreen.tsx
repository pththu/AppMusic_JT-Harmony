import React, { useContext } from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SettingsContext } from '../context/SettingsContext';
import CustomButton from '../components/CustomButton';
import SettingItem from '../components/SettingItem';
import LibraryItemButton from '../components/LibraryItemButton'; // Import component mới

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const settings = useContext(SettingsContext);

  return (
    <View className="flex-1  bg-[#0E0C1F] p-6">
      <View className="flex-row justify-between items-center my-4">
        <Text className="text-white text-3xl font-bold">My Profile</Text>
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate('EditProfile')}
          iconName="pencil"
          // className="bg-gray-600 rounded-full px-4 py-1 flex-row items-center"
          // textClassName="text-white font-semibold"
        />
      </View>

      <View className="items-center my-4">
        <Image
          source={{
            uri: 'https://images.dog.ceo/breeds/pug/n02110958_10076.jpg',
          }}
          className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-xl"
        />
        <Text className="text-white text-2xl font-bold">...</Text>
      </View>

      <View className="my-4">
        <View className="flex-row items-center mb-1">
          <Icon
            name="mail-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Email</Text>
        </View>
        <Text className="text-white mb-3">...</Text>

        <View className="flex-row items-center mb-1">
          <Icon
            name="call-outline"
            size={20}
            color="#9CA3AF"
            className="mr-2"
          />
          <Text className="text-gray-400">Phone Number</Text>
        </View>
        <Text className="text-white">...</Text>
      </View>

      {/* Thay thế CustomButton bằng LibraryItemButton */}
      <View className="flex-row justify-between my-4">
        <LibraryItemButton
          title="... Songs"
          icon="favorite"
          onPress={() => navigation.navigate('LikedSongsScreen')}
          color="#ffb5b5"
        />
        <LibraryItemButton
          title="... Playlists"
          icon="list"
          onPress={() => navigation.navigate('PlaylistsScreen')}
          color="#82d8ff"
        />
        <LibraryItemButton
          title="... Artists"
          icon="person"
          onPress={() => navigation.navigate('ArtistsFollowingScreen')}
          color="#fff999"
        />
      </View>

      <View>
        <Text className="text-white font-semibold mb-2 text-2xl">Settings</Text>
        <SettingItem
          title={`Music Language(s): ${settings?.musicLanguages.join(', ')}`}
          onPress={() => navigation.navigate('MusicLanguage')}
        />
        <SettingItem
          title={`Streaming Quality: ${settings?.streamingQuality}`}
          onPress={() => navigation.navigate('StreamingQuality')}
        />
        <SettingItem
          title={`Download Quality: ${settings?.downloadQuality}`}
          onPress={() => navigation.navigate('DownloadQuality')}
        />
        <SettingItem
          title="Log out"
          onPress={() => navigation.navigate('Login')}
          // textClassName="text-red-400 font-semibold"
        />
      </View>
    </View>
  );
}
