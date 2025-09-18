import { useRouter } from "expo-router";

const routeMap: Record<string, string> = {
  Auth: '(auth)/AuthScreen',
  SignUp: '(auth)/SignUpScreen',
  Login: '(auth)/LoginScreen',

  Main: '(tabs)/HomeScreen',
  Profile: '(tabs)/ProfileScreen',
  Search: '(tabs)/SearchScreen',
  Library: '(tabs)/YourLibraryScreen',

  EditProfile: '(screens)/EditProfileScreen',
  DownloadQuality: '(screens)/DownloadQualityScreen',
  StreamingQuality: '(screens)/StreamingQualityScreen',
  MusicLanguage: '(screens)/MusicLanguageScreen',

  ArtistsFollowingScreen: '(screens)/ArtistsFollowingScreen',
  PlaylistsScreen: '(screens)/PlaylistsScreen',
  DownloadsScreen: '(screens)/DownloadsScreen',
  LikedSongsScreen: '(screens)/LikedSongsScreen',
  YourLibraryScreen: '(screens)/YourLibraryScreen',
};

export function useNavigate() {
  const router = useRouter();

  function navigate(name: string) {
    const path = routeMap[name];
    if (!path) throw new Error(`Route "${name}" chưa được định nghĩa`);
    router.push(path as any);
  }

  function goBack() {
    router.back();
  }

  return { navigate, goBack };
}
