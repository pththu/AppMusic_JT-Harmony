import { useRouter } from "expo-router";

const routeMap: Record<any, any> = {
  Auth: '(auth)',
  SignUp: '(auth)/SignUpScreen',
  Login: '(auth)/LoginScreen',
  VerifyEmail: '(auth)/VerifyEmailScreen',
  ForgotPassword: '(auth)/ForgotPasswordScreen',
  ResetPassword: '(auth)/ResetPasswordScreen',

  Main: '(tabs)/HomeScreen',
  Profile: '(tabs)/ProfileScreen',
  Search: '(tabs)/SearchScreen',
  Library: '(tabs)/YourLibraryScreen',

  EditProfile: '(screens)/EditProfileScreen',
  DownloadQuality: '(screens)/DownloadQualityScreen',
  StreamingQuality: '(screens)/StreamingQualityScreen',
  MusicLanguage: '(screens)/MusicLanguageScreen',

  ArtistScreen: '(screens)/ArtistScreen',
  ArtistsFollowingScreen: '(screens)/ArtistsFollowingScreen',
  PlaylistsScreen: '(screens)/PlaylistsScreen',
  DownloadsScreen: '(screens)/DownloadsScreen',
  LikedSongsScreen: '(screens)/LikedSongsScreen',
  YourLibraryScreen: '(screens)/YourLibraryScreen',
  AllSongsScreen: '(screens)/AllSongsScreen',
  QueueScreen: '(screens)/QueueScreen',
  SongInfoScreen: '(screens)/SongInfoScreen',
  SongScreen: '(screens)/SongScreen',
  Setting: '(screens)/SettingScreen',
  ChangePassword: '(screens)/ChangePasswordScreen',
  UpdateEmail: '(screens)/UpdateEmailScreen',
  ProfileSocialScreen: '(screens)/ProfileSocialScreen',
  ChatScreen: '(screens)/ChatScreen'
};

export function useNavigate() {
  const router = useRouter();

  function navigate(name, params = {}) {
    const path = routeMap[name];
    if (!path) throw new Error(`Route "${name}" chưa được định nghĩa`);
    router.push({
      pathname: path,
      ...(Object.keys(params).length > 0 ? { params } : {}),
    });
  }

  function goBack() {
    router.back();
  }

  return { navigate, goBack };
}