import axiosClient from '@/config/axiosClient';
import { UserInfo } from './socialApi';

const api = axiosClient;

// Hàm helper để hiển thị lỗi
const showError = (message: string) => {
  console.log(message);
};

// Interface cho cuộc trò chuyện
export interface Conversation {
    id: number;
    type: 'private' | 'group';
    name: string | null;
    lastMessage: Message | null; // Tin nhắn cuối cùng của cuộc trò chuyện
    updatedAt: string;
    members: UserInfo[];
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string | null;
    type: 'text' | 'image' | 'video' | 'file' | 'system';
    fileUrl: string | null;
    createdAt: string;
    replyToId: number | null;
    replyTo: Message | null;
    // Thông tin người gửi (Đã được join từ server)
    Sender: {
        id: number;
        username: string;
        avatarUrl: string;
        fullName: string;
    };
}


/**
 * Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
 * Endpoint: GET /api/v1/conversations
 */
export const fetchUserConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await api.get('/conversations');
        return response.data as Conversation[];
    } catch (error) {
        console.log('Lỗi khi tải danh sách cuộc trò chuyện:', error);
        showError('Không thể tải danh sách cuộc trò chuyện');
        throw error;
    }
};

/**
 * Tạo hoặc lấy ID Conversation Private với một người dùng khác
 * Endpoint: POST /api/v1/conversations/user/:userId
 * Server sẽ tự động tạo nếu chưa có, hoặc trả về ID đã có.
 */
export const createOrGetPrivateConversation = async (userId: number): Promise<{ conversationId: number } | { message: string; status: string }> => {
    try {
        // userId là ID của người dùng bạn muốn chat cùng (người được theo dõi)
        const response = await api.post(`/conversations/user/${userId}`);

        // Server trả về { conversationId: number, message: string }
        return {
            conversationId: response.data.conversationId,
        };
    } catch (error) {
        console.log('Lỗi khi tạo hoặc mở cuộc trò chuyện:', error);
        return { message: 'Không thể tạo hoặc mở cuộc trò chuyện.', status: 'error' };
    }
};


/**
 * Lấy lịch sử tin nhắn của một cuộc trò chuyện với phân trang.
 * Endpoint: GET /api/v1/conversations/:conversationId/messages?limit=N&offset=M
 * @param conversationId ID của cuộc trò chuyện.
 * @param limit Số lượng tin nhắn muốn lấy.
 * @param offset Số lượng tin nhắn bỏ qua.
 * @returns Promise<Message[]> Danh sách tin nhắn.
 */
export const fetchMessages = async (
    conversationId: number,
    limit: number,
    offset: number
): Promise<Message[]> => {
    try {
        // Gửi request với limit và offset trong query params
        const response = await api.get(
            `/conversations/${conversationId}/messages`,
            {
                params: {
                    limit: limit,
                    offset: offset,
                },
            }
        );

        // Server trả về danh sách tin nhắn, tin nhắn mới nhất nằm trên cùng (DESC)
        return response.data as Message[];
    } catch (error) {
        console.log('Lỗi khi tải tin nhắn lịch sử:', error);
        throw error;
    }
};

/**
 * Xóa tin nhắn (chỉ người gửi mới có thể xóa, xóa cho cả hai phía)
 * Endpoint: DELETE /api/v1/conversations/messages/:messageId
 */
export const deleteMessage = async (messageId: number): Promise<{ message: string } | { message: string; status: string }> => {
    try {
        await api.delete(`/conversations/messages/${messageId}`);
        return { message: 'Tin nhắn đã được xóa.' };
    } catch (error) {
        console.log('Lỗi khi xóa tin nhắn:', error);
        return { message: 'Không thể xóa tin nhắn.', status: 'error' };
    }
};

/**
 * Ẩn tin nhắn (chỉ ẩn bên phía người dùng hiện tại)
 * Endpoint: POST /api/v1/conversations/messages/:messageId/hide
 */
export const hideMessage = async (messageId: number): Promise<{ message: string } | { message: string; status: string }> => {
    try {
        await api.post(`/conversations/messages/${messageId}/hide`);
        return { message: 'Tin nhắn đã được ẩn.' };
    } catch (error) {
        console.log('Lỗi khi ẩn tin nhắn:', error);
        return { message: 'Không thể ẩn tin nhắn.', status: 'error' };
    }
};

/**
 * Xóa cuộc trò chuyện (chỉ xóa bên phía người dùng hiện tại)
 * Endpoint: DELETE /api/v1/conversations/:conversationId
 */
export const deleteConversation = async (conversationId: number): Promise<{ message: string } | { message: string; status: string }> => {
    try {
        await api.delete(`/conversations/${conversationId}`);
        return { message: 'Cuộc trò chuyện đã được xóa.' };
    } catch (error) {
        console.log('Lỗi khi xóa cuộc trò chuyện:', error);
        return { message: 'Không thể xóa cuộc trò chuyện.', status: 'error' };
    }
};

/**
 * Lấy danh sách tất cả người dùng (để bắt đầu chat)
 * Endpoint: GET /api/v1/users
 */
export const fetchAllUsers = async (): Promise<UserInfo[]> => {
    try {
        const response = await api.get('/users');
        return response.data as UserInfo[];
    } catch (error) {
        console.log('Lỗi khi tải danh sách người dùng:', error);
        showError('Không thể tải danh sách người dùng');
        throw error;
    }
};
