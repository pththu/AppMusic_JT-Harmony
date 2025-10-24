import axios from 'axios';
import { Alert } from 'react-native';
import useAuthStore from '@/store/authStore';

import axiosClient from '@/config/axiosClient';
const api = axiosClient;
// const BASE_URL = 'http://192.168.1.212:3000/api/v1'; 

// // === TẠO INSTANCE AXIOS ===
// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // === INTERCEPTOR: Thêm TOKEN TỰ ĐỘNG ===
// api.interceptors.request.use(
//   async (config) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('Header Authorization được set:', config.headers.Authorization);
//     } else {
//       console.log('Không có token trong store');
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// === INTERFACES ===
// Giữ nguyên các interfaces
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
}

// === API CHO BÀI ĐĂNG ===

/** Lấy danh sách bài đăng */
export const fetchPosts = async (): Promise<Post[]> => {
    try {
        const response = await api.get('/posts');
        const data = response.data;

        if (!Array.isArray(data)) {
            Alert.alert('Lỗi ❌', 'Dữ liệu bài đăng không hợp lệ.');
            return [];
        }

        return data.map((post: any) => {
            let fileUrl: string[] = [];
            try {
                const rawFileUrl = post.file_url || post.fileUrl || [];
                if (typeof rawFileUrl === 'string') {
                    fileUrl = JSON.parse(rawFileUrl);
                } else if (Array.isArray(rawFileUrl)) {
                    fileUrl = rawFileUrl;
                } else {
                    fileUrl = [];
                }
            } catch (e) {
                console.error('Error parsing fileUrl in fetchPosts:', e);
                fileUrl = [];
            }
            return {
                id: post.id.toString(),
                userId: post.user_id || post.userId,
                content: post.content || '',
                fileUrl,
                musicLink: post.musicLink || null,
                heartCount: post.heart_count || post.heartCount || 0,
                shareCount: post.share_count || post.shareCount || 0,
                uploadedAt: post.uploaded_at || post.uploadedAt || new Date().toISOString(),
                User:
                    post.user || post.User || {
                        id: post.user_id || post.userId,
                        username: 'Anonymous',
                        avatarUrl: '',
                        fullName: 'Ẩn danh',
                    },
                // Đảm bảo lấy đúng commentCount được trả về từ server (sau tối ưu hóa)
                commentCount: post.commentCount || 0,
                isLiked: post.isLiked === true || post.isLiked === 't',
            };
        }) as Post[];
    } catch (error) {
        Alert.alert('Lỗi ❌', 'Không thể tải Feed. Kiểm tra Token, Server URL hoặc Server Status.');
        throw error;
    }
};

// Lấy danh sách bài đăng theo User ID
export const fetchPostsByUserId = async (userId: number): Promise<Post[]> => {
    try {
        // Server Endpoint: GET /api/v1/posts/byUser/:userId
        const response = await api.get(`/posts/byUser/${userId}`);
        const data = response.data;

        if (!Array.isArray(data)) {
            Alert.alert('Lỗi ❌', 'Dữ liệu bài đăng không hợp lệ.');
            return [];
        }

        return data.map((post) => {
            let fileUrl = [];
            try {
                const rawFileUrl = post.file_url || post.fileUrl || post.images || [];
                if (typeof rawFileUrl === 'string') {
                    fileUrl = JSON.parse(rawFileUrl);
                } else if (Array.isArray(rawFileUrl)) {
                    fileUrl = rawFileUrl;
                } else {
                    fileUrl = [];
                }
            } catch (e) {
                console.error('Error parsing fileUrl in fetchPostsByUserId:', e);
                fileUrl = [];
            }
            return {
                id: post.id.toString(),
                userId: post.userId,
                content: post.content || '',
                fileUrl,
                musicLink: post.musicLink || null,
                heartCount: post.likeCount || post.heartCount || 0, // Backend sử dụng likeCount
                shareCount: post.shareCount || 0,
                uploadedAt: post.uploadedAt || new Date().toISOString(),
                User: { // Lấy thông tin User đã được Backend include
                    id: post.User.id,
                    username: post.User.username,
                    avatarUrl: post.User.avatarUrl,
                    fullName: post.User.fullName || post.User.username,
                },
                commentCount: post.commentCount || 0,
                isLiked: post.isLiked === true, // Lấy trạng thái isLiked đã tính toán
                // ✅ MAP comments đã được xử lý (bao gồm isLiked & likeCount)
                comments: post.comments?.map(mapCommentData) || [],
            };
        }) as Post[];
    } catch (error) {
        Alert.alert('Lỗi ❌', 'Không thể tải bài đăng của người dùng.');
        throw error;
    }
};

// ✅ HÀM HỖ TRỢ: Ánh xạ dữ liệu Comment (được sử dụng cho cả Post và Comment API)
const mapCommentData = (comment: any): Comment => {
    // Hàm đệ quy để xử lý Replies
    const mapReplies = (replies: any[]): Comment[] => {
        return replies.map((reply: any) => ({
            ...reply,
            id: reply.id.toString(),
            likeCount: reply.likeCount || 0,
            isLiked: reply.isLiked || false,
            // Nếu Replies có Replies, tiếp tục đệ quy (chỉ nên áp dụng cho Replies trong Post API)
            // Ở đây, ta chỉ cần một cấp Replies
            replies: reply.Replies ? mapReplies(reply.Replies) : []
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
            fullName: comment.User?.fullName || comment.User?.username || 'User',
        },
        // Tái sử dụng logic ánh xạ Replies
        replies: comment.Replies ? mapReplies(comment.Replies) : [],
    };
};

/** * Tạo bài đăng mới.
 * @param content Nội dung bài đăng.
 * @param fileUrl URL của ảnh/video đã được upload (có thể là chuỗi rỗng nếu chỉ đăng văn bản).
 * @param songId ID của bài hát đính kèm (có thể là null).
 * @returns Promise<Post> Bài đăng đã tạo.
 */
export const createNewPost = async (content: string, fileUrls: string[] | null = null, songId: number | null = null): Promise<Post> => {
    try {
        // Lấy thông tin người dùng từ store để sử dụng khi cần thiết
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('Chưa đăng nhập');

        // Gửi yêu cầu POST với content, fileUrl và songId
        const response = await api.post('/posts', {
            content,
            fileUrls, // Bao gồm URL của ảnh/video
            songId,  // Bao gồm ID bài hát
            // KHÔNG GỬI userId LÊN SERVER. SERVER SẼ LẤY NÓ TỪ TOKEN.
        });

        const newPostResponse = response.data.post; // Server trả về { message, post }

        return {
            ...newPostResponse,
            id: newPostResponse.id.toString(),
            // Sử dụng thông tin User được server trả về (đã tối ưu hóa ở backend)
            // Nếu server không gửi User kèm theo, dùng thông tin local user
            User: newPostResponse.User || {
                id: user.id,
                username: user.username || 'User',
                avatarUrl: user.avatarUrl || '',
                fullName: user.fullName || user.username || 'User',
            },
            commentCount: newPostResponse.commentCount || 0,
            heartCount: newPostResponse.heartCount || 0,
            shareCount: newPostResponse.shareCount || 0,
            isLiked: false,
            fileUrl: Array.isArray(newPostResponse.fileUrl) ? newPostResponse.fileUrl : [],
            musicLink: newPostResponse.musicLink || null,
        } as Post;
    } catch (error) {
        console.error('❌ Lỗi tạo bài đăng:', error);
        Alert.alert('Lỗi ❌', 'Không thể tạo bài đăng mới.');
        throw error;
    }
};

/** * Thích / Bỏ thích bài đăng.
 * @returns {isLiked: boolean, heartCount: number} Trạng thái like và số lượng like mới nhất.
 */
export const togglePostLike = async (postId: string): Promise<{ isLiked: boolean, heartCount: number }> => {
    try {
        // Gửi yêu cầu POST đến endpoint toggleLike
        const response = await api.post(`/posts/${postId}/like`);

        // ✅ LẤY DỮ LIỆU CẬP NHẬT TỪ SERVER
        const { isLiked, heartCount } = response.data;

        // Trả về trạng thái đã được cập nhật
        return {
            isLiked: !!isLiked, // Đảm bảo là boolean
            heartCount: heartCount || 0,
        };
    } catch (error) {
        console.error('❌ Lỗi togglePostLike:', error);
        Alert.alert('Lỗi ❌', 'Không thể cập nhật trạng thái thích.');
        throw error;
    }
};

// === API CHO BÌNH LUẬN ===

/** Lấy tất cả bình luận theo Post ID */
// export const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
//     try {
//         // Gọi API đến Endpoint đã định nghĩa trong commentController.js
//         const response = await api.get(`/comments/byPost/${postId}`);
//         const data = response.data;

//         if (!Array.isArray(data)) {
//             Alert.alert('Lỗi ❌', 'Dữ liệu bình luận không hợp lệ.');
//             return [];
//         }

//         // 💡 MAP DỮ LIỆU ĐỂ ĐẢM BẢO CẤU TRÚC ĐỒNG NHẤT
//         // Giả định API trả về các trường cần thiết như id, User, content, isLiked, likeCount, v.v.
//         return data.map((comment: any) => ({
//             ...comment,
//             id: comment.id.toString(),
//             likeCount: comment.likeCount || 0,
//             isLiked: comment.isLiked || false, // Đảm bảo trường này tồn tại
//             User: {
//                 id: comment.User?.id,
//                 username: comment.User?.username,
//                 avatarUrl: comment.User?.avatarUrl
//             },
//             // Nếu có trường replies, cần map recursive ở đây
//             replies: comment.replies?.map((reply: any) => ({
//                 ...reply,
//                 id: reply.id.toString(),
//                 likeCount: reply.likeCount || 0,
//                 isLiked: reply.isLiked || false,
//             })) || [],
//         })) as Comment[];
//     } catch (error) {
//         Alert.alert('Lỗi ❌', 'Không thể tải bình luận.');
//         throw error;
//     }
// };
export const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
    try {
        // Gọi API đến Endpoint đã định nghĩa trong commentController.js
        const response = await api.get(`/comments/byPost/${postId}`);
        const data = response.data;

        if (!Array.isArray(data)) {
            Alert.alert('Lỗi ❌', 'Dữ liệu bình luận không hợp lệ.');
            return [];
        }

        // SỬ DỤNG HÀM ÁNH XẠ CHUNG
        return data.map(mapCommentData) as Comment[];
    } catch (error) {
        Alert.alert('Lỗi ❌', 'Không thể tải bình luận.');
        throw error;
    }
};
/** Tạo bình luận mới */
export const createNewComment = async (postId: string, content: string, parentId: string | null = null): Promise<Comment> => {
    try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('Chưa đăng nhập');

        const response = await api.post('/comments', {
            postId: postId,
            content: content,
            parentId: parentId, // Trường parentId để trả lời comment khác
            userId: user.id, // Server nên tự lấy từ token, nhưng gửi thêm để đồng bộ
        });

        // 💡 Server nên trả về Comment object đầy đủ bao gồm cả thông tin User
        return {
            ...response.data,
            id: response.data.id.toString(),
            User: response.data.User || { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
            likeCount: response.data.likeCount || 0,
            isLiked: false,
            // ... (thêm các trường khác nếu cần)
        } as Comment;

    } catch (error) {
        Alert.alert('Lỗi ❌', 'Không thể đăng bình luận.');
        throw error;
    }
};


/** Thích / Bỏ thích bình luận.
 * @returns {isLiked: boolean, likeCount: number} Trạng thái like và số lượng like mới nhất.
 */
export const toggleCommentLike = async (commentId: string): Promise<{ isLiked: boolean, likeCount: number }> => {
    try {
        // Server Endpoint: POST /api/v1/comments/:commentId/like
        const response = await api.post(`/comments/${commentId}/like`);

        const { isLiked, likeCount } = response.data;

        return {
            isLiked: !!isLiked,
            likeCount: likeCount || 0,
        };
    } catch (error) {
        console.error('❌ Lỗi toggleCommentLike:', error);
        Alert.alert('Lỗi ❌', 'Không thể cập nhật trạng thái thích bình luận.');
        throw error;
    }
};

// === INTERFACES MỚI ===
export interface ProfileSocial {
    id: number;
    username: string;
    avatarUrl: string;
    fullName: string;
    bio: string | null;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean; // Trạng thái theo dõi của người dùng hiện tại
}

// === API CHO SOCIAL PROFILE ===

/** Lấy thông tin Profile xã hội (bao gồm follow count và isFollowing) */
export const fetchUserProfileSocial = async (userId: number): Promise<ProfileSocial> => {
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
        Alert.alert('Lỗi ❌', 'Không thể tải thông tin profile.');
        throw error;
    }
};

