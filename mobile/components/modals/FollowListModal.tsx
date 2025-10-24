import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    useColorScheme,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from "@react-navigation/native"; // Cần thiết cho navigation
import { useNavigate } from "@/hooks/useNavigate"; // 💡 Giả định hook này có sẵn trong dự án của bạn
import Icon from 'react-native-vector-icons/Feather';
import { fetchFollowers, fetchFollowing, UserInfo, toggleFollow } from '../../services/socialApi'; //
import useAuthStore from '@/store/authStore'; //

// --- INTERFACES ĐÃ CẬP NHẬT ---

// // Interface cho dữ liệu người dùng trong Modal (thêm isFollowing)
// export interface UserDataInModal extends UserInfo {
//     isFollowing: boolean; // Trạng thái này là của CURRENT USER đối với người này
// }

interface FollowListModalProps {
    visible: boolean;
    onClose: () => void;
    userId: number; // ID của người dùng mà chúng ta đang xem danh sách Follow
    listType: 'followers' | 'following'; // Loại danh sách cần hiển thị
}

interface FollowItemProps { 
    user: UserInfo; 
    onCloseModal: () => void; // Prop để đóng modal
    onToggleFollow: (userId: number) => Promise<boolean>; // Hàm gọi API và cập nhật state cha
}

// =========================================================
// 1. COMPONENT CON: FollowItem
// =========================================================
const FollowItem: React.FC<FollowItemProps> = ({ user, onCloseModal, onToggleFollow }) => {
    const colorScheme = useColorScheme();
    const { navigate } = useNavigate(); // Sử dụng useNavigate hook để điều hướng
    const currentUserId = useAuthStore(state => state.user?.id); // Lấy ID người dùng hiện tại

    // State để quản lý trạng thái follow của người dùng này
    const [isFollowingState, setIsFollowingState] = useState(user.isFollowing === true);

    useEffect(() => {
        setIsFollowingState(user.isFollowing === true);
    }, [user.isFollowing]);

    const [loading, setLoading] = useState(false);
    // Kiểm tra xem người dùng trong danh sách có phải là chính mình không
    const isCurrentUser = currentUserId === user.id;
    

    // --- HÀM XỬ LÝ THEO DÕI/HỦY THEO DÕI ---
    const handleToggleFollow = async () => {
        if (!currentUserId) {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập để thực hiện chức năng này.');
            return;
        }

        // 1. Cập nhật trạng thái tạm thời (Optimistic Update)
        const previousState = isFollowingState;
        setIsFollowingState(prev => !prev); 
        setLoading(true);

        try {
            // 2. Gọi API
            const newStatus = await onToggleFollow(user.id);

            // 3. Cập nhật trạng thái chính thức (nếu API thành công)
            setIsFollowingState(newStatus);
        } catch (error) {
            console.error('Lỗi toggle follow:', error);
            // 4. Hoàn lại trạng thái nếu gọi API thất bại
            setIsFollowingState(previousState); 
            Alert.alert('Lỗi', 'Không thể thay đổi trạng thái theo dõi.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- HÀM XỬ LÝ NHẤN VÀO USER HOẶC AVATAR (Điều hướng) ---
    const handleUserNavigate = () => {
        // 1. Đóng Modal trước
        onCloseModal(); 
        // 2. Điều hướng đến ProfileSocialScreen
        navigate('ProfileSocialScreen', { userId: user.id }); 
    };

    const followButtonClass = isFollowingState 
        ? "bg-transparent border border-red-500"
        : "bg-green-600";                      

    const followButtonText = isFollowingState 
        ? "Hủy Theo dõi" 
        : "Theo dõi";

    return (
        <TouchableOpacity 
            className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-800"
            onPress={handleUserNavigate}
        >
            <Image 
                source={{ uri: user.avatarUrl || 'default_avatar_url' }} 
                className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
                <Text className="font-bold text-base text-black dark:text-white">{user.username}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{user.fullName}</Text>
            </View>

            {/* ✅ NÚT FOLLOW/UNFOLLOW - Chỉ hiển thị khi không phải là chính mình */}
            {!isCurrentUser && (
                <TouchableOpacity
                    onPress={handleToggleFollow}
                    className={`px-3 py-1 rounded-full ${followButtonClass}`}
                    disabled={loading} // Vô hiệu hóa khi đang xử lý API
                >
                    {loading ? (
                        <ActivityIndicator color={isFollowingState ? "#ef4444" : "#fff"} />
                    ) : (
                        <Text className={`text-sm font-semibold ${isFollowingState ? "text-red-500" : "text-white"}`}>
                            {followButtonText}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};


// =========================================================
// 2. COMPONENT CHÍNH: FollowListModal
// =========================================================

export default function FollowListModal({ visible, onClose, userId, listType }: FollowListModalProps) {
    const colorScheme = useColorScheme();
    // 💡 Sửa lại state type để bao gồm isFollowing
    const [data, setData] = useState<UserInfo[]>([]); 
    const [loading, setLoading] = useState(true);
    const title = listType === 'followers' ? 'Người Theo Dõi' : 'Đang Theo Dõi';
    const currentUserId = useAuthStore(state => state.user?.id); 
    
    // --- HÀM XỬ LÝ API VÀ CẬP NHẬT STATE ---
    const handleToggleFollow = async (userIdToToggle: number): Promise<boolean> => {
        try {
            // Gọi API toggleFollow
            const result = await toggleFollow(userIdToToggle);
            const newIsFollowingStatus = result.isFollowing;

            // Cập nhật state data của Modal
            setData(prevData =>
                prevData.map(user => 
                    user.id === userIdToToggle 
                        ? { ...user, isFollowing: newIsFollowingStatus } 
                        : user
                )
            );
            return newIsFollowingStatus;
        } catch (error) {
            console.error("Lỗi khi toggle follow trong Modal:", error);
            throw error;
        }
    };

    // --- HÀM LẤY DỮ LIỆU ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const fetcher = listType === 'followers' ? fetchFollowers : fetchFollowing; //
            const fetchedUsers: UserInfo[] = await fetcher(userId); //

            // ⚠️ LƯU Ý: Vì interface UserInfo không có isFollowing, 
            // tôi phải giả định Backend đã trả về (hoặc bạn sẽ cập nhật Backend). 
            // Nếu không, bạn cần một API bổ sung để kiểm tra trạng thái follow của từng người.
            const finalData = fetchedUsers.map(user => ({
                ...user,
                // GIẢ ĐỊNH: isFollowing được Backend trả về hoặc mặc định là false nếu không có.
                isFollowing: (user as any).isFollowing === true, 
            })) as UserInfo[];

            setData(finalData);
        } catch (error) {
            console.error('Lỗi khi tải danh sách follow:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
            if (visible && userId) {
                fetchData();
            }
        }, [visible, userId, listType]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50 dark:bg-black/80">
                <View 
                    className={`h-3/4 rounded-t-3xl p-0 ${colorScheme === 'dark' ? 'bg-[#0E0C1F]' : 'bg-white'}`}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                        <Text className="text-xl font-bold text-black dark:text-white">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Icon name="x" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#10B981" />
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <FollowItem 
                                    user={item} 
                                    onCloseModal={onClose} // ✅ Truyền hàm đóng Modal
                                    onToggleFollow={handleToggleFollow} // ✅ Truyền hàm xử lý API
                                />
                            )}
                            ListEmptyComponent={() => (
                                <View className="p-8 items-center">
                                    <Text className="text-gray-500 dark:text-gray-400">Không có ai trong danh sách này.</Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}