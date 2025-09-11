import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AuthScreen({ navigation }: { navigation: any }) {
  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      <View className="flex-row items-center mb-6">
        <Text className="text-4xl font-extrabold text-white mr-4">Musico</Text>
        <View className="flex-row space-x-2">
          <View className="w-4 h-4 rounded-full bg-green-600" />
          <View className="w-4 h-4 rounded-full bg-green-700" />
          <View className="w-4 h-4 rounded-full bg-green-800" />
        </View>
      </View>
      <Text className="text-gray-400 mb-60">Just keep on vibin'</Text>

      <View className="w-full mt-10">
        <TouchableOpacity
          className="bg-white rounded-full w-full py-4 mb-8 items-center flex-row justify-center"
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.7}
        >
          <Icon name="person-add" size={20} color="black" className="mr-2" />
          <Text className="text-black font-semibold text-lg">Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-gray-300 rounded-full w-full py-4 mb-8 flex-row items-center justify-center"
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Icon name="phone" size={20} color="white" className="mr-2" />
          <Text className="text-white text-base font-semibold">
            Continue with Phone Number
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-gray-300 rounded-full w-full py-4 mb-8 flex-row items-center justify-center"
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Icon
            name="account-circle"
            size={20}
            color="white"
            className="mr-2"
          />
          <Text className="text-white text-base font-semibold">
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text className="text-white underline text-base">Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
