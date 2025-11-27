import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNavigate } from "@/hooks/useNavigate";
import { useColorScheme } from 'react-native';
import useAuthStore from '@/store/authStore';
import { fetchUserConversations, fetchAllUsers, Conversation, createOrGetPrivateConversation } from '@/services/chatApi';
import UsersModal from '@/components/modals/UsersModal';
import ConversationOptionsModal from '@/components/modals/ConversationOptionsModal';
import RestrictedUsersModal from '@/components/modals/RestrictedUsersModal';

import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ConversationsScreen() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation();
    const currentUser = useAuthStore(state => state.user);
    const currentUserId = currentUser?.id;
    const { navigate, goBack } = useNavigate();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isUsersModalVisible, setIsUsersModalVisible] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [restrictedUsers, setRestrictedUsers] = useState<Set<number>>(new Set());
    const [restrictedUsersList, setRestrictedUsersList] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [isRestrictedModalVisible, setIsRestrictedModalVisible] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

    // Hàm tải danh sách cuộc trò chuyện
    const loadConversations = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const data = await fetchUserConversations();
            setConversations(data);
        } catch (error) {
            console.error('Lỗi khi tải cuộc trò chuyện:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId]);

    // Hàm tải restricted users từ AsyncStorage
    const loadRestrictedUsers = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const storedRestrictedUsers = await AsyncStorage.getItem(`restrictedUsers_${currentUserId}`);
            if (storedRestrictedUsers) {
                const restrictedUsersArray = JSON.parse(storedRestrictedUsers);
                setRestrictedUsers(new Set(restrictedUsersArray));
                // Load all users to filter restricted ones for the list
                const allUsers = await fetchAllUsers();
                const restrictedList = allUsers.filter((user: any) => restrictedUsersArray.includes(user.id));
                setRestrictedUsersList(restrictedList);
            }
        } catch (error) {
            console.error('Lỗi khi tải restricted users:', error);
        }
    }, [currentUserId]);

    // Tải dữ liệu khi focus vào screen
    useFocusEffect(
        useCallback(() => {
            loadRestrictedUsers();
            loadConversations();
        }, [loadRestrictedUsers, loadConversations])
    );

    // Hàm refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadConversations();
    }, [loadConversations]);

    // Hàm tải danh sách users
    const loadUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await fetchAllUsers();
            const filteredUsers = data.filter((user: any) => user.id !== currentUserId && !restrictedUsers.has(user.id));
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Lỗi khi tải danh sách users:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
        } finally {
            setLoadingUsers(false);
        }
    }, [currentUserId, restrictedUsers]);

    // Hàm mở modal users
    const openUsersModal = () => {
        setIsUsersModalVisible(true);
        loadUsers();
    };

    // Hàm xử lý long press trên user
    const handleUserLongPress = (user: any) => {
        setSelectedUser(user);
        setIsOptionsModalVisible(true);
    };

    // Hàm bắt đầu long press
    const startLongPress = (user: any) => {
        const timer = setTimeout(() => {
            handleUserLongPress(user);
        }, 1000); // 2 seconds
        setLongPressTimer(timer);
    };

    // Hàm hủy long press
    const cancelLongPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    // Hàm nhắn tin với user
    const startChatWithUser = async (user: any) => {
        setIsOptionsModalVisible(false);
        setIsUsersModalVisible(false);

        try {
            // Tạo hoặc lấy conversationId trước khi navigate
            const result = await createOrGetPrivateConversation(user.id);
            if ('status' in result && result.status === 'error') {
                Alert.alert('Lỗi', result.message);
                return;
            }

            const conversationId = (result as { conversationId: number }).conversationId;

            (navigation as any).navigate('ChatScreen', {
                conversationId: conversationId,
                user: user,
            });
        } catch (error) {
            console.error('Lỗi khi tạo cuộc trò chuyện:', error);
            Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
        }
    };

    // Hàm chuyển vào danh sách hạn chế
    const moveToRestrictedList = async (user: any) => {
        setIsOptionsModalVisible(false);
        Alert.alert(
            'Xác nhận chuyển',
            `Bạn có muốn chuyển ${user.fullName} vào danh sách hạn chế không?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Chuyển',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Thêm vào restricted users
                            const updatedRestrictedUsers = new Set(restrictedUsers);
                            updatedRestrictedUsers.add(user.id);
                            setRestrictedUsers(updatedRestrictedUsers);

                            // Lưu vào AsyncStorage
                            const restrictedUsersArray = Array.from(updatedRestrictedUsers);
                            await AsyncStorage.setItem(`restrictedUsers_${currentUserId}`, JSON.stringify(restrictedUsersArray));

                            // Cập nhật restrictedUsersList
                            setRestrictedUsersList((prev) => [...prev, user]);

                            // Xóa user khỏi danh sách hiện tại
                            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
                            Alert.alert('Thông báo', `Đã chuyển ${user.fullName} vào danh sách hạn chế`);
                        } catch (error) {
                            console.error('Lỗi khi lưu restricted users:', error);
                            Alert.alert('Lỗi', 'Không thể chuyển user vào danh sách hạn chế');
                        }
                    }
                }
            ]
        );
    };

    // Hàm thêm lại vào danh sách
    const addBackToList = async (user: any) => {
        setIsRestrictedModalVisible(false);
        Alert.alert(
            'Xác nhận thêm lại',
            `Bạn có muốn thêm lại ${user.fullName} vào danh sách không?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Thêm lại',
                    onPress: async () => {
                        try {
                            // Xóa khỏi restricted users
                            const updatedRestrictedUsers = new Set(restrictedUsers);
                            updatedRestrictedUsers.delete(user.id);
                            setRestrictedUsers(updatedRestrictedUsers);

                            // Lưu vào AsyncStorage
                            const restrictedUsersArray = Array.from(updatedRestrictedUsers);
                            await AsyncStorage.setItem(`restrictedUsers_${currentUserId}`, JSON.stringify(restrictedUsersArray));

                            // Cập nhật restrictedUsersList
                            setRestrictedUsersList((prev) => prev.filter((u) => u.id !== user.id));

                            // Thêm lại vào danh sách users
                            setUsers((prevUsers) => [...prevUsers, user]);
                            Alert.alert('Thông báo', `Đã thêm lại ${user.fullName} vào danh sách`);
                        } catch (error) {
                            console.error('Lỗi khi thêm lại user:', error);
                            Alert.alert('Lỗi', 'Không thể thêm lại user vào danh sách');
                        }
                    }
                }
            ]
        );
    };

    // Hàm mở modal restricted users
    const openRestrictedModal = () => {
        setIsRestrictedModalVisible(true);
    };

    // Lọc conversations dựa trên search query
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;

        return conversations.filter(conv => {
            const otherParticipant = conv.members.find(p => p.id !== currentUserId);
            if (!otherParticipant) return false;

            const fullName = otherParticipant.fullName?.toLowerCase() || '';
            const username = otherParticipant.username?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();

            return fullName.includes(query) || username.includes(query);
        });
    }, [conversations, searchQuery, currentUserId]);

    // Hàm render item cuộc trò chuyện
    const renderConversationItem = ({ item }: { item: Conversation }) => {
        // Tìm participant khác với current user
        const otherParticipant = item.members.find(p => p.id !== currentUserId);

        if (!otherParticipant) return null;

        // Định dạng thời gian
        const timeAgo = item.lastMessage
            ? formatDistanceToNowStrict(parseISO(item.lastMessage.createdAt), {
                addSuffix: true,
                locale: vi
            })
            : formatDistanceToNowStrict(parseISO(item.updatedAt), {
                addSuffix: true,
                locale: vi
            });

        // Classes nhất quán
        const textPrimary = colorScheme === 'dark' ? 'text-white' : 'text-black';
        const textMuted = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
        const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
        const activeOpacity = colorScheme === 'dark' ? 'active:bg-gray-800' : 'active:bg-gray-50';

        return (
            <TouchableOpacity
                // Thêm hiệu ứng nhấn và border
                className={`flex-row items-center px-4 py-3 border-b ${borderColor} ${activeOpacity}`}
                onPress={() => {
                    (navigation as any).navigate('ChatScreen', {
                        conversationId: item.id,
                        user: otherParticipant,
                    });
                }}
            >
                {/* Avatar (Tăng kích thước và thêm viền nổi bật nhẹ) */}
                <Image
                    source={{ uri: otherParticipant.avatarUrl || 'https://via.placeholder.com/60' }}
                    className="w-14 h-14 rounded-full mr-4 bg-gray-300 border border-indigo-400 dark:border-indigo-600" // w-14 h-14 thay vì w-12 h-12
                />

                <View className="flex-1 flex-row justify-between items-center">
                    <View className="flex-1 mr-4">
                        {/* Tên người dùng */}
                        <Text className={`text-lg font-bold ${textPrimary}`}>
                            {otherParticipant.fullName}
                        </Text>

                        {/* Tin nhắn cuối cùng */}
                        <Text className={`text-sm ${textMuted}`} numberOfLines={1}>
                            {item.lastMessage ? item.lastMessage.content : 'Chưa có tin nhắn'}
                        </Text>
                    </View>

                    {/* Thời gian */}
                    <Text className={`text-xs text-right ${colorScheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {timeAgo}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">
                    Đang tải danh sách cuộc trò chuyện...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <View className={`flex-row items-center justify-between p-4 border-b ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <TouchableOpacity
                    onPress={() => goBack()}
                    className="p-2"
                >
                    <Icon name="arrow-left" size={24} color="#10B981" />
                </TouchableOpacity>
                <Text className={`text-xl font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                    Tin nhắn
                </Text>
                <TouchableOpacity
                    onPress={openUsersModal}
                    className="p-2"
                >
                    <Icon name="users" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                </TouchableOpacity>

            </View>

            {/* Search Bar */}
            <View className={`px-4 py-3 border-b ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <View className={`flex-row items-center px-3 py-2 rounded-lg ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    <Icon name="search" size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        className={`flex-1 ml-2 text-base ${colorScheme === 'dark' ? 'text-white' : 'text-black'
                            }`}
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="x" size={20} color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Danh sách cuộc trò chuyện */}
            {filteredConversations.length === 0 ? (
                <View className="flex-1 justify-center items-center p-8">
                    <Icon name="message-circle" size={64} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
                    <Text className={`text-lg font-semibold mt-4 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {searchQuery.trim() ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
                    </Text>
                    <Text className={`text-center mt-2 ${colorScheme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                        {searchQuery.trim() ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu trò chuyện với bạn bè của bạn!'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderConversationItem}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#10B981']}
                            tintColor="#10B981"
                        />
                    }
                />
            )}

            {/* Modal danh sách users */}
            <UsersModal
                isVisible={isUsersModalVisible} // Hiển thị modal
                onClose={() => setIsUsersModalVisible(false)} // Đóng modal
                users={users.filter((user) => user.roleId !== 1)} // Truyền danh sách users
                loadingUsers={loadingUsers} // Truyền trạng thái loading
                colorScheme={colorScheme}// Truyền colorScheme
                onOpenRestrictedModal={openRestrictedModal} // Mở modal restricted users
                onStartLongPress={startLongPress} // Bắt đầu long press
                onCancelLongPress={cancelLongPress} // Hủy long press
            />

            {/* Modal options */}
            <ConversationOptionsModal
                isVisible={isOptionsModalVisible}
                onClose={() => setIsOptionsModalVisible(false)} // Đóng modal
                selectedUser={selectedUser} // Truyền selectedUser
                colorScheme={colorScheme} // Truyền colorScheme
                onStartChat={startChatWithUser} // Hàm nhắn tin
                onMoveToRestricted={moveToRestrictedList} // Hàm chuyển vào danh sách hạn chế
            />

            {/* Modal danh sách restricted users */}
            <RestrictedUsersModal
                isVisible={isRestrictedModalVisible} // Hiển thị modal
                onClose={() => setIsRestrictedModalVisible(false)} // Đóng modal
                restrictedUsersList={restrictedUsersList} // Truyền danh sách restricted users
                colorScheme={colorScheme} //    Truyền colorScheme
                onAddBackToList={addBackToList} // Hàm thêm lại vào danh sách
            />
        </View>
    );
}
