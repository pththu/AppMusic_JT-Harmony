// mobile/src/services/socialApi.ts

import axios from 'axios';
import { Alert } from 'react-native'; 

// --- CONFIG CƠ BẢN ---
// 1. URL CƠ SỞ CỦA BACKEND (Đang dùng cổng 8000 và API prefix /api/v1)
// LƯU Ý: Thay 'localhost' bằng IP thực tế của máy bạn nếu chạy trên Emulator/Device
const BASE_URL = 'http://192.168.1.24:3000/api/v1'; 

// 2. TOKEN XÁC THỰC THỰC TẾ CỦA USER 'mari' (Phải luôn có tiền tố 'Bearer ')
const MOCK_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsInVzZXJuYW1lIjoidXNlcjg0MTgiLCJpYXQiOjE3NjAwMTMyMDMsImV4cCI6MTc2MDYxODAwM30.6CW0ZOotoXNunU9QLoTfDWovM5KoJVWIqF67dbTPg7M';
// Tạo instance axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Thêm header Authorization cho các API Protected
    Authorization: MOCK_AUTH_TOKEN, 
    'Content-Type': 'application/json',
  },
});

// --- INTERFACE (KHAI BÁO KIỂU DỮ LIỆU) ---

export interface UserInfo {
    id: number;
    username: string;
    avatarUrl: string;
    fullName: string;
}

export interface Comment {
    id: string; 
    userId: number;
    postId: number;
    content: string;
    parentId: number | null;
    commentedAt: string;
    User: UserInfo; // Dữ liệu từ Eager Loading
    likeCount: number;
    isLiked: boolean;
}

export interface Post {
    id: string; 
    userId: number;
    content: string;
    fileUrl: string; 
    heartCount: number; // Tên cũ: heartCount
    shareCount: number;
    uploadedAt: string; 
    User: UserInfo; // Dữ liệu từ Eager Loading
    commentCount: number; 
    isLiked: boolean; 
}


// --- HÀM GỌI API CHO BÀI ĐĂNG (POSTS) ---

/** Lấy danh sách bài đăng từ server (Feed) */
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get('/posts');
    return response.data.map((post: any) => ({
        ...post,
        id: post.id.toString(),
        User: post.User || { id: post.userId, username: 'Anonymous', avatarUrl: '', fullName: 'Ẩn danh' }, 
        commentCount: post.commentCount || 0, 
        isLiked: false, 
    })) as Post[];
  } catch (error) {
    Alert.alert("Lỗi ❌", "Không thể tải Feed. Kiểm tra Token hoặc Server URL.");
    throw error;
  }
};

/** Tạo bài đăng mới */
export const createNewPost = async (content: string, fileUrl: string): Promise<Post> => {
  try {
    const response = await api.post('/posts', { content, fileUrl });
    const newPost = response.data; // Giả định backend trả về object Post đã tạo
    return {
        ...newPost,
        id: newPost.id.toString(),
        // Giả định bạn có thể lấy thông tin user hiện tại (ví dụ: từ context/state user)
        User: { id: 3, username: 'mari', avatarUrl: 'YOUR_CURRENT_AVATAR_URL', fullName: 'Mari Trâm Bảo' }, 
        commentCount: 0,
        isLiked: false,
    } as Post;
  } catch (error) {
    Alert.alert("Lỗi ❌", "Không thể tạo bài đăng mới.");
    throw error;
  }
};

/** Thích/Bỏ thích bài đăng (Endpoint cần triển khai ở backend) */
export const togglePostLike = async (postId: string) => {
  try {
    await api.post(`/posts/${postId}/like`); 
    return true;
  } catch (error) {
    Alert.alert("Lỗi ❌", "Không thể cập nhật trạng thái thích.");
    throw error;
  }
};

// --- HÀM GỌI API CHO BÌNH LUẬN (COMMENTS) ---

/** Lấy bình luận cho một bài đăng (Sử dụng endpoint GET /comments/byPost/:postId) */
export const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await api.get(`/comments/byPost/${postId}`); 
    return response.data.map((comment: any) => ({
        ...comment,
        id: comment.id.toString(),
        likeCount: comment.likeCount || 0, 
        isLiked: false,
    })) as Comment[];
  } catch (error) {
    Alert.alert("Lỗi ❌", "Không thể tải bình luận.");
    throw error;
  }
};

/** Tạo bình luận mới */
export const createNewComment = async (postId: string, content: string, parentId: string | null = null): Promise<Comment> => {
  try {
    const response = await api.post('/comments', {
      postId: parseInt(postId),
      content,
      parentId: parentId ? parseInt(parentId) : null,
    });
    const newComment = response.data;
    return {
        ...newComment,
        id: newComment.id.toString(),
        // Gán thông tin người dùng hiện tại (tạm thời)
        User: { id: 3, username: 'mari', avatarUrl: 'YOUR_CURRENT_AVATAR_URL', fullName: 'Mari Trâm Bảo' },
        likeCount: 0,
        isLiked: false,
    } as Comment;
  } catch (error) {
    Alert.alert("Lỗi ❌", "Không thể gửi bình luận.");
    throw error;
  }
};