import useAuthStore from "@/store/authStore";
import axiosClient from "@/config/axiosClient";
const api = axiosClient;

// === INTERFACES ===
export interface UserInfo {
  id: number;
  username: string;
  avatarUrl: string;
  fullName: string;

  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  userId: number;
  postId: number;
  content: string;
  parentId: number | null;
  commentedAt: string;
  User: UserInfo;
  likeCount: number;
  isLiked: boolean;
  Replies?: Comment[];
  quote?: {
    username: string;
    content: string;
  };
}

export interface Post {
  id: string;
  userId: number;
  content: string;
  fileUrl: string[] | string;
  musicLink: string | null;
  heartCount: number;
  shareCount: number;
  uploadedAt: string;
  User: UserInfo;
  commentCount: number;
  isLiked: boolean;
  isCover?: boolean;
  originalSongId?: number;
  OriginalSong?: {
    id: number;
    name: string;
    spotifyId: string;
    artists?: { id: number; name: string }[];
  };
}

export interface ProfileSocial {
  id: number;
  username: string;
  avatarUrl: string;
  fullName: string;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

// HÀM HỖ TRỢ: Ánh xạ dữ liệu Comment (được sử dụng cho cả Post và Comment API)
const mapCommentData = (comment: any): Comment => {
  // Hàm đệ quy để xử lý Replies
  const mapReplies = (replies: any[]): Comment[] => {
    return replies.map((reply: any) => ({
      ...reply,
      id: reply.id.toString(),
      likeCount: reply.likeCount || 0,
      isLiked: reply.isLiked || false, // Nếu Replies có Replies, tiếp tục đệ quy (chỉ nên áp dụng cho Replies trong Post API)
      // Ở đây, ta chỉ cần một cấp Replies
      replies: reply.Replies ? mapReplies(reply.Replies) : [],
    }));
  };
  return {
    ...comment,
    id: comment.id.toString(),
    likeCount: comment.likeCount || 0,
    isLiked: comment.isLiked || false,
    User: {
      id: comment.User?.id,
      username: comment.User?.username,
      avatarUrl: comment.User?.avatarUrl,
      fullName: comment.User?.fullName || comment.User?.username || "User",
    },
    replies: comment.Replies ? mapReplies(comment.Replies) : [],
  };
};

// === API CHO BÀI ĐĂNG ===

/** Lấy danh sách tất cả bài đăng mới nhất
 * Endpoint: GET /api/v1/posts
 */
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get("/posts");
    return response.data as Post[];
  } catch (error) {
    console.error("Lỗi khi tải bài đăng:", error);
    throw error;
  }
};

/**
 * Lấy danh sách Bài đăng theo User ID từ server.
 * Backend (Controller) đã đảm bảo dữ liệu là chuẩn hóa:
 * - fileUrl là Array<string>.
 * - isLiked là boolean.
 * * @param userId ID của người dùng.
 * @returns Promise<Post[]> Danh sách bài đăng đã chuẩn hóa.
 * Endpoint: GET /posts/byUser/:userId
 */
export const fetchPostsByUserId = async (
  userId: number
): Promise<Post[] | { message: string; status: string }> => {
  try {
    const response = await axiosClient.get(`/posts/byUser/${userId}`);
    const data = response.data;
    if (!Array.isArray(data)) {
      return { message: "Dữ liệu bài đăng không hợp lệ.", status: "error" };
    }
    return data as Post[];
  } catch (error) {
    console.error("Lỗi khi tải bài đăng của người dùng:", error);
    return {
      message: "Không thể tải bài đăng của người dùng.",
      status: "error",
    };
  }
};

/** * Tạo bài đăng mới.
 * @param content Nội dung bài đăng.
 * @param fileUrls URL của ảnh/video đã được upload (string[] | null).
 * @param songId ID của bài hát đính kèm (number | null).
 * @returns Promise<Post> Bài đăng đã tạo, đã được chuẩn hóa.
 */
