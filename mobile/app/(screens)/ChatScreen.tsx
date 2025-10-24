// screens/ChatScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { 
    connectSocket, 
    disconnectSocket, 
    joinConversation, 
    sendMessage, 
    subscribeToNewMessages, 
    subscribeToTypingStatus,
    startTyping,
    stopTyping,
    Message,
} from '@/services/chatService'; 
import useAuthStore from '@/store/authStore';
import { fetchMessages } from '@/services/chatApi'; 
import { useHeaderHeight } from '@react-navigation/elements';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa Route Params
type RootStackParamList = {
    ChatScreen: { 
        conversationId: number, 
        user: { id: number, fullName: string, avatarUrl: string | null } 
    };
};
type ChatRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>; 


// ==========================================================
// 🎨 Component Item Tin nhắn
// ==========================================================
interface MessageItemProps {
    message: Message;
    isMyMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isMyMessage }) => {
    // Định dạng thời gian - parse ISO string để tránh timezone issues
    const timeAgo = formatDistanceToNowStrict(parseISO(message.createdAt), {
        addSuffix: true,
        locale: vi
    });

    return (
        <View
            className={`flex-row mb-2 px-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
            {!isMyMessage && (
                <Image
                    source={{ uri: message.Sender.avatarUrl || 'https://via.placeholder.com/40' }}
                    className="w-8 h-8 rounded-full mr-2 mt-1"
                />
            )}
            <View
                className={`max-w-[75%] p-3 rounded-xl ${
                    isMyMessage
                    ? 'bg-blue-500 rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                }`}
            >
                {!isMyMessage && (
                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        {message.Sender.fullName}
                    </Text>
                )}
                <Text
                    className={isMyMessage
                        ? 'text-white'
                        : 'text-black dark:text-white'
                    }
                >
                    {message.content}
                </Text>
                <Text
                    className={`text-xs mt-1 ${isMyMessage
                        ? 'text-blue-200 text-right'
                        : 'text-gray-500 dark:text-gray-400 text-left'
                    }`}
                >
                    {timeAgo}
                </Text>
            </View>
        </View>
    );
};

const ChatScreen: React.FC = () => {
    const route = useRoute<ChatRouteProp>();
    const navigation = useNavigation();
    const headerHeight = useHeaderHeight(); // Lấy chiều cao của header để tránh bị che
    const currentUserId = useAuthStore(state => state.user?.id);

    // Lấy params
    const { conversationId, user } = route.params;

    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [typingUsers, setTypingUsers] = useState<number[]>([]);

    // Pagination
    const [page, setPage] = useState<number>(1);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [isPaginating, setIsPaginating] = useState<boolean>(false);
    const limit = 20;

    // State cho việc tải tin nhắn cũ
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);


    // Reset state khi conversationId thay đổi (khi remount hoặc navigate lại)
    useEffect(() => {
        setMessages([]);
        setPage(1);
        setHasMoreMessages(true);
        setTypingUsers([]);
        setInputMessage('');
        setIsLoadingMore(false);
        setRefreshing(false);
    }, [conversationId]);

    // ==========================================================
    // 💡 Lấy Lịch sử Tin nhắn
    // ==========================================================
    const loadMessages = useCallback(async (pageToLoad: number) => {
        if (!hasMoreMessages && pageToLoad > 1) return;

        try {
            if (pageToLoad === 1) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            // Offset là số tin nhắn đã có
            const offset = (pageToLoad - 1) * limit;

            // Endpoint: GET /api/v1/conversations/:conversationId/messages?limit=20&offset=0
            console.log(`Loading messages for conversation ${conversationId}, page ${pageToLoad}, offset ${offset}`);
            const newMessages = await fetchMessages(conversationId, limit, offset);
            console.log(`Fetched ${newMessages.length} messages:`, newMessages);

            if (newMessages.length === 0) {
                setHasMoreMessages(false);
            }

            // Tin nhắn từ server trả về DESC (mới nhất trước)
            // Với FlatList inverted, giữ thứ tự DESC để tin nhắn mới nhất ở dưới
            setMessages(prevMessages => {
                // Lọc bỏ tin nhắn trùng lặp (nếu có, dựa vào ID)
                const newIds = new Set(newMessages.map(m => m.id));
                const filteredPrevMessages = prevMessages.filter(m => !newIds.has(m.id));

                // Nối tin nhắn cũ + tin nhắn mới từ server
                // [tin nhắn cũ 21-40] + [tin nhắn cũ 1-20]
                return [...newMessages, ...filteredPrevMessages];
            });

            setPage(pageToLoad + 1);
        } catch (error) {
            console.error("Lỗi khi tải tin nhắn:", error);
            Alert.alert("Lỗi", "Không thể tải lịch sử tin nhắn.");
        } finally {
            if (pageToLoad === 1) {
                setIsLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    }, [conversationId]);
    
    // Tải tin nhắn lần đầu khi focus screen
    useFocusEffect(
        useCallback(() => {
            // Reset state mỗi khi focus để đảm bảo tải lại từ đầu
            setMessages([]);
            setPage(1);
            setHasMoreMessages(true);
            setIsLoading(true);
            setTypingUsers([]);
            setInputMessage('');
            setIsLoadingMore(false);

            loadMessages(1);
        }, [loadMessages])
    );

    // ==========================================================
    // 🌐 Xử lý Socket.IO
    // ==========================================================
    useEffect(() => {
        // 1. Kết nối và Tham gia Conversation
        connectSocket();
        joinConversation(conversationId);

        // 2. Đăng ký lắng nghe tin nhắn mới
        const unsubscribeNewMessages = subscribeToNewMessages((message) => {
            // Chỉ thêm vào nếu tin nhắn đó thuộc conversation hiện tại
            if (message.conversationId === conversationId) {
                // Xóa tin nhắn tạm nếu có (dựa vào senderId và content giống nhau)
                setMessages(prevMessages => {
                    const filteredMessages = prevMessages.filter(m =>
                        !(m.senderId === message.senderId && m.content === message.content && m.id !== message.id)
                    );
                    // Thêm tin nhắn mới vào ĐẦU MẢNG
                    return [message, ...filteredMessages];
                });
            }
        });

        // 3. Đăng ký lắng nghe trạng thái gõ
        const unsubscribeTyping = subscribeToTypingStatus(({ userId, isTyping }) => {
            // Bỏ qua tin nhắn gõ của chính mình
            if (userId === currentUserId) return; 

            setTypingUsers(prev => {
                if (isTyping && !prev.includes(userId)) {
                    return [...prev, userId]; // Thêm người dùng vào danh sách đang gõ
                } else if (!isTyping && prev.includes(userId)) {
                    return prev.filter(id => id !== userId); // Xóa người dùng khỏi danh sách đang gõ
                }
                return prev;
            });
        });

        // Hủy đăng ký và ngắt kết nối khi component unmount
        return () => {
            unsubscribeNewMessages();
            unsubscribeTyping();
            disconnectSocket(); 
        };
    }, [conversationId, currentUserId]); // Chỉ chạy lại khi conversationId hoặc currentUserId thay đổi

    // ==========================================================
    // 💡 Xử lý Input
    // ==========================================================
    // Trạng thái gõ
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const TYPING_TIMEOUT = 3000;
    const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInputChange = (text: string) => {
        setInputMessage(text);

        if (!isTyping && text.trim().length > 0) {
            // Bắt đầu gõ
            setIsTyping(true);
            startTyping(conversationId);
        }
        
        // Reset timer
        if (typingTimer.current) {
            clearTimeout(typingTimer.current);
        }
        
        // Thiết lập timer dừng gõ
        typingTimer.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(conversationId);
        }, TYPING_TIMEOUT);

        // Nếu text rỗng, dừng gõ ngay lập tức
        if (text.trim().length === 0 && isTyping) {
            setIsTyping(false);
            stopTyping(conversationId);
            if (typingTimer.current) {
                clearTimeout(typingTimer.current);
            }
        }
    };

    // ==========================================================
    // 📤 Xử lý Gửi Tin nhắn
    // ==========================================================
    const handleSendMessage = useCallback(async () => {
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage || !currentUserId) return;

        // Dừng gõ và xóa timer
        stopTyping(conversationId);
        if (typingTimer.current) {
            clearTimeout(typingTimer.current);
            typingTimer.current = null;
        }
        setIsTyping(false);

        // Tạo tin nhắn tạm thời (Optimistic Update)
        const tempMessage: Message = {
            id: Date.now(), // ID tạm thời
            conversationId: conversationId,
            senderId: currentUserId,
            content: trimmedMessage,
            type: 'text',
            fileUrl: null,
            createdAt: new Date().toISOString(),
            Sender: {
                id: currentUserId,
                username: useAuthStore.getState().user?.username || 'Bạn',
                avatarUrl: useAuthStore.getState().user?.avatarUrl || '',
                fullName: useAuthStore.getState().user?.fullName || 'Bạn',
            }
        };

        // 1. Thêm tin nhắn tạm thời vào danh sách (để hiển thị ngay)
        // Thêm vào ĐẦU MẢNG (vì FlatList bị đảo ngược - inverted)
        setMessages(prevMessages => [tempMessage, ...prevMessages]); 
        setInputMessage(''); // Xóa input

        try {
            // 2. Gửi tin nhắn qua Socket
            // Tin nhắn thực tế sẽ được thêm vào DB trên server và broadcast về qua 'receive_message'
            // Khi đó, tin nhắn thật sẽ thay thế tin nhắn tạm (vì tin nhắn thật có ID thật)
            // Tuy nhiên, vì chúng ta không dùng ID thật để so sánh và thay thế, 
            // chúng ta chỉ cần đảm bảo tin nhắn tạm không bị lặp lại khi 'receive_message' về.
            // Logic ở `subscribeToNewMessages` đã được sửa để lọc ID trùng lặp.
            const result = await sendMessage({
                conversationId: conversationId,
                content: trimmedMessage,
                type: 'text',
                fileUrl: null,
            });
            
            if (result.status === 'error') {
                 // Nếu gửi thất bại, hiển thị lại lỗi và có thể xóa tin nhắn tạm
                 Alert.alert("Lỗi Gửi", "Không thể gửi tin nhắn. Vui lòng thử lại.");

                 // Xóa tin nhắn tạm khỏi danh sách
                 setMessages(prevMessages => prevMessages.filter(m => m.id !== tempMessage.id));
            }


        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            Alert.alert("Lỗi Gửi", "Đã xảy ra lỗi hệ thống khi gửi tin nhắn.");

            // Xóa tin nhắn tạm khỏi danh sách
            setMessages(prevMessages => prevMessages.filter(m => m.id !== tempMessage.id));
        }

    }, [inputMessage, conversationId, currentUserId]);

    // ==========================================================
    // 🔄 Xử lý Load Thêm Tin nhắn (Khi cuộn đến cuối)
    // ==========================================================
    const handleLoadMore = useCallback(() => {
        // Chỉ tải thêm nếu không đang tải, có thêm tin nhắn, và không đang tải trang đầu
        if (!isLoadingMore && hasMoreMessages && !isLoading) {
            loadMessages(page);
        }
    }, [isLoadingMore, hasMoreMessages, isLoading, page, loadMessages]);

    // ==========================================================
    // 🔄 Xử lý Pull-to-Refresh
    // ==========================================================
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Reset pagination state
            setPage(1);
            setHasMoreMessages(true);
            setIsLoadingMore(false);

            // Reload messages from the beginning
            await loadMessages(1);
        } catch (error) {
            console.error("Lỗi khi refresh:", error);
        } finally {
            setRefreshing(false);
        }
    }, [loadMessages]);

    // loading indicator khi đang tải lần đầu
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#10B981" />
            </SafeAreaView>
        );
    }

    // Header cho FlatList (Indicator tải thêm)
    const renderHeader = () => {
        if (!isLoadingMore) return null;
        return (
            <View className="p-2">
                <ActivityIndicator size="small" color="#10B981" />
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            {/* Custom Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                
                {/* NHÓM MŨI TÊN VÀ AVATAR/TÊN */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2"
                    >
                        <Icon name="arrow-left" size={24} color="#10B981" />
                    </TouchableOpacity>

                    {/* Thêm khoảng cách giữa mũi tên và avatar */}
                    {user && (
                        <View className="flex-row items-center ml-2">
                            <Image
                                source={{ uri: user.avatarUrl || 'https://via.placeholder.com/40' }}
                                className="w-8 h-8 rounded-full mr-2"
                                onError={() => console.log('Image load error')}
                            />
                            <View>
                                <Text className="text-base font-semibold text-black dark:text-white">
                                    {user.fullName || 'Unknown User'}
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    {typingUsers.length > 0 ? 'Đang gõ...' : 'Online'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
                
                {/* Nút Ba chấm */}
                <TouchableOpacity className="p-2">
                    <Icon name="more-vertical" size={20} color="#10B981" />
                </TouchableOpacity>
            </View>
            <View className="flex-1">
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <MessageItem
                            message={item}
                            isMyMessage={item.senderId === currentUserId}
                        />
                    )}
                    // 💡 Cấu hình cho chat
                    inverted // Đảo ngược danh sách để tin nhắn mới nhất ở dưới
                    showsVerticalScrollIndicator={false}

                    // Xử lý Load More
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={renderHeader} // Dùng Header vì danh sách bị inverted
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center p-8">
                            <Text className="text-gray-500 dark:text-gray-400 text-center">Chưa có tin nhắn nào.</Text>
                            <Text className="text-sm text-gray-400 dark:text-gray-500 text-center mt-2">
                                Hãy bắt đầu cuộc trò chuyện!
                            </Text>
                        </View>
                    )}
                    ListFooterComponent={() => (
                        !hasMoreMessages && messages.length > 0 && (
                            <View className="p-4 items-center">
                                <Text className="text-gray-500 dark:text-gray-400">Đã tải hết lịch sử tin nhắn.</Text>
                            </View>
                        )
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#10B981']}
                            tintColor="#10B981"
                        />
                    }
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={headerHeight + (Platform.OS === 'ios' ? 0 : 0)} // Điều chỉnh offset nếu cần
                >
                    <View className="flex-row items-center p-3 border-t border-gray-200 dark:border-gray-700">
                        <TouchableOpacity className="p-2 mr-2">
                            <Icon name="plus" size={24} color="#10B981" />
                        </TouchableOpacity>

                        <TextInput
                            className="flex-1 h-10 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-black dark:text-white"
                            placeholder="Nhập tin nhắn..."
                            placeholderTextColor="#9CA3AF"
                            value={inputMessage}
                            onChangeText={handleInputChange}
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            onPress={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className={`ml-2 p-2 rounded-full ${(!inputMessage.trim() || isLoading) ? 'bg-gray-400' : 'bg-blue-500'}`}
                        >
                            <Icon name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

export default ChatScreen;