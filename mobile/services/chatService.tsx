// services/chatService.tsx
import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/store/authStore';
import { Alert } from 'react-native';

const SOCKET_SERVER_URL = 'http://192.168.0.228:3000';

// ==========================================================
// INTERFACES
// ==========================================================

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

export interface Conversation {
    id: number;
    type: 'private' | 'group';
    name: string | null;
    lastMessageId: number | null;
    createdAt: string;
    updatedAt: string;
    // Thêm các trường khác (thành viên, lastMessage) khi lấy qua API REST
}

// ==========================================================
// SOCKET.IO CLIENT MANAGER
// ==========================================================

let socket: Socket | null = null;

/**
 * Khởi tạo kết nối Socket.IO
 * (Chỉ gọi khi người dùng đã đăng nhập và cần dùng tính năng chat)
 */
export const connectSocket = (): Socket => {
    // 🎯 SỬA 1: Nếu socket đã tồn tại và đang kết nối (hoặc đang cố gắng kết nối), trả về ngay
    if (socket && socket.connected) {
        console.log('Socket already connected. Returning existing instance.');
        return socket;
    }

    // 🎯 SỬA 2: Lấy token và tạo kết nối nếu chưa có
    const token = useAuthStore.getState().token; // Chỉ lấy token tại thời điểm này

    // Nếu token chưa có, bạn có thể cân nhắc ném lỗi hoặc trả về null (dựa trên luồng logic app)
    if (!token) {
        Alert.alert("Lỗi Chat", "Không có token xác thực. Vui lòng đăng nhập lại.");
        throw new Error("Authentication token not found.");
    }

    const newSocket = io(SOCKET_SERVER_URL, {
        auth: { token: token },
        transports: ['websocket'],
    });

    // 🎯 SỬA 3: Gán instance mới vào biến singleton
    socket = newSocket;

    // 💡 Thêm các listeners xử lý lỗi kết nối
    socket.on('connect', () => {
        console.log('✅ Socket connected successfully!');
    });

    socket.on('disconnect', (reason) => {
        console.warn('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        // Lỗi này chính là lỗi bạn đang thấy
        console.error('❌ Socket connection error:', error.message);
    });

    // Thêm logic tự động tham gia phòng chat sau khi kết nối lại
    // if (user) {
    //     newSocket.on('connect', () => {
    //         joinRoom(user.lastConversationId); // Thay bằng ID phòng chat thực tế
    //     });
    // }

    return newSocket;
};

/**
 * Ngắt kết nối Socket.IO
 */
export const disconnectSocket = (): void => {
    if (socket && socket.connected) {
        socket.disconnect();
        socket = null; // Reset biến socket
        console.log('Socket has been manually disconnected.');
    }
};

// ==========================================================
// HÀM GỬI VÀ NHẬN SỰ KIỆN CHAT
// ==========================================================

/**
 * 1. Tham gia một phòng trò chuyện
 * @param conversationId ID của Conversation
 */
export const joinConversation = (conversationId: number): void => {
    if (!socket || !socket.connected) {
        console.warn('Socket không kết nối. Không thể tham gia phòng chat.');
        return;
    }
    // Gửi sự kiện 'join_conversation' lên server
    socket.emit('join_conversation', conversationId);
};

/**
 * 2. Gửi tin nhắn mới
 * @param data Dữ liệu tin nhắn
 * @returns Promise với kết quả từ server
 */
export const sendMessage = (
    data: { conversationId: number, content: string, type?: 'text' | 'image' | 'video' | 'file', fileUrl?: string }
): Promise<{ status: 'ok' | 'error', message?: Message, error?: string }> => {
    return new Promise((resolve) => {
        if (!socket || !socket.connected) {
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Kết nối bị mất.');
            resolve({ status: 'error', error: 'Socket not connected' });
            return;
        }
        // Gửi sự kiện 'send_message' lên server và chờ phản hồi
        socket.emit('send_message', data, (response: { status: 'ok' | 'error', message?: Message, error?: string }) => {
            resolve(response);
        });
    });
};

/**
 * 3. Gửi sự kiện 'typing'
 */
export const startTyping = (conversationId: number): void => {
    if (socket && socket.connected) {
        socket.emit('typing_start', conversationId);
    }
};

/**
 * 4. Gửi sự kiện 'stop typing'
 */
export const stopTyping = (conversationId: number): void => {
    if (socket && socket.connected) {
        socket.emit('typing_stop', conversationId);
    }
};

/**
 * 5. Đăng ký lắng nghe sự kiện nhận tin nhắn mới
 * @param listener Hàm callback (nhận đối tượng Message)
 */
export const subscribeToNewMessages = (listener: (message: Message) => void): (() => void) => {
    if (!socket) {
        console.error('Socket not initialized.');
        // Trả về hàm hủy đăng ký rỗng
        return () => { };
    }

    // Thêm listener cho sự kiện 'receive_message'
    socket.on('receive_message', listener);

    // Trả về hàm để client gọi khi component bị unmount (Hủy đăng ký)
    return () => {
        socket?.off('receive_message', listener);
    };
};

/**
 * 6. Đăng ký lắng nghe sự kiện 'typing' từ người dùng khác
 * @param listener Hàm callback (nhận userId và trạng thái typing)
 */
export const subscribeToTypingStatus = (listener: (data: { conversationId: number, userId: number, isTyping: boolean }) => void): (() => void) => {
    if (!socket) {
        return () => { };
    }

    socket.on('user_typing', listener);

    // Trả về hàm hủy đăng ký
    return () => {
        socket?.off('user_typing', listener);
    };
};
