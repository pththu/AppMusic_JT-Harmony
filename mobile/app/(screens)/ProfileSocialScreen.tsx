import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
    fetchPostsByUserId,
    fetchUserProfileSocial,
    toggleFollow,
    togglePostLike,
    fetchCommentsByPostId,
    createNewComment,
    toggleCommentLike,
    ProfileSocial,
    Post as PostType,
    Comment,
} from "../../services/socialApi";
import useAuthStore from "@/store/authStore";
import PostItem from "../../components/items/PostItem";
import { useNavigate } from "@/hooks/useNavigate";
import CommentModal from "../../components/modals/CommentModal";
import FollowListModal from "../../components/modals/FollowListModal";
import CustomButton from "@/components/custom/CustomButton";
import { createOrGetPrivateConversation } from '../../services/chatApi'; // Cần import từ đúng đường dẫn

// Định nghĩa kiểu cho Route Params
type RootStackParamList = {
    ProfileSocial: { userId: number };
};
type ProfileSocialRouteProp = RouteProp<RootStackParamList, 'ProfileSocial'>;


export default function ProfileSocialScreen() {
    const colorScheme = useColorScheme();
    const navigation = useNavigation();
    const route = useRoute<ProfileSocialRouteProp>();
    const { userId } = route.params; // Lấy userId từ navigation params

    const currentUser = useAuthStore(state => state.user);
    const currentUserId = currentUser?.id;
    const { navigate } = useNavigate();

    // STATE
    const [profile, setProfile] = useState<ProfileSocial | null>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true); // Loading chính

    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [quote, setQuote] = useState<Comment | null>(null);

    const [isFollowingPending, setIsFollowingPending] = useState(false);
    
    // STATES CHO FOLLOW MODAL
    const [followModalVisible, setFollowModalVisible] = useState(false);
    const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');

    // Kiểm tra xem đây có phải là profile của người dùng hiện tại không
    const isCurrentUserProfile = currentUser && currentUser.id === userId;

    // --- LOGIC TẢI DỮ LIỆU ---
    const loadData = useCallback(async () => {
        if (!userId) {
            Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
            navigation.goBack();
            return;
        }

        setLoading(true);
        try {
            // 1. Tải Profile Social
            const profileData = await fetchUserProfileSocial(userId);
            setProfile(profileData);
            
            // 2. Tải Bài đăng
            const postData = await fetchPostsByUserId(userId);
            setPosts(postData);

        } catch (error) {
            console.error("Lỗi tải Profile Social:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin profile. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [userId, navigation]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 🆕 Hàm xử lý mở Chat
 const handleChatPress = useCallback(async () => {
        if (!profile) return;
        try {
            // 1. Gọi API để tạo/lấy Conversation ID
            const { conversationId } = await createOrGetPrivateConversation(userId);

            // 2. Chuyển hướng đến màn hình Chat với ID vừa nhận
            // 💡 Cần tạo màn hình 'ChatScreen' và thêm vào Stack Navigator
            (navigation as any).navigate('ChatScreen', {
                conversationId: conversationId,
                // Truyền thông tin người chat cùng để hiển thị trên header
                user: { id: userId, fullName: profile.fullName, avatarUrl: profile.avatarUrl }
            });

        } catch (error) {
            console.error('Lỗi khi mở chat:', error);
        }
    }, [userId, profile, navigation]);


    // --- HÀM CHUYỂN HƯỚNG PROFILE ---
    const handleUserPress = useCallback((targetUserId: number) => {
        // // Nếu nhấn vào ảnh của chính mình, nó sẽ reload màn hình.
        // navigate('ProfileSocial', { userId: targetUserId });
    }, [navigate]);
    
    // --- LOGIC CẬP NHẬT BÀI ĐĂNG  ---
    // Điều chỉnh để nhận 'isLiked' hoặc 'heartCount'
    const updatePost = useCallback((postId: string, type: 'isLiked' | 'heartCount' | 'commentCount' | 'shareCount', value: any) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    // Cập nhật giá trị
                    const newValue = typeof value === 'function' ? value(post[type]) : value;
                    return {
                        ...post,
                        [type]: newValue,
                    };
                }
                return post;
            })
        );
    }, []);

    // Xử lý Thích/Bỏ thích bài đăng
    const handleTogglePostLike = async (postId: string) => {
        // PostItem sẽ tự gọi API và gửi kết quả về qua onPostUpdate.
    };

    // Hàm mở Modal
    const openCommentModal = async (postId: string) => {
        setSelectedPostId(postId);
        setCommentModalVisible(true);
        try {
            const fetchedComments = await fetchCommentsByPostId(postId);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Lỗi khi tải bình luận:", error);
            Alert.alert("Lỗi", "Không thể tải bình luận.");
        }
    };

    // Hàm đóng Modal
    const closeCommentModal = () => {
        setSelectedPostId(null);
        setCommentModalVisible(false);
        setComments([]);
        setNewComment('');
        setReplyTo(null);
        setQuote(null);
    };

    // Hàm thêm bình luận
    const addComment = async (text: string, parentId: string | null) => {
        if (!selectedPostId) return;
        try {
            const newCommentData = await createNewComment(selectedPostId, text, parentId);
            // Cập nhật danh sách bình luận
            setComments(prev => [newCommentData, ...prev]);
            // Cập nhật số lượng bình luận trong bài đăng
            updatePost(selectedPostId, 'commentCount', (prevCount: number) => prevCount + 1);
        } catch (error) {
            console.error("Lỗi khi thêm bình luận:", error);
            Alert.alert("Lỗi", "Không thể thêm bình luận.");
        }
    };

    // Hàm xử lý like bình luận
    const handleCommentLike = async (postId: string, commentId: string, isReply: boolean, replyId: string) => {
        try {
            const result = await toggleCommentLike( commentId);
            // Cập nhật trạng thái like trong danh sách bình luận
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (isReply) {
                        // Cập nhật reply
                        if (comment.Replies) {
                            comment.Replies = comment.Replies.map(reply =>
                                reply.id === replyId ? { ...reply, isLiked: result.isLiked, likeCount: result.likeCount } : reply
                            );
                        }
                        return comment;
                    } else {
                        // Cập nhật comment
                        return comment.id === commentId ? { ...comment, isLiked: result.isLiked, likeCount: result.likeCount } : comment;
                    }
                })
            );
        } catch (error) {
            console.error("Lỗi khi like bình luận:", error);
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái like.");
        }
    };

    // 🆕 HÀM XỬ LÝ THEO DÕI
const handleToggleFollow = useCallback(async () => {
    if (!profile || !currentUserId) return; // Kiểm tra an toàn
    
    // Không cho phép tự follow chính mình trên UI (logic này cũng có ở backend)
    if (profile.id === currentUserId) return; 

    setIsFollowingPending(true); 
    try {
        // Gọi API
        const { isFollowing: newIsFollowing } = await toggleFollow(profile.id);

        // CẬP NHẬT TRẠNG THÁI PROFILE (FOLLOW COUNT & isFollowing)
        setProfile((prev) => {
            if (!prev) return null;

            let newFollowerCount = prev.followerCount;
            if (newIsFollowing) {
                // Nếu đang Follow: tăng Follower Count
                newFollowerCount += 1;
            } else {
                // Nếu Unfollow: giảm Follower Count (tối thiểu là 0)
                newFollowerCount = Math.max(0, newFollowerCount - 1);
            }

            return {
                ...prev,
                isFollowing: newIsFollowing,
                followerCount: newFollowerCount,
            };
        });
    } catch (error) {
        console.error("Lỗi toggle follow:", error);
    } finally {
        setIsFollowingPending(false); 
    }
}, [profile, currentUserId]);
    
    // HÀM XỬ LÝ MỞ Follow MODAL
const handleOpenFollowModal = (type: 'followers' | 'following') => {
    if (type === 'followers') {
        setFollowListType('followers');
    } else {
        setFollowListType('following');
    }
    setFollowModalVisible(true);
};

const handleCloseFollowModal = () => {
    setFollowModalVisible(false);
    // setFollowListType('followers');
};
    
    // Render Header Profile
    const renderProfileHeader = () => (
        <View className={`p-4 border-b ${colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Ảnh đại diện và Tên */}
            <View className="flex-row items-center mb-4">
                <Image
                    source={{ uri: profile?.avatarUrl || 'https://via.placeholder.com/150' }}
                    className="w-20 h-20 rounded-full mr-4 bg-gray-300"
                />
                <View className="flex-1">
                    <Text className="text-xl font-bold text-black dark:text-white">
                        {profile?.fullName || profile?.username || 'Người dùng'}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        @{profile?.username}
                    </Text>
                </View>
            </View>

            {/* Tiểu sử */}
            {profile?.bio && (
                <Text className="text-base text-gray-700 dark:text-gray-300 mb-4">
                    {profile.bio}
                </Text>
            )}

            {/* Số liệu Thống kê */}
            <View className="flex-row justify-around mb-4">
                <TouchableOpacity onPress={() => {}}> 
                    <Text className="text-lg font-bold text-black dark:text-white text-center">{posts.length}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">Bài đăng</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpenFollowModal('followers')}>
                    <Text className="text-lg font-bold text-black dark:text-white text-center">{profile?.followerCount || 0}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">Người theo dõi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpenFollowModal('following')}>
                    <Text className="text-lg font-bold text-black dark:text-white text-center">{profile?.followingCount || 0}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">Đang theo dõi</Text>
                </TouchableOpacity>
            </View>

            {/* NÚT THEO DÕI */}
            {profile && profile.id !== currentUserId && ( // Chỉ hiển thị nếu không phải profile của chính mình
                <View className="mt-4 w-full items-center">
                    {/* 1. Nút Nhắn tin (Mới thêm) */}
                    <TouchableOpacity 
                        onPress={handleChatPress} 
                        className="flex-row items-center justify-center px-4 py-2 rounded-full border border-green-500 dark:border-green-400 bg-transparent"
                    >
                        <Icon name="message-circle" size={18} color={colorScheme === 'dark' ? '#10B981' : '#059669'} />
                        <Text className="ml-2 font-bold text-green-600 dark:text-green-400">Nhắn tin</Text>
                    </TouchableOpacity>
                    {isFollowingPending ? (
                        // HIỂN THỊ LOADING KHI ĐANG XỬ LÝ
                        <TouchableOpacity 
                            disabled={true} // Vô hiệu hóa
                            className={`py-2 px-6 rounded-full border-2 w-1/2 items-center 
                                ${profile.isFollowing 
                                    ? (colorScheme === 'dark' ? 'bg-transparent border-gray-600' : 'bg-transparent border-black')
                                    : 'bg-green-600 border-green-600'
                                }`}
                        >
                            <ActivityIndicator 
                                color={profile.isFollowing ? (colorScheme === 'dark' ? 'white' : 'black') : 'white'} 
                            />
                        </TouchableOpacity>
                    ) : (
                        // SỬ DỤNG CustomButton
                        <CustomButton
                            title={profile.isFollowing ? "Đang Theo Dõi" : "Theo Dõi"}
                            onPress={handleToggleFollow}
                            // Điều chỉnh variant dựa trên trạng thái
                            variant={profile.isFollowing ? 'primary' : 'primary'}

                            className="w-full"
                        />
                    )}
                </View>
            )}
            
            <View className={`mt-4 pt-2 ${colorScheme === 'dark' ? 'border-t-2 border-gray-700' : 'border-t-2 border-gray-200'}`}>
                <Text className="text-lg font-bold text-black dark:text-white">Bài đăng của {profile?.fullName}</Text>
            </View>
        </View>
    );
    
    // Nếu đang tải ban đầu
    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#f56565" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải profile...</Text>
            </SafeAreaView>
        );
    }
    
    // Màn hình chính
    return (
        <View className="flex-1 bg-white dark:bg-[#0E0C1F]">
            {/* Custom Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2"
                    >
                        <Icon name="arrow-left" size={24} color="#10B981" />
                    </TouchableOpacity>
            </View>

            {/* Danh sách bài đăng với Header */}
            <FlatList
                ListHeaderComponent={renderProfileHeader}
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostItem
                        {...item}
                        // Gán các hàm xử lý
                        onPostUpdate={(type, value) => updatePost(item.id, type, value)}
                        onCommentPress={() => openCommentModal(item.id)}
                        onSharePress={() => Alert.alert('Chia sẻ', 'Tính năng chưa phát triển')}
                        onUserPress={item.User?.id === userId ? undefined : handleUserPress}

                        // Truyền images từ fileUrl
                        images={item.fileUrl}

                        // Truyền musicLink
                        musicLink={item.musicLink}
                    />
                )}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View className="p-8 items-center">
                        <Text className="text-gray-500 dark:text-gray-400">Người dùng này chưa có bài đăng nào.</Text>
                    </View>
                )}
            />

            {/* Comment Modal */}
            <CommentModal
                visible={commentModalVisible}
                onClose={closeCommentModal}
                comments={comments}
                onAddComment={addComment}
                onCommentLike={handleCommentLike}
                postId={selectedPostId}
                onUserPress={handleUserPress}
                newComment={newComment}
                setNewComment={setNewComment}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                quote={quote}
                setQuote={setQuote}
            />

            {/* FOLLOW LIST MODAL MỚI */}
            <FollowListModal
                visible={followModalVisible}
                onClose={handleCloseFollowModal}
                userId={userId} // userId của profile đang xem
                listType={followListType} // 'followers' hoặc 'following'
            />
        </View>
    );
}
