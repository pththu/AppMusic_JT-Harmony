import axiosClient from "@/lib/axiosClient";

export interface AdminPost {
  id: number;
  userId: number;
  content?: string;
  fileUrl?: string[];
  heartCount: number;
  shareCount: number;
  uploadedAt: string;
  commentCount: number;
}

export interface UpdatePostPayload {
  content?: string;
  fileUrls?: string[];
  songId?: number | null;
  isCover?: boolean;
  originalSongId?: number | null;
}

export interface PostLikeUser {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

// List posts (uses public endpoint under the hood)
export async function fetchPostsAdmin(params?: { q?: string; userId?: number; isCover?: boolean; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
  const res = await axiosClient.get("/posts/admin", { params });
  return res.data as AdminPost[];
}

export async function updatePostAdmin(id: number, payload: UpdatePostPayload) {
  const res = await axiosClient.put(`/posts/update/${id}`, payload);
  return res.data as AdminPost;
}

export async function deletePostAdmin(id: number) {
  const res = await axiosClient.delete(`/posts/remove/${id}`);
  return res.data as { message: string };
}

export async function getPostLikesAdmin(postId: number, params?: { userId?: number; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
  const res = await axiosClient.get(`/posts/${postId}/likes`, { params });
  return res.data as { User: PostLikeUser }[] | PostLikeUser[];
}

export async function removePostLikeAdmin(postId: number, userId: number) {
  const res = await axiosClient.delete(`/posts/${postId}/likes/${userId}`);
  return res.data as { message: string };
}

export async function getAllLikesAdmin(params?: { postId?: number; userId?: number; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
  const res = await axiosClient.get('/posts/likes/admin', { params });
  return res.data as Array<{ id: number; userId: number; postId: number; likedAt: string; User?: PostLikeUser }>;
}