export const createNewPost = async (
  content: string,
  fileUrls: string[] | null = null,
  songId: number | null = null
): Promise<Post | { message: string; status: string }> => {
  try {
    if (!useAuthStore.getState().user)
      return { message: "Chưa đăng nhập", status: "error" };
    // Gửi yêu cầu POST. LƯU Ý: Frontend gửi `fileUrls` (là Array<string>).
    const response = await api.post("/posts", {
      content,
      fileUrls, // Backend sẽ nhận Array<string> và chuyển thành chuỗi JSON
      songId,
    });
    const newPostResponse = response.data.post;
    return newPostResponse as Post;
  } catch (error) {
    console.error("Lỗi tạo bài đăng:", error);
    return { message: "Không thể tạo bài đăng mới.", status: "error" };
  }
};

/** Thích / Bỏ thích bài đăng.
 * @returns {isLiked: boolean, heartCount: number} Trạng thái like và số lượng like mới nhất.
 * Endpoint: POST /api/v1/posts/:postId/like
 */
export const togglePostLike = async (
  postId: string
): Promise<
  { isLiked: boolean; heartCount: number } | { message: string; status: string }
> => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    const { isLiked, heartCount } = response.data;
    return {
      isLiked: !!isLiked,
      heartCount: heartCount || 0,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thích bài đăng:", error);
    return { message: "Không thể cập nhật trạng thái thích.", status: "error" };
  }
};

// === API CHO BÌNH LUẬN ===

/**  Endpoint GET /api/v1/comments/byPost/:postId
 * Trường parentId để trả lời comment khác
 * userId: user.id Server nên tự lấy từ token, nhưng gửi thêm để đồng bộ
 */
export const fetchCommentsByPostId = async (
  postId: string
): Promise<Comment[]> => {
  try {
    const response = await api.get(`/comments/byPost/${postId}`);
    const data = response.data;
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(mapCommentData) as Comment[];
  } catch (error) {
    console.error("Lỗi khi tải bình luận:", error);
    return [];
  }
};

/** * Tạo bình luận mới.
 * postId: ID của bài đăng.
 * content: Nội dung bình luận.
 * parentId: ID của bình luận cha (nếu là trả lời), null nếu bình luận gốc.
 * Endpoint : POST /api/v1/comments
 * @returns Promise<Comment> Bình luận đã tạo.
 */
export const createNewComment = async (
  postId: string,
  content: string,
  parentId: string | null = null
): Promise<Comment | { message: string; status: string }> => {
  try {
    if (!useAuthStore.getState().user)
      return { message: "Chưa đăng nhập", status: "error" };

    const response = await api.post("/comments", {
      postId: postId,
      content: content,
      parentId: parentId,
    });
    return response.data as Comment;
  } catch (error) {
    console.error("Lỗi khi đăng bình luận:", error);
    return { message: "Không thể đăng bình luận.", status: "error" };
  }
};

/** Thích / Bỏ thích bình luận.
 * commentId: ID của bình luận.
 * @returns {isLiked: boolean, likeCount: number} Trạng thái like và số lượng like mới nhất.
 * Endpoint: POST /api/v1/comments/:commentId/like
 */
export const toggleCommentLike = async (
  commentId: string
): Promise<
  { isLiked: boolean; likeCount: number } | { message: string; status: string }
> => {
  try {
    const response = await api.post(`/comments/${commentId}/like`);
    const { isLiked, likeCount } = response.data;
    return {
      isLiked: !!isLiked,
      likeCount: likeCount || 0,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thích bình luận:", error);
    return {
      message: "Không thể cập nhật trạng thái thích bình luận.",
      status: "error",
    };
  }
};

// === API CHO SOCIAL PROFILE ===

/** Lấy thông tin Profile xã hội (bao gồm follow count và isFollowing)
 * Endpoint: GET /api/v1/users/:userId/profile
 */
export const fetchUserProfileSocial = async (
  userId: number
): Promise<ProfileSocial | { message: string; status: string }> => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    const data = response.data;

    return {
      ...data,
      id: data.id,
      followerCount: data.followerCount || 0,
      followingCount: data.followingCount || 0,
      isFollowing: data.isFollowing === true,
    } as ProfileSocial;
  } catch (error) {
    console.error("Lỗi khi tải thông tin profile:", error);
    return { message: "Không thể tải thông tin profile.", status: "error" };
  }
};

/** Toggle Theo dõi/Hủy theo dõi
 * Endpoint: POST /api/v1/follows/users/:userId/follow
 */
export const toggleFollow = async (
  userId: number
): Promise<{ isFollowing: boolean } | { message: string; status: string }> => {
  try {
    const response = await api.post(`/follows/users/${userId}/follow`);
    return {
      isFollowing: response.data.isFollowing,
    };
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
    return {
      message: "Không thể thay đổi trạng thái theo dõi.",
      status: "error",
    };
  }
};

/** Lấy danh sách Người theo dõi (Followers)
 * userId: ID của người dùng.
 *  Endpoint: GET /api/v1/users/:userId/followers
 */
export const fetchFollowers = async (userId: number): Promise<UserInfo[]> => {
  try {
    const response = await api.get(`/follows/users/${userId}/followers`);
    return response.data as UserInfo[];
  } catch (error) {
    console.error("Lỗi khi tải danh sách người theo dõi:", error);
    throw error;
  }
};

/** Lấy danh sách Đang theo dõi (Following)
 * userId: ID của người dùng.
 * Endpoint: GET /api/v1/users/:userId/following
 */
export const fetchFollowing = async (userId: number): Promise<UserInfo[]> => {
  try {
    // Endpoint: GET /api/v1/users/:userId/following
    const response = await api.get(`/follows/users/${userId}/following`);
    return response.data as UserInfo[];
  } catch (error) {
    console.error("Lỗi khi tải danh sách đang theo dõi:", error);
    throw error;
  }
};

// === API CHO LIKE ===

/** Lấy danh sách người đã thích bài đăng
 * postId: ID của bài đăng.
 * Endpoint: GET /api/v1/posts/:postId/likes
 */
export const fetchLikesByPostId = async (
  postId: string
): Promise<
  {
    id: number;
    userId: number;
    postId: number;
    likedAt: string;
    User: UserInfo;
  }[]
> => {
  try {
    const response = await api.get(`/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách người đã thích:", error);
    throw error;
  }
};

/** Báo cáo bài đăng
 * postId: ID của bài đăng.
 * reason: Lý do báo cáo ('adult_content', 'self_harm', 'misinformation', 'unwanted_content').
 * Endpoint: POST /api/v1/posts/:postId/report
 */
export const reportPost = async (
  postId: string,
  reason: string
): Promise<
  { message: string; report: any } | { message: string; status: string }
> => {
  try {
    const response = await api.post(`/posts/${postId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi báo cáo bài đăng:", error);
    return { message: "Không thể gửi báo cáo.", status: "error" };
  }
};

/** Cập nhật bài đăng
 * postId: ID của bài đăng.
 * content: Nội dung mới.
 * fileUrls: Mảng URL file mới (có thể null).
 * songId: ID bài hát mới (có thể null).
 * Endpoint: PUT /api/v1/posts/update/:postId
 */
export const updatePost = async (
  postId: string,
  content: string,
  fileUrls: string[] | null = null,
  songId: number | null = null
): Promise<Post | { message: string; status: string }> => {
  try {
    if (!useAuthStore.getState().user)
      return { message: "Chưa đăng nhập", status: "error" };

    const response = await api.put(`/posts/update/${postId}`, {
      content,
      fileUrls,
      songId,
    });
    return response.data as Post;
  } catch (error) {
    console.error("Lỗi khi cập nhật bài đăng:", error);
    return { message: "Không thể cập nhật bài đăng.", status: "error" };
  }
};

/** Xóa bài đăng
 * postId: ID của bài đăng.
 * Endpoint: DELETE /api/v1/posts/remove/:postId
 */
export const deletePost = async (
  postId: string
): Promise<{ message: string } | { message: string; status: string }> => {
  try {
    if (!useAuthStore.getState().user)
      return { message: "Chưa đăng nhập", status: "error" };

    const response = await api.delete(`/posts/remove/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài đăng:", error);
    return { message: "Không thể xóa bài đăng.", status: "error" };
  }
};

/** Ẩn bài đăng
 * postId: ID của bài đăng.
 * Endpoint: POST /api/v1/posts/:postId/hide
 */
export const hidePost = async (
  postId: string
): Promise<{ message: string } | { message: string; status: string }> => {
  try {
    if (!useAuthStore.getState().user)
      return { message: "Chưa đăng nhập", status: "error" };

    const response = await api.post(`/posts/${postId}/hide`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ẩn bài đăng:", error);
    return { message: "Không thể ẩn bài đăng.", status: "error" };
  }
};
