// Types
export interface User {
  id: number;
  facebookId?: string;
  googleId?: string;
  username: string;
  email?: string;
  password?: string;
  accountType: string[];
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  dob?: string;
  gender?: boolean; // true: male, false: female
  accessToken?: string;
  refreshToken?: string;
  expiry?: string;
  otp?: string;
  expireOtp?: string;
  emailVerified?: boolean;
  notificationEnabled?: boolean;
  streamQuality: string;
  status: "active" | "inactive" | "banned" | "locked";
  roleId?: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  fileUrl?: string;
  heartCount: number;
  shareCount: number;
  uploadedAt: string;
  commentCount: number;
  songId?: number;
  isCover: boolean;
  originalSongId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  postId?: number;
  content: string;
  parentId?: number;
  fileUrl?: string;
  commentedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: number;
  spotifyId: string;
  videoId?: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  lyrics?: string;
  externalUrl?: string;
  duration: number;
  albumId?: number;
  discNumber: number;
  trackNumber?: number;
  explicit: boolean;
  playCount: number;
  shareCount: number;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: number;
  spotifyId?: string;
  name: string;
  userId?: number;
  description?: string;
  imageUrl?: string;
  isPublic: boolean;
  type?: string;
  totalTracks?: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: number;
  spotifyId: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: number;
  spotifyId: string;
  name: string;
  imageUrl?: string;
  totalTracks: number;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Genres {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  likedAt: string;
}

export interface CommentLike {
  userId: number;
  commentId: number;
  likedAt: string;
}

export interface Conversation {
  id: number;
  type: "private" | "group";
  name?: string;
  lastMessageId?: number;
  creatorId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMember {
  id: number;
  conversationId: number;
  userId: number;
  isAdmin: boolean;
  lastReadMessageId?: number;
  status: "active" | "left" | "removed";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content?: string;
  type: "text" | "image" | "video" | "file" | "system";
  fileUrl?: string;
  replyToId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageHide {
  id: number;
  messageId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostHide {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FollowArtist {
  id: number;
  followerId: number;
  artistId: number;
  followedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUser {
  id: number;
  followerId: number;
  followeeId: number;
  followedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: number;
  playlistId: number;
  trackId: number;
  playlistSpotifyId?: string;
  trackSpotifyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListeningHistory {
  userId: number;
  itemId: number;
  type: string;
  listenedAt: string;
  durationListened: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistory {
  id: number;
  userId: number;
  query: string;
  searchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatDailyPlays {
  songId: number;
  date: string;
  playCount: number;
}

export interface SyncStatus {
  id: number;
  userId: number;
  deviceId: number;
  lastSync: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  userId: number;
  songId: number;
  score: number;
  isClicked: boolean;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostReport {
  id: number;
  postId: number;
  reporterId: number;
  reason: "nội dung người lớn" | "tự làm hại bản thân" | "thông tin sai lệch" | "nội dung không mong muốn";
  status: "pending" | "resolved" | "dismissed";
  reportedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: 1,
    facebookId: undefined,
    googleId: undefined,
    username: "admin",
    email: "admin@appmusic.com",
    password: "$2b$10$examplehashedpassword",
    accountType: ["email"],
    fullName: "Admin",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    bio: "System Administrator",
    dob: "1980-01-01",
    gender: true,
    accessToken: "admin_access_token",
    refreshToken: "admin_refresh_token",
    expiry: "2024-12-31T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 1,
    lastLogin: "2024-12-08T10:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: 2,
    facebookId: undefined,
    googleId: undefined,
    username: "user1",
    email: "user1@example.com",
    password: "$2b$10$examplehashedpassword2",
    accountType: ["email"],
    fullName: "Nguyễn Văn A",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    bio: "Music lover",
    dob: "1995-03-20",
    gender: true,
    accessToken: "user1_access_token",
    refreshToken: "user1_refresh_token",
    expiry: "2024-12-30T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-07T15:30:00Z",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-12-07T15:30:00Z",
  },
  {
    id: 3,
    facebookId: undefined,
    googleId: undefined,
    username: "user2",
    email: "user2@example.com",
    password: "$2b$10$examplehashedpassword3",
    accountType: ["email"],
    fullName: "Trần Thị B",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    bio: "Jazz enthusiast",
    dob: "1992-07-10",
    gender: false,
    accessToken: "user2_access_token",
    refreshToken: "user2_refresh_token",
    expiry: "2024-12-29T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: false,
    streamQuality: "medium",
    status: "inactive",
    roleId: 2,
    lastLogin: "2024-11-20T09:15:00Z",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-11-20T09:15:00Z",
  },
  {
    id: 4,
    facebookId: undefined,
    googleId: undefined,
    username: "moderator",
    email: "mod@appmusic.com",
    password: "$2b$10$examplehashedpassword4",
    accountType: ["email"],
    fullName: "Điều hành viên nội dung",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator",
    bio: "Content Moderator",
    dob: "1988-11-05",
    gender: true,
    accessToken: "mod_access_token",
    refreshToken: "mod_refresh_token",
    expiry: "2024-12-28T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-08T08:45:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-12-08T08:45:00Z",
  },
  {
    id: 5,
    facebookId: undefined,
    googleId: undefined,
    username: "john_doe",
    email: "john@example.com",
    password: "$2b$10$examplehashedpassword5",
    accountType: ["email"],
    fullName: "John Doe",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    bio: "Pop music fan",
    dob: "1990-05-12",
    gender: true,
    accessToken: "john_access_token",
    refreshToken: "john_refresh_token",
    expiry: "2024-12-27T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-06T12:00:00Z",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-12-06T12:00:00Z",
  },
  {
    id: 6,
    facebookId: undefined,
    googleId: undefined,
    username: "jane_smith",
    email: "jane@example.com",
    password: "$2b$10$examplehashedpassword6",
    accountType: ["email"],
    fullName: "Jane Smith",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    bio: "Indie music lover",
    dob: "1993-09-25",
    gender: false,
    accessToken: "jane_access_token",
    refreshToken: "jane_refresh_token",
    expiry: "2024-12-26T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "medium",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-05T14:30:00Z",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-12-05T14:30:00Z",
  },
  {
    id: 7,
    facebookId: undefined,
    googleId: undefined,
    username: "banned_user",
    email: "banned@example.com",
    password: "$2b$10$examplehashedpassword7",
    accountType: ["email"],
    fullName: "Banned User",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=banned",
    bio: "Banned account",
    dob: "1985-12-01",
    gender: true,
    accessToken: undefined,
    refreshToken: undefined,
    expiry: undefined,
    otp: undefined,
    expireOtp: undefined,
    emailVerified: false,
    notificationEnabled: false,
    streamQuality: "low",
    status: "banned",
    roleId: 2,
    lastLogin: "2024-11-15T10:00:00Z",
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-11-15T10:00:00Z",
  },
  {
    id: 8,
    facebookId: undefined,
    googleId: undefined,
    username: "inactive_user",
    email: "inactive@example.com",
    password: "$2b$10$examplehashedpassword8",
    accountType: ["email"],
    fullName: "Inactive User",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=inactive",
    bio: "Inactive account",
    dob: "1991-04-18",
    gender: false,
    accessToken: undefined,
    refreshToken: undefined,
    expiry: undefined,
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: false,
    streamQuality: "medium",
    status: "inactive",
    roleId: 2,
    lastLogin: "2024-10-20T08:00:00Z",
    createdAt: "2024-04-15T00:00:00Z",
    updatedAt: "2024-10-20T08:00:00Z",
  },
  {
    id: 9,
    facebookId: undefined,
    googleId: undefined,
    username: "music_lover",
    email: "music@example.com",
    password: "$2b$10$examplehashedpassword9",
    accountType: ["email"],
    fullName: "Music Lover",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=music",
    bio: "Passionate about all genres",
    dob: "1994-08-30",
    gender: true,
    accessToken: "music_access_token",
    refreshToken: "music_refresh_token",
    expiry: "2024-12-25T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-04T16:45:00Z",
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-12-04T16:45:00Z",
  },
  {
    id: 10,
    facebookId: undefined,
    googleId: undefined,
    username: "rock_fan",
    email: "rock@example.com",
    password: "$2b$10$examplehashedpassword10",
    accountType: ["email"],
    fullName: "Rock Fan",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=rock",
    bio: "Rock music enthusiast",
    dob: "1989-02-14",
    gender: true,
    accessToken: "rock_access_token",
    refreshToken: "rock_refresh_token",
    expiry: "2024-12-24T23:59:59Z",
    otp: undefined,
    expireOtp: undefined,
    emailVerified: true,
    notificationEnabled: true,
    streamQuality: "high",
    status: "active",
    roleId: 2,
    lastLogin: "2024-12-03T11:20:00Z",
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-12-03T11:20:00Z",
  },
];

export const mockRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    description: "Truy cập và quản lý toàn bộ hệ thống",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "User",
    description: "Người dùng thông thường với quyền hạn tiêu chuẩn",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const mockPosts: Post[] = [
  {
    id: 1,
    userId: 2,
    content:
      "Vừa phát hiện một bài hát mới tuyệt vời! Nhịp điệu tuyệt vời và lời bài hát chạm đến trái tim mình. 🎵✨",
    fileUrl: undefined,
    heartCount: 15,
    shareCount: 5,
    uploadedAt: "2024-12-08T09:00:00Z",
    commentCount: 3,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-08T09:00:00Z",
    updatedAt: "2024-12-08T09:00:00Z",
  },
  {
    id: 2,
    userId: 3,
    content:
      "Ai cũng mê nghệ sĩ này không? Album mới nhất của họ là thiên tài thuần túy! Bài hát yêu thích của bạn là gì?",
    fileUrl: undefined,
    heartCount: 8,
    shareCount: 2,
    uploadedAt: "2024-12-07T16:30:00Z",
    commentCount: 5,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-07T16:30:00Z",
    updatedAt: "2024-12-07T16:30:00Z",
  },
  {
    id: 3,
    userId: 3,
    content:
      "Đang tạo danh sách phát hoàn hảo cho buổi tập gym. Cần gợi ý những bài hát năng lượng cao! 💪🎧",
    fileUrl: undefined,
    heartCount: 12,
    shareCount: 3,
    uploadedAt: "2024-12-06T14:20:00Z",
    commentCount: 7,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-06T14:20:00Z",
    updatedAt: "2024-12-06T14:20:00Z",
  },
  {
    id: 4,
    userId: 2,
    content:
      "Bài hát này gợi lại nhiều kỷ niệm. Âm nhạc có sức mạnh đưa chúng ta ngược thời gian. 🌟",
    fileUrl: undefined,
    heartCount: 22,
    shareCount: 8,
    uploadedAt: "2024-12-05T11:45:00Z",
    commentCount: 4,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-05T11:45:00Z",
    updatedAt: "2024-12-05T11:45:00Z",
  },
  {
    id: 5,
    userId: 5,
    content:
      "Cuối tuần này có ai muốn đi concert không? Tôi có vé dư cho show của Luna Eclipse! 🎫🎶",
    fileUrl: undefined,
    heartCount: 9,
    shareCount: 4,
    uploadedAt: "2024-12-04T18:15:00Z",
    commentCount: 6,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-04T18:15:00Z",
    updatedAt: "2024-12-04T18:15:00Z",
  },
  {
    id: 6,
    userId: 6,
    content:
      "Vừa hoàn thành playlist mới với chủ đề 'Nhạc Buồn'. Hoàn hảo cho những ngày mưa. ☔️",
    fileUrl: undefined,
    heartCount: 18,
    shareCount: 6,
    uploadedAt: "2024-12-03T13:30:00Z",
    commentCount: 8,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-03T13:30:00Z",
    updatedAt: "2024-12-03T13:30:00Z",
  },
  {
    id: 7,
    userId: 9,
    content:
      "Review album mới của Peak Experience: 10/10! Những riff guitar đỉnh cao và lyrics sâu sắc. 🤘",
    fileUrl: undefined,
    heartCount: 25,
    shareCount: 10,
    uploadedAt: "2024-12-02T20:45:00Z",
    commentCount: 12,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-02T20:45:00Z",
    updatedAt: "2024-12-02T20:45:00Z",
  },
  {
    id: 8,
    userId: 10,
    content: "Tìm kiếm những bài hát indie mới. Ai có gợi ý gì không? 🎸",
    fileUrl: undefined,
    heartCount: 7,
    shareCount: 1,
    uploadedAt: "2024-12-01T16:20:00Z",
    commentCount: 4,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-12-01T16:20:00Z",
    updatedAt: "2024-12-01T16:20:00Z",
  },
  {
    id: 9,
    userId: 4,
    content:
      "Vừa cover một bài hát cổ điển. Link trong bio! Hy vọng mọi người thích. 🎤",
    fileUrl: "https://example.com/audio/cover.mp3",
    heartCount: 31,
    shareCount: 15,
    uploadedAt: "2024-11-30T12:10:00Z",
    commentCount: 15,
    songId: 1,
    isCover: true,
    originalSongId: 1,
    createdAt: "2024-11-30T12:10:00Z",
    updatedAt: "2024-11-30T12:10:00Z",
  },
  {
    id: 10,
    userId: 5,
    content:
      "Spotify Wrapped 2024 của tôi: 80% là nhạc điện tử. Ai giống mình không? 📊🎵",
    fileUrl: undefined,
    heartCount: 14,
    shareCount: 7,
    uploadedAt: "2024-11-29T14:55:00Z",
    commentCount: 9,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-29T14:55:00Z",
    updatedAt: "2024-11-29T14:55:00Z",
  },
  {
    id: 11,
    userId: 6,
    content:
      "Đang học chơi guitar. Khó thật đấy nhưng vui! Ai có tips gì không? 🎸",
    fileUrl: undefined,
    heartCount: 11,
    shareCount: 2,
    uploadedAt: "2024-11-28T17:40:00Z",
    commentCount: 7,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-28T17:40:00Z",
    updatedAt: "2024-11-28T17:40:00Z",
  },
  {
    id: 12,
    userId: 9,
    content:
      "Vừa nghe lại những bài hát cũ của mình. Nhạc của 5 năm trước nghe sao ấy nhỉ? 😅",
    fileUrl: undefined,
    heartCount: 16,
    shareCount: 5,
    uploadedAt: "2024-11-27T11:25:00Z",
    commentCount: 5,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-27T11:25:00Z",
    updatedAt: "2024-11-27T11:25:00Z",
  },
  {
    id: 13,
    userId: 10,
    content:
      "Concert của City Lights thật tuyệt! Stage setup đỉnh cao và âm thanh hoàn hảo. 🌟",
    fileUrl: undefined,
    heartCount: 20,
    shareCount: 9,
    uploadedAt: "2024-11-26T19:30:00Z",
    commentCount: 10,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-26T19:30:00Z",
    updatedAt: "2024-11-26T19:30:00Z",
  },
  {
    id: 14,
    userId: 2,
    content:
      "Tạo playlist 'Study Session' mới. Hoàn hảo để tập trung học tập. 📚🎧",
    fileUrl: undefined,
    heartCount: 13,
    shareCount: 4,
    uploadedAt: "2024-11-25T15:15:00Z",
    commentCount: 6,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-25T15:15:00Z",
    updatedAt: "2024-11-25T15:15:00Z",
  },
  {
    id: 15,
    userId: 3,
    content:
      "Ai thích nhạc jazz không? Vừa khám phá Miles Davis và bị chinh phục luôn! 🎷",
    fileUrl: undefined,
    heartCount: 8,
    shareCount: 3,
    uploadedAt: "2024-11-24T10:50:00Z",
    commentCount: 4,
    songId: undefined,
    isCover: false,
    originalSongId: undefined,
    createdAt: "2024-11-24T10:50:00Z",
    updatedAt: "2024-11-24T10:50:00Z",
  },
];

export const mockComments: Comment[] = [
  {
    id: 1,
    userId: 3,
    postId: 1,
    content: "Tôi hoàn toàn đồng ý! Chất lượng sản xuất xuất sắc.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-08T09:15:00Z",
    createdAt: "2024-12-08T09:15:00Z",
    updatedAt: "2024-12-08T09:15:00Z",
  },
  {
    id: 2,
    userId: 2,
    postId: 1,
    content: "Bạn đang nói về bài hát nào vậy? Tôi cần kiểm tra ngay!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-08T09:30:00Z",
    createdAt: "2024-12-08T09:30:00Z",
    updatedAt: "2024-12-08T09:30:00Z",
  },
  {
    id: 3,
    userId: 2,
    postId: 1,
    content:
      "Đó là single mới từ album mới nhất của họ. Bạn sẽ không thất vọng đâu!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-08T09:45:00Z",
    createdAt: "2024-12-08T09:45:00Z",
    updatedAt: "2024-12-08T09:45:00Z",
  },
  {
    id: 4,
    userId: 2,
    postId: 2,
    content: '"Midnight Dreams" là bài hát yêu thích tuyệt đối của tôi!',
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-07T17:00:00Z",
    createdAt: "2024-12-07T17:00:00Z",
    updatedAt: "2024-12-07T17:00:00Z",
  },
  {
    id: 5,
    userId: 2,
    postId: 2,
    content: "Tôi thích những bản cũ hơn của họ, nhưng album này vẫn rất tốt.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-07T17:30:00Z",
    createdAt: "2024-12-07T17:30:00Z",
    updatedAt: "2024-12-07T17:30:00Z",
  },
  {
    id: 6,
    userId: 5,
    postId: 3,
    content: "Thử nghe 'Electric Soul' của Neon Pulse đi, rất hợp để tập!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-06T14:45:00Z",
    createdAt: "2024-12-06T14:45:00Z",
    updatedAt: "2024-12-06T14:45:00Z",
  },
  {
    id: 7,
    userId: 6,
    postId: 3,
    content: "Tôi có playlist gym riêng, chủ yếu là rock và electronic.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-06T15:20:00Z",
    createdAt: "2024-12-06T15:20:00Z",
    updatedAt: "2024-12-06T15:20:00Z",
  },
  {
    id: 8,
    userId: 9,
    postId: 4,
    content: "Nhạc có sức mạnh chữa lành tâm hồn. Cảm ơn đã chia sẻ!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-05T12:30:00Z",
    createdAt: "2024-12-05T12:30:00Z",
    updatedAt: "2024-12-05T12:30:00Z",
  },
  {
    id: 9,
    userId: 6,
    postId: 5,
    content: "Wow! Tôi cũng muốn đi concert lắm. Luna Eclipse đỉnh quá!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-04T18:45:00Z",
    createdAt: "2024-12-04T18:45:00Z",
    updatedAt: "2024-12-04T18:45:00Z",
  },
  {
    id: 10,
    userId: 9,
    postId: 5,
    content: "Tôi đã xem họ biểu diễn rồi, show tuyệt vời!",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-04T19:15:00Z",
    createdAt: "2024-12-04T19:15:00Z",
    updatedAt: "2024-12-04T19:15:00Z",
  },
  {
    id: 11,
    userId: 10,
    postId: 6,
    content: "Link playlist đi! Tôi đang cần nhạc buồn cho chiều mưa.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-03T14:00:00Z",
    createdAt: "2024-12-03T14:00:00Z",
    updatedAt: "2024-12-03T14:00:00Z",
  },
  {
    id: 12,
    userId: 2,
    postId: 7,
    content: "Đồng ý! Album này thay đổi cách tôi nghe rock.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-02T21:30:00Z",
    createdAt: "2024-12-02T21:30:00Z",
    updatedAt: "2024-12-02T21:30:00Z",
  },
  {
    id: 13,
    userId: 5,
    postId: 8,
    content: "Thử nghe 'Ocean Waves' của Azure Blue đi, rất chill.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-12-01T17:00:00Z",
    createdAt: "2024-12-01T17:00:00Z",
    updatedAt: "2024-12-01T17:00:00Z",
  },
  {
    id: 14,
    userId: 6,
    postId: 9,
    content: "Cover hay quá! Giọng bạn rất đặc biệt.",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-11-30T13:00:00Z",
    createdAt: "2024-11-30T13:00:00Z",
    updatedAt: "2024-11-30T13:00:00Z",
  },
  {
    id: 15,
    userId: 9,
    postId: 10,
    content: "Tôi cũng 70% electronic. Có gợi ý playlist nào không?",
    parentId: undefined,
    fileUrl: undefined,
    commentedAt: "2024-11-29T15:30:00Z",
    createdAt: "2024-11-29T15:30:00Z",
    updatedAt: "2024-11-29T15:30:00Z",
  },
];

export const mockTracks: Track[] = [
  {
    id: 1,
    spotifyId: "track1",
    title: "Giấc Mơ Nửa Đêm",
    artist: "Luna Eclipse",
    album: "Đêm Sao",
    genre: "Electronic",
    duration: 245,
    albumId: 1,
    discNumber: 1,
    explicit: false,
    playCount: 1000,
    shareCount: 50,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    spotifyId: "track2",
    title: "Linh Hồn Điện",
    artist: "Neon Pulse",
    album: "Trái Tim Kỹ Thuật Số",
    genre: "Electronic",
    duration: 198,
    albumId: 2,
    discNumber: 1,
    explicit: false,
    playCount: 800,
    shareCount: 40,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 3,
    spotifyId: "track3",
    title: "Sóng Biển",
    artist: "Azure Blue",
    album: "Không Khí Biển",
    genre: "Ambient",
    duration: 312,
    albumId: 3,
    discNumber: 1,
    explicit: false,
    playCount: 600,
    shareCount: 30,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: 4,
    spotifyId: "track4",
    title: "Nhịp Điệu Đô Thị",
    artist: "City Lights",
    album: "Beat Đường Phố",
    genre: "Hip Hop",
    duration: 187,
    albumId: 4,
    discNumber: 1,
    explicit: false,
    playCount: 900,
    shareCount: 45,
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: 5,
    spotifyId: "track5",
    title: "Đỉnh Núi Cao",
    artist: "Peak Experience",
    album: "Âm Thanh Đỉnh Cao",
    genre: "Rock",
    duration: 276,
    albumId: 5,
    discNumber: 1,
    explicit: false,
    playCount: 700,
    shareCount: 35,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: 6,
    spotifyId: "track6",
    title: "Mưa Đêm",
    artist: "Luna Eclipse",
    album: "Đêm Sao",
    genre: "Electronic",
    duration: 289,
    albumId: 1,
    discNumber: 1,
    explicit: false,
    playCount: 500,
    shareCount: 25,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 7,
    spotifyId: "track7",
    title: "Điện Tử Vượt Thời Gian",
    artist: "Neon Pulse",
    album: "Trái Tim Kỹ Thuật Số",
    genre: "Electronic",
    duration: 215,
    albumId: 2,
    discNumber: 1,
    explicit: false,
    playCount: 400,
    shareCount: 20,
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: 8,
    spotifyId: "track8",
    title: "Biển Xanh",
    artist: "Azure Blue",
    album: "Không Khí Biển",
    genre: "Ambient",
    duration: 345,
    albumId: 3,
    discNumber: 1,
    explicit: false,
    playCount: 300,
    shareCount: 15,
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-02-10T00:00:00Z",
  },
  {
    id: 9,
    spotifyId: "track9",
    title: "Đường Phố Nhộn Nhịp",
    artist: "City Lights",
    album: "Beat Đường Phố",
    genre: "Hip Hop",
    duration: 201,
    albumId: 4,
    discNumber: 1,
    explicit: false,
    playCount: 550,
    shareCount: 28,
    createdAt: "2024-02-20T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
  },
  {
    id: 10,
    spotifyId: "track10",
    title: "Núi Rừng",
    artist: "Peak Experience",
    album: "Âm Thanh Đỉnh Cao",
    genre: "Rock",
    duration: 298,
    albumId: 5,
    discNumber: 1,
    explicit: false,
    playCount: 450,
    shareCount: 22,
    createdAt: "2024-03-10T00:00:00Z",
    updatedAt: "2024-03-10T00:00:00Z",
  },
  {
    id: 11,
    spotifyId: "track11",
    title: "Sao Băng",
    artist: "Luna Eclipse",
    album: "Đêm Sao",
    genre: "Electronic",
    duration: 267,
    albumId: 1,
    discNumber: 1,
    explicit: false,
    playCount: 350,
    shareCount: 18,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 12,
    spotifyId: "track12",
    title: "Tương Lai Kỹ Thuật",
    artist: "Neon Pulse",
    album: "Trái Tim Kỹ Thuật Số",
    genre: "Electronic",
    duration: 189,
    albumId: 2,
    discNumber: 1,
    explicit: false,
    playCount: 250,
    shareCount: 12,
    createdAt: "2024-01-25T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z",
  },
  {
    id: 13,
    spotifyId: "track13",
    title: "Gió Biển",
    artist: "Azure Blue",
    album: "Không Khí Biển",
    genre: "Ambient",
    duration: 378,
    albumId: 3,
    discNumber: 1,
    explicit: false,
    playCount: 200,
    shareCount: 10,
    createdAt: "2024-02-05T00:00:00Z",
    updatedAt: "2024-02-05T00:00:00Z",
  },
  {
    id: 14,
    spotifyId: "track14",
    title: "Rap Đô Thị",
    artist: "City Lights",
    album: "Beat Đường Phố",
    genre: "Hip Hop",
    duration: 176,
    albumId: 4,
    discNumber: 1,
    explicit: false,
    playCount: 600,
    shareCount: 30,
    createdAt: "2024-02-25T00:00:00Z",
    updatedAt: "2024-02-25T00:00:00Z",
  },
  {
    id: 15,
    spotifyId: "track15",
    title: "Phiêu Lưu Núi",
    artist: "Peak Experience",
    album: "Âm Thanh Đỉnh Cao",
    genre: "Rock",
    duration: 312,
    albumId: 5,
    discNumber: 1,
    explicit: false,
    playCount: 320,
    shareCount: 16,
    createdAt: "2024-03-05T00:00:00Z",
    updatedAt: "2024-03-05T00:00:00Z",
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: 1,
    name: "Nhạc Chill",
    description: "Hoàn hảo để thư giãn và nghỉ ngơi",
    userId: 2,
    isPublic: true,
    shareCount: 10,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Mix Tập Gym",
    description: "Những bài hát năng lượng cao để tập luyện",
    userId: 3,
    isPublic: true,
    shareCount: 15,
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: 3,
    name: "Rock Cổ Điển",
    description: "Những bản rock bất hủ",
    userId: 2,
    isPublic: false,
    shareCount: 5,
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
  {
    id: 4,
    name: "Nhạc Buồn",
    description: "Playlist cho những ngày mưa và suy tư",
    userId: 6,
    isPublic: true,
    shareCount: 20,
    createdAt: "2024-04-15T00:00:00Z",
    updatedAt: "2024-04-15T00:00:00Z",
  },
  {
    id: 5,
    name: "Điện Tử Hiện Đại",
    description: "Những bản nhạc điện tử mới nhất",
    userId: 5,
    isPublic: true,
    shareCount: 25,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: 6,
    name: "Hip Hop Việt",
    description: "Rap và hip hop từ Việt Nam",
    userId: 9,
    isPublic: false,
    shareCount: 8,
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: 7,
    name: "Ambient & Chillout",
    description: "Âm nhạc nền cho công việc và thư giãn",
    userId: 10,
    isPublic: true,
    shareCount: 12,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: 8,
    name: "Rock Việt Nam",
    description: "Rock từ các nghệ sĩ Việt",
    userId: 2,
    isPublic: true,
    shareCount: 18,
    createdAt: "2024-06-15T00:00:00Z",
    updatedAt: "2024-06-15T00:00:00Z",
  },
  {
    id: 9,
    name: "Jazz Classics",
    description: "Những bản jazz kinh điển",
    userId: 3,
    isPublic: false,
    shareCount: 6,
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-07-01T00:00:00Z",
  },
  {
    id: 10,
    name: "Indie Gems",
    description: "Những bản indie ẩn dật",
    userId: 5,
    isPublic: true,
    shareCount: 22,
    createdAt: "2024-07-15T00:00:00Z",
    updatedAt: "2024-07-15T00:00:00Z",
  },
];

export const mockArtists: Artist[] = [
  {
    id: 1,
    spotifyId: "artist1",
    name: "Luna Eclipse",
    bio: "Nhà sản xuất nhạc điện tử nổi tiếng với những cảnh quan âm thanh không gian và giai điệu mơ màng.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    spotifyId: "artist2",
    name: "Neon Pulse",
    bio: "Người tiên phong synthwave kết hợp thẩm mỹ retro với sản xuất điện tử hiện đại.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=neon",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 3,
    spotifyId: "artist3",
    name: "Azure Blue",
    bio: "Nhà soạn nhạc ambient tạo ra những môi trường âm thanh yên bình.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=azure",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: 4,
    spotifyId: "artist4",
    name: "City Lights",
    bio: "Nghệ sĩ hip hop nắm bắt năng lượng và nhịp điệu của cuộc sống đô thị.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=city",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: 5,
    spotifyId: "artist5",
    name: "Peak Experience",
    bio: "Ban nhạc rock mang đến những bản anthem mạnh mẽ lấy cảm hứng từ thiên nhiên và phiêu lưu.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=peak",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: 6,
    spotifyId: "artist6",
    name: "Starry Night",
    bio: "Ca sĩ indie với giọng hát nhẹ nhàng và lyrics sâu sắc về cuộc sống hàng ngày.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=starry",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: 7,
    spotifyId: "artist7",
    name: "Electric Dreams",
    bio: "Nhóm nhạc điện tử kết hợp EDM với các yếu tố truyền thống Á Đông.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=electric",
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
  {
    id: 8,
    spotifyId: "artist8",
    name: "Ocean Waves",
    bio: "Nhà sản xuất ambient chuyên tạo ra âm thanh thư giãn từ thiên nhiên.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ocean",
    createdAt: "2024-04-15T00:00:00Z",
    updatedAt: "2024-04-15T00:00:00Z",
  },
  {
    id: 9,
    spotifyId: "artist9",
    name: "Urban Beats",
    bio: "Nghệ sĩ hip hop underground với flow độc đáo và lyrics xã hội.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=urban",
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: 10,
    spotifyId: "artist10",
    name: "Mountain Echo",
    bio: "Ban nhạc rock indie lấy cảm hứng từ núi rừng và cuộc sống mạo hiểm.",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mountain",
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
];

export const mockAlbums: Album[] = [
  {
    id: 1,
    spotifyId: "album1",
    name: "Đêm Sao",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=album1",
    totalTracks: 12,
    releaseDate: "2024-01-15T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    spotifyId: "album2",
    name: "Trái Tim Kỹ Thuật Số",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=album2",
    totalTracks: 10,
    releaseDate: "2024-02-01T00:00:00Z",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 3,
    spotifyId: "album3",
    name: "Không Khí Biển",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=album3",
    totalTracks: 8,
    releaseDate: "2024-02-15T00:00:00Z",
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: 4,
    spotifyId: "album4",
    name: "Beat Đường Phố",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=album4",
    totalTracks: 14,
    releaseDate: "2024-03-01T00:00:00Z",
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: 5,
    spotifyId: "album5",
    name: "Âm Thanh Đỉnh Cao",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=album5",
    totalTracks: 11,
    releaseDate: "2024-03-15T00:00:00Z",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
];

export const mockPostReports: PostReport[] = [
  {
    id: 1,
    postId: 1,
    reporterId: 2,
    reason: "nội dung người lớn",
    status: "pending",
    reportedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: 2,
    postId: 2,
    reporterId: 2,
    reason: "nội dung không mong muốn",
    status: "resolved",
    reportedAt: "2024-12-07T14:30:00Z",
  },
  {
    id: 3,
    postId: 3,
    reporterId: 3,
    reason: "nội dung không mong muốn",
    status: "pending",
    reportedAt: "2024-12-06T16:45:00Z",
  },
];

export const mockGenres: Genres[] = [
  {
    id: 1,
    name: "Pop",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Rock",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Electronic",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "Jazz",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Hip Hop",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    name: "Indie",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    name: "Ambient",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 8,
    name: "Classical",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const mockLikes: Like[] = [
  {
    id: 1,
    userId: 2,
    postId: 1,
    likedAt: "2024-12-08T09:20:00Z",
  },
  {
    id: 2,
    userId: 3,
    postId: 1,
    likedAt: "2024-12-08T09:25:00Z",
  },
  {
    id: 3,
    userId: 5,
    postId: 2,
    likedAt: "2024-12-07T17:15:00Z",
  },
  {
    id: 4,
    userId: 6,
    postId: 3,
    likedAt: "2024-12-06T15:00:00Z",
  },
  {
    id: 5,
    userId: 9,
    postId: 4,
    likedAt: "2024-12-05T12:45:00Z",
  },
];

export const mockCommentLikes: CommentLike[] = [
  {
    userId: 2,
    commentId: 1,
    likedAt: "2024-12-08T09:35:00Z",
  },
  {
    userId: 3,
    commentId: 2,
    likedAt: "2024-12-08T09:40:00Z",
  },
  {
    userId: 5,
    commentId: 4,
    likedAt: "2024-12-07T17:20:00Z",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 1,
    type: "private",
    name: undefined,
    lastMessageId: 1,
    creatorId: 2,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: 2,
    type: "group",
    name: "Music Lovers",
    lastMessageId: 5,
    creatorId: 3,
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-12-07T16:00:00Z",
  },
];

export const mockConversationMembers: ConversationMember[] = [
  {
    id: 1,
    conversationId: 1,
    userId: 2,
    isAdmin: true,
    lastReadMessageId: 1,
    status: "active",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: 2,
    conversationId: 1,
    userId: 3,
    isAdmin: false,
    lastReadMessageId: 1,
    status: "active",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: 3,
    conversationId: 2,
    userId: 3,
    isAdmin: true,
    lastReadMessageId: 5,
    status: "active",
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
  },
  {
    id: 4,
    conversationId: 2,
    userId: 5,
    isAdmin: false,
    lastReadMessageId: 3,
    status: "active",
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
  },
];

export const mockMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    content: "Hey, nghe bài hát mới của Luna Eclipse chưa?",
    type: "text",
    fileUrl: undefined,
    replyToId: undefined,
    createdAt: "2024-12-08T10:00:00Z",
    updatedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 3,
    content: "Chưa, link cho mình nghe với!",
    type: "text",
    fileUrl: undefined,
    replyToId: undefined,
    createdAt: "2024-12-08T10:05:00Z",
    updatedAt: "2024-12-08T10:05:00Z",
  },
  {
    id: 3,
    conversationId: 2,
    senderId: 3,
    content: "Ai muốn đi concert cuối tuần này không?",
    type: "text",
    fileUrl: undefined,
    replyToId: undefined,
    createdAt: "2024-12-07T16:00:00Z",
    updatedAt: "2024-12-07T16:00:00Z",
  },
  {
    id: 4,
    conversationId: 2,
    senderId: 5,
    content: "Mình muốn! Luna Eclipse đúng không?",
    type: "text",
    fileUrl: undefined,
    replyToId: undefined,
    createdAt: "2024-12-07T16:10:00Z",
    updatedAt: "2024-12-07T16:10:00Z",
  },
  {
    id: 5,
    conversationId: 2,
    senderId: 3,
    content: "Đúng rồi! Mình có 2 vé.",
    type: "text",
    fileUrl: undefined,
    replyToId: undefined,
    createdAt: "2024-12-07T16:15:00Z",
    updatedAt: "2024-12-07T16:15:00Z",
  },
];

export const mockMessageHides: MessageHide[] = [
  {
    id: 1,
    messageId: 1,
    userId: 3,
    createdAt: "2024-12-08T10:10:00Z",
    updatedAt: "2024-12-08T10:10:00Z",
  },
];

export const mockPostHides: PostHide[] = [
  {
    id: 1,
    postId: 1,
    userId: 3,
    createdAt: "2024-12-08T09:30:00Z",
    updatedAt: "2024-12-08T09:30:00Z",
  },
];

export const mockFollowArtists: FollowArtist[] = [
  {
    id: 1,
    followerId: 2,
    artistId: 1,
    followedAt: "2024-11-01T00:00:00Z",
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
  {
    id: 2,
    followerId: 3,
    artistId: 2,
    followedAt: "2024-11-05T00:00:00Z",
    createdAt: "2024-11-05T00:00:00Z",
    updatedAt: "2024-11-05T00:00:00Z",
  },
  {
    id: 3,
    followerId: 5,
    artistId: 1,
    followedAt: "2024-11-10T00:00:00Z",
    createdAt: "2024-11-10T00:00:00Z",
    updatedAt: "2024-11-10T00:00:00Z",
  },
];

export const mockFollowUsers: FollowUser[] = [
  {
    id: 1,
    followerId: 2,
    followeeId: 3,
    followedAt: "2024-10-15T00:00:00Z",
    createdAt: "2024-10-15T00:00:00Z",
    updatedAt: "2024-10-15T00:00:00Z",
  },
  {
    id: 2,
    followerId: 3,
    followeeId: 5,
    followedAt: "2024-10-20T00:00:00Z",
    createdAt: "2024-10-20T00:00:00Z",
    updatedAt: "2024-10-20T00:00:00Z",
  },
  {
    id: 3,
    followerId: 5,
    followeeId: 2,
    followedAt: "2024-10-25T00:00:00Z",
    createdAt: "2024-10-25T00:00:00Z",
    updatedAt: "2024-10-25T00:00:00Z",
  },
];

export const mockPlaylistTracks: PlaylistTrack[] = [
  {
    id: 1,
    playlistId: 1,
    trackId: 1,
    playlistSpotifyId: "playlist1",
    trackSpotifyId: "track1",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: 2,
    playlistId: 1,
    trackId: 2,
    playlistSpotifyId: "playlist1",
    trackSpotifyId: "track2",
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: 3,
    playlistId: 2,
    trackId: 2,
    playlistSpotifyId: "playlist2",
    trackSpotifyId: "track2",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
  {
    id: 4,
    playlistId: 2,
    trackId: 3,
    playlistSpotifyId: "playlist2",
    trackSpotifyId: "track3",
    createdAt: "2024-03-15T00:00:00Z",
    updatedAt: "2024-03-15T00:00:00Z",
  },
];

export const mockListeningHistories: ListeningHistory[] = [
  {
    userId: 2,
    itemId: 1,
    type: "track",
    listenedAt: "2024-12-08T08:00:00Z",
    durationListened: 245,
    createdAt: "2024-12-08T08:00:00Z",
    updatedAt: "2024-12-08T08:00:00Z",
  },
  {
    userId: 3,
    itemId: 2,
    type: "track",
    listenedAt: "2024-12-07T20:30:00Z",
    durationListened: 198,
    createdAt: "2024-12-07T20:30:00Z",
    updatedAt: "2024-12-07T20:30:00Z",
  },
  {
    userId: 5,
    itemId: 1,
    type: "playlist",
    listenedAt: "2024-12-06T15:45:00Z",
    durationListened: 1200,
    createdAt: "2024-12-06T15:45:00Z",
    updatedAt: "2024-12-06T15:45:00Z",
  },
];

export const mockSearchHistories: SearchHistory[] = [
  {
    id: 1,
    userId: 2,
    query: "Luna Eclipse",
    searchedAt: "2024-12-08T09:00:00Z",
    createdAt: "2024-12-08T09:00:00Z",
    updatedAt: "2024-12-08T09:00:00Z",
  },
  {
    id: 2,
    userId: 3,
    query: "electronic music",
    searchedAt: "2024-12-07T14:20:00Z",
    createdAt: "2024-12-07T14:20:00Z",
    updatedAt: "2024-12-07T14:20:00Z",
  },
  {
    id: 3,
    userId: 5,
    query: "jazz classics",
    searchedAt: "2024-12-06T11:30:00Z",
    createdAt: "2024-12-06T11:30:00Z",
    updatedAt: "2024-12-06T11:30:00Z",
  },
];

export const mockStatDailyPlays: StatDailyPlays[] = [
  {
    songId: 1,
    date: "2024-12-08",
    playCount: 150,
  },
  {
    songId: 2,
    date: "2024-12-08",
    playCount: 120,
  },
  {
    songId: 1,
    date: "2024-12-07",
    playCount: 180,
  },
  {
    songId: 2,
    date: "2024-12-07",
    playCount: 140,
  },
];

export const mockSyncStatuses: SyncStatus[] = [
  {
    id: 1,
    userId: 2,
    deviceId: 1,
    lastSync: "2024-12-08T10:00:00Z",
    status: "completed",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-08T10:00:00Z",
  },
  {
    id: 2,
    userId: 3,
    deviceId: 2,
    lastSync: "2024-12-07T16:30:00Z",
    status: "completed",
    createdAt: "2024-11-20T00:00:00Z",
    updatedAt: "2024-12-07T16:30:00Z",
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    userId: 2,
    songId: 3,
    score: 0.85,
    isClicked: false,
    generatedAt: "2024-12-08T00:00:00Z",
    createdAt: "2024-12-08T00:00:00Z",
    updatedAt: "2024-12-08T00:00:00Z",
  },
  {
    userId: 3,
    songId: 4,
    score: 0.92,
    isClicked: true,
    generatedAt: "2024-12-07T00:00:00Z",
    createdAt: "2024-12-07T00:00:00Z",
    updatedAt: "2024-12-07T00:00:00Z",
  },
  {
    userId: 5,
    songId: 1,
    score: 0.78,
    isClicked: false,
    generatedAt: "2024-12-06T00:00:00Z",
    createdAt: "2024-12-06T00:00:00Z",
    updatedAt: "2024-12-06T00:00:00Z",
  },
];

// Helper Functions
export const getUserById = (id: number): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getRoleById = (id: number): Role | undefined => {
  return mockRoles.find((role) => role.id === id);
};

export const getPostById = (id: number): Post | undefined => {
  return mockPosts.find((post) => post.id === id);
};

export const getCommentsByPostId = (postId: number): Comment[] => {
  return mockComments.filter((comment) => comment.postId === postId);
};

export const getTracksByPlaylistId = (playlistId: number): Track[] => {
  const tracksPerPlaylist: Record<number, Track[]> = {
    1: [mockTracks[0], mockTracks[1]], // Nhạc Chill
    2: [mockTracks[1], mockTracks[2]], // Mix Tập Gym
    3: [mockTracks[0], mockTracks[2]], // Rock Cổ Điển
  };
  return tracksPerPlaylist[playlistId] || [];
};

export const getStats = () => {
  return {
    totalUsers: mockUsers.length,
    totalPosts: mockPosts.length,
    totalTracks: mockTracks.length,
    totalPlaylists: mockPlaylists.length,
    totalReports: mockPostReports.filter((r) => r.status === "pending").length,
    totalLikes: mockLikes.length,
    totalFollows: mockFollowArtists.length + mockFollowUsers.length,
    totalConversations: mockConversations.length,
    totalMessages: mockMessages.length,
    totalListeningHistories: mockListeningHistories.length,
    totalGenres: mockGenres.length,
    totalComments: mockComments.length,
    totalCommentLikes: mockCommentLikes.length,
    totalMessageHides: mockMessageHides.length,
    totalPostHides: mockPostHides.length,
    totalPlaylistTracks: mockPlaylistTracks.length,
    totalSearchHistories: mockSearchHistories.length,
    totalStatDailyPlays: mockStatDailyPlays.length,
    totalSyncStatuses: mockSyncStatuses.length,
    totalRecommendations: mockRecommendations.length,
  };
};
