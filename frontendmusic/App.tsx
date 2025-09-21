import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthScreen from './src/screens/AuthScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import MusicLanguageScreen from './src/screens/MusicLanguageScreen';
import StreamingQualityScreen from './src/screens/StreamingQualityScreen';
import DownloadQualityScreen from './src/screens/DownloadQualityScreen';
import { SettingsProvider } from './src/context/SettingsContext';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MusicLanguage" component={MusicLanguageScreen} />
        <Stack.Screen name="StreamingQuality" component={StreamingQualityScreen} />
        <Stack.Screen name="DownloadQuality" component={DownloadQualityScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
