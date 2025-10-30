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

  EditProfile: '(tabs)/EditProfileScreen',
  DownloadQuality: '(tabs)/DownloadQualityScreen',
  StreamingQuality: '(tabs)/StreamingQualityScreen',
  MusicLanguage: '(tabs)/MusicLanguageScreen',

  AlbumScreen: '(tabs)/AlbumScreen', // trang thông tin album
  ArtistScreen: '(tabs)/ArtistScreen', // trang thông tin nghệ sĩ
  ArtistsFollowingScreen: '(tabs)/ArtistsFollowingScreen', // danh sách nghệ sĩ đang theo dõi
  PlaylistScreen: '(tabs)/PlaylistScreen', // thông tin playlist
  AllPlaylistScreen: '(tabs)/AllPlaylistScreen', // danh sách playlist
  AddTrackScreen: '(tabs)/AddTrackScreen', // thêm bài hát vào playlist
  DownloadsScreen: '(tabs)/DownloadsScreen',
  LikedSongsScreen: '(tabs)/LikedSongsScreen',
  YourLibraryScreen: '(tabs)/YourLibraryScreen',
  AllSongsScreen: '(tabs)/AllSongsScreen',
  QueueScreen: '(tabs)/QueueScreen',
  SongInfoScreen: '(tabs)/SongInfoScreen',
  SongScreen: '(tabs)/SongScreen',

  Setting: '(tabs)/SettingScreen',
  ChangePassword: '(tabs)/ChangePasswordScreen',
  UpdateEmail: '(tabs)/UpdateEmailScreen',

  ProfileSocialScreen: '(tabs)/ProfileSocialScreen',
  ChatScreen: '(tabs)/ChatScreen'



  // EditProfile: '(screens)/EditProfileScreen',
  // DownloadQuality: '(screens)/DownloadQualityScreen',
  // StreamingQuality: '(screens)/StreamingQualityScreen',
  // MusicLanguage: '(screens)/MusicLanguageScreen',

  // AlbumScreen: '(screens)/AlbumScreen', // trang thông tin album
  // ArtistScreen: '(screens)/ArtistScreen', // trang thông tin nghệ sĩ
  // ArtistsFollowingScreen: '(screens)/ArtistsFollowingScreen', // danh sách nghệ sĩ đang theo dõi
  // PlaylistScreen: '(screens)/PlaylistScreen', // thông tin playlist
  // AllPlaylistScreen: '(screens)/AllPlaylistScreen', // danh sách playlist
  // AddTrackScreen: '(screens)/AddTrackScreen', // thêm bài hát vào playlist
  // DownloadsScreen: '(screens)/DownloadsScreen',
  // LikedSongsScreen: '(screens)/LikedSongsScreen',
  // YourLibraryScreen: '(screens)/YourLibraryScreen',
  // AllSongsScreen: '(screens)/AllSongsScreen',
  // QueueScreen: '(screens)/QueueScreen',
  // SongInfoScreen: '(screens)/SongInfoScreen',
  // SongScreen: '(screens)/SongScreen',

  // Setting: '(screens)/SettingScreen',
  // ChangePassword: '(screens)/ChangePasswordScreen',
  // UpdateEmail: '(screens)/UpdateEmailScreen',

  // ProfileSocialScreen: '(screens)/ProfileSocialScreen',
  // ChatScreen: '(screens)/ChatScreen'
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