// src/services/chatApi.tsx
import { Alert } from 'react-native';
import axiosClient from '@/config/axiosClient';
import { UserInfo } from './socialApi'; // Tái sử dụng UserInfo

const api = axiosClient;

// Interface cho cuộc trò chuyện
export interface Conversation {
    id: number;
    type: 'private' | 'group';
    name: string | null;
    lastMessage: any; // Cần định nghĩa rõ hơn sau, tạm thời là any
    updatedAt: string;
    members: UserInfo[];
}

/**
 * Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
 * Endpoint: GET /api/v1/conversations
 */
export const fetchConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await api.get('/conversations');
        return response.data as Conversation[];
    } catch (error) {
        console.error('Lỗi khi tải danh sách cuộc trò chuyện:', error);
        throw error;
    }
};

/**
 * Tạo hoặc lấy ID Conversation Private với một người dùng khác
 * Endpoint: POST /api/v1/conversations/user/:userId
 * Server sẽ tự động tạo nếu chưa có, hoặc trả về ID đã có.
 */
export const createOrGetPrivateConversation = async (userId: number): Promise<{ conversationId: number }> => {
    try {
        // userId là ID của người dùng bạn muốn chat cùng (người được theo dõi)
        const response = await api.post(`/conversations/user/${userId}`);

        // Server trả về { conversationId: number, message: string }
        return {
            conversationId: response.data.conversationId,
        };
    } catch (error) {
        Alert.alert('Lỗi ❌', 'Không thể tạo hoặc mở cuộc trò chuyện.');
        throw error;
    }
};

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string | null;
    type: 'text' | 'image' | 'video' | 'file' | 'system';
    fileUrl: string | null;
    createdAt: string;
    // Thông tin người gửi (Đã được join từ server)
    Sender: {
        id: number;
        username: string;
        avatarUrl: string;
        fullName: string;
    };
}

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
        console.error('Lỗi khi tải tin nhắn lịch sử:', error);
        throw error;
    }
};