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
export const fetchCoversBySongId = async (songId) => {
  try {
    const response = await api.get(`/posts/covers/song/${songId}`);
    return response.data as Cover[];
  } catch (error) {
    console.log("Lỗi khi tải covers theo song ID:", error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả covers
 * Endpoint: GET /api/v1/posts/covers
 */
export const fetchAllCovers = async () => {
  try {
    const response = await axiosClient.get("/posts/covers");
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
};

/**
 * Lấy danh sách top covers
 * Endpoint: GET /api/v1/posts/covers/top
 */
export const fetchTopCovers = async () => {
  try {
    const response = await api.get("/posts/covers/top");
    return response.data.data as Cover[];
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
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
    console.log("Lỗi khi tải covers theo user ID:", error);
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
    console.log("Lỗi khi vote cover:", error);
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
) => {
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
    
    // Kiểm tra success flag từ server
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Lỗi khi tạo cover');
    }
    
    return response.data.data as Cover;
  } catch (error) {
    console.log("Lỗi khi tạo cover:", error.response?.data || error);
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message || data.error || 'Lỗi không xác định'
      }
    }
    throw error;
  }
};
