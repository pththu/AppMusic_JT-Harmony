import { Button, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useAuthStore from '@/store/authStore'
import { GetMe } from '@/routes/ApiRouter'

const SocialScreen = () => {
  const user = useAuthStore(state => state.user);
  console.log(user)
  return (
    <SafeAreaView>
      <Text>SocialScreen</Text>
      <Text>{user?.username}</Text>
      <Button title="Get me" onPress={async () => {
        const response = await GetMe();
        console.log(response);
      }} />
      <Button title='None' onPress={() => {
        console.log(user)
      }} />
    </SafeAreaView>
  )
}

export default SocialScreen;