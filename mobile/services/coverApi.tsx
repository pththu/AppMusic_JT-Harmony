import axiosClient from "@/config/axiosClient";
const api = axiosClient;

// === INTERFACES ===
export interface Cover {
  id: string;
  userId: number;
  content: string;
  fileUrl: string[] | string;
  heartCount: number;
  uploadedAt: string;
  User: {
    id: number;
    username: string;
    avatarUrl: string;
    fullName: string;
  };
  OriginalSong?: {
    id: number;
    name: string;
    spotifyId: string;
    artists?: { id: number; name: string }[];
  };
  isLiked: boolean;
  originalSongId: number;
}

// === API CHO COVERS ===

/**
 * Lấy danh sách covers theo song ID
 * Endpoint: GET /api/v1/posts/covers/song/:songId
 */
export const fetchCoversBySongId = async (songId: number): Promise<Cover[]> => {
  try {
    const response = await api.get(`/posts/covers/song/${songId}`);
    return response.data as Cover[];
  } catch (error) {
    console.error("Lỗi khi tải covers theo song ID:", error);
    throw error;
  }
};

/**
 * Lấy danh sách top covers
 * Endpoint: GET /api/v1/posts/covers/top
 */
export const fetchTopCovers = async (): Promise<Cover[]> => {
  try {
    const response = await api.get("/posts/covers/top");
    return response.data as Cover[];
  } catch (error) {
    console.error("Lỗi khi tải top covers:", error);
    throw error;
  }
};

/**
 * Lấy danh sách covers theo user ID
 * Endpoint: GET /api/v1/posts/covers/user/:userId
 */
export const fetchCoversByUserId = async (userId: number): Promise<Cover[]> => {
  try {
    const response = await api.get(`/posts/covers/user/${userId}`);
    return response.data as Cover[];
  } catch (error) {
    console.error("Lỗi khi tải covers theo user ID:", error);
    throw error;
  }
};

/**
 * Vote cho cover
 * Endpoint: POST /api/v1/posts/:id/vote
 */
export const voteCover = async (
  coverId: string
): Promise<
  { isLiked: boolean; heartCount: number } | { message: string; status: string }
> => {
  try {
    const response = await api.post(`/posts/${coverId}/vote`);
    const { isLiked, heartCount } = response.data;
    return {
      isLiked: !!isLiked,
      heartCount: heartCount || 0,
    };
  } catch (error) {
    console.error("Lỗi khi vote cover:", error);
    return { message: "Không thể vote cover.", status: "error" };
  }
};

/**
 * Tạo cover mới
 * Sử dụng createNewPost với isCover = true và originalSongId
 */
export const createNewCover = async (
  content: string,
  fileUrls: string[] | null = null,
  originalSongId: number
): Promise<Cover | { message: string; status: string }> => {
  try {
    console.log("Gửi request tạo cover với dữ liệu:", {
      content,
      fileUrls,
      isCover: true,
      originalSongId,
    });
    const response = await api.post("/posts", {
      content,
      fileUrls,
      isCover: true,
      originalSongId,
    });
    console.log("Response từ server:", response.data);
    return response.data.post as Cover;
  } catch (error) {
    console.error("Lỗi khi tạo cover:", error);
    console.error("Chi tiết lỗi:", error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Không thể tạo cover.";
    return { message: errorMessage, status: "error" };
  }
};
