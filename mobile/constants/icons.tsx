import { FontAwesome5, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { JSX } from 'react';

export const icons: Record<string, (props: any) => JSX.Element> =  {
  HomeScreen: (props: any) => <AntDesign name="home" size={20} color={"#22c55e"} {...props} />,
  SearchScreen: (props: any) => <Feather name="search" size={20} color={"#22c55e"} {...props} />,
  SocialScreen: (props: any) => <MaterialIcons name="bubble-chart" size={20} color={"#22c55e"} {...props} />,
  YourLibraryScreen: (props: any) => <Ionicons name="library-outline" size={20} color={"#22c55e"} {...props} />,
  ProfileScreen: (props: any) => <FontAwesome5 name="user" size={20} color={"#22c55e"} {...props} />,
};