/** Toggle Theo dõi/Hủy theo dõi */
export const toggleFollow = async (userId: number): Promise<{ isFollowing: boolean }> => {
    try {
        // ➡️ Endpoint: POST /api/v1/users/:userId/follow (sử dụng userId của người được theo dõi)
        // Đây là endpoint đã được định nghĩa trong followsController.js
        const response = await api.post(`/follows/users/${userId}/follow`);

        // Server trả về { message: string, isFollowing: boolean }
        return {
            isFollowing: response.data.isFollowing
        };
    } catch (error) {
        // Bắt lỗi cụ thể hơn nếu cần
        Alert.alert('Lỗi ❌', 'Không thể thay đổi trạng thái theo dõi.');
        throw error;
    }
};

/** Lấy danh sách Người theo dõi (Followers) */
export const fetchFollowers = async (userId: number): Promise<UserInfo[]> => {
    try {
        // Endpoint: GET /api/v1/users/:userId/followers
        const response = await api.get(`/follows/users/${userId}/followers`);
        return response.data as UserInfo[];
    } catch (error) {
        console.error('Lỗi khi tải danh sách người theo dõi:', error);
        throw error;
    }
};

/** Lấy danh sách Đang theo dõi (Following) */
export const fetchFollowing = async (userId: number): Promise<UserInfo[]> => {
    try {
        // Endpoint: GET /api/v1/users/:userId/following
        const response = await api.get(`/follows/users/${userId}/following`);
        return response.data as UserInfo[];
    } catch (error) {
        console.error('Lỗi khi tải danh sách đang theo dõi:', error);
        throw error;
    }
};