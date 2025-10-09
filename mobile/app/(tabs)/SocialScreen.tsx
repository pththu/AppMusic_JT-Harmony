import { Button, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import useAuthStore from '@/store/authStore'
import { GetMe } from '@/routes/ApiRouter'

const SocialScreen = () => {
  return (
    <SafeAreaView>
      <Text>SocialScreen</Text>
    </SafeAreaView>
  )
}

export default SocialScreen;