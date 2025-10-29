import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  RefreshControl,
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
import LikeModal from "../../components/modals/LikeModal";
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

    // STATES CHO LIKE MODAL
    const [likeModalVisible, setLikeModalVisible] = useState(false);
    const [selectedPostIdForLikes, setSelectedPostIdForLikes] = useState<string | null>(null);

    // STATES CHO EDIT MODAL
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [editContent, setEditContent] = useState("");

    // STATE CHO REFRESH
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            const profileResponse = await fetchUserProfileSocial(userId);
            if ('message' in profileResponse) {
                throw new Error(String(profileResponse.message));
            }
            setProfile(profileResponse);

            // 2. Tải Bài đăng
            const postResponse = await fetchPostsByUserId(userId);
            if ('message' in postResponse) {
                throw new Error(String(postResponse.message));
            }
            setPosts(postResponse);

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
            //  Cần tạo màn hình 'ChatScreen' và thêm vào Stack Navigator
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
    const updatePost = useCallback((postId: string, type: 'isLiked' | 'heartCount' | 'commentCount' | 'shareCount' | 'content' | 'share', value: any) => {
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

    // HÀM XỬ LÝ MỞ LIKE MODAL
    const handleLikeCountPress = useCallback((postId: number) => {
        setSelectedPostIdForLikes(postId.toString());
        setLikeModalVisible(true);
    }, []);

    // HÀM XỬ LÝ ĐÓNG LIKE MODAL
    const handleCloseLikeModal = useCallback(() => {
        setLikeModalVisible(false);
        setSelectedPostIdForLikes(null);
    }, []);

    // HÀM XỬ LÝ MỞ EDIT MODAL
    const handleEditPress = useCallback((post: any) => {
        setEditingPost(post);
        setEditContent(post.content);
        setEditModalVisible(true);
    }, []);

    // HÀM XỬ LÝ ĐÓNG EDIT MODAL
    const handleCloseEditModal = useCallback(() => {
        setEditModalVisible(false);
        setEditingPost(null);
        setEditContent("");
    }, []);

    // HÀM XỬ LÝ LƯU EDIT
    const handleSaveEdit = useCallback(async () => {
        if (!editingPost || !editContent.trim()) return;

        try {
            // Giả sử có API updatePost
            // await updatePost(editingPost.id, editContent);
            // Tạm thời cập nhật local
            updatePost(editingPost.id, 'content', editContent);
            handleCloseEditModal();
            Alert.alert('Thành công', 'Bài viết đã được cập nhật.');
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật bài viết.');
        }
    }, [editingPost, editContent, updatePost]);

    // HÀM XỬ LÝ XÓA POST
    const handleDeletePress = useCallback(async (postId: string) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa bài viết này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Giả sử có API deletePost
                            // await deletePost(postId);
                            // Tạm thời xóa local
                            setPosts(prev => prev.filter(p => p.id !== postId));
                            Alert.alert('Thành công', 'Bài viết đã được xóa.');
                        } catch (error) {
                            console.error('Lỗi khi xóa bài viết:', error);
                            Alert.alert('Lỗi', 'Không thể xóa bài viết.');
                        }
                    },
                },
            ]
        );
    }, []);

    // HÀM XỬ LÝ REFRESH
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    }, [loadData]);

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
            if ('message' in fetchedComments) {
                throw new Error(String(fetchedComments.message));
            }
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
            if ('message' in newCommentData) {
                throw new Error(String(newCommentData.message));
            }
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
            if ('message' in result) {
                throw new Error(String(result.message));
            }
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
        const result = await toggleFollow(profile.id);
        if ('message' in result) {
            throw new Error(String(result.message));
        }
        const { isFollowing: newIsFollowing } = result;

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
    const renderProfileHeader = () => {
        if (!profile) return null;

        const textMuted = 'text-gray-600 dark:text-gray-400';
        const textPrimary = 'text-black dark:text-white';

        return (
            <View className="bg-gray-50 dark:bg-[#0E0C1F]">
                
                {/* KHỐI THÔNG TIN CƠ BẢN: Avatar, Tên, Username */}
                <View className="px-4 pt-4"> 
                    <View className="flex-row items-start mb-4">
                        {/* Avatar (Tăng kích thước và thêm viền nổi bật) */}
                        <Image
                            source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/150' }}
                            className="w-24 h-24 rounded-full mr-4 bg-gray-300 border-4  border-indigo-400 dark:border-[#0E0C1F]" 
                        />

                        <View className="flex-1 justify-start pt-2">
                            {/* Tên và Username */}
                            <Text className={`text-2xl font-extrabold ${textPrimary} mt-1`}>
                                {profile.fullName || profile.username || 'Người dùng'}
                            </Text>
                            <Text className={`text-base ${textMuted} mb-3`}>
                                @{profile.username}
                            </Text>
                        </View>
                    </View>

                    {/* Tiểu sử (Bio) */}
                    {profile.bio ? (
                        <Text className={`text-base ${textPrimary} mb-4 leading-snug`}>
                            {profile.bio}
                        </Text>
                    ) : (
                         <Text className={`text-base italic ${textMuted} mb-4`}>
                            {isCurrentUserProfile ? "Hãy thêm tiểu sử để mọi người hiểu hơn về bạn." : "Người dùng này chưa có tiểu sử."}
                        </Text>
                    )}
                </View>

                {/* KHỐI NÚT HÀNH ĐỘNG: Theo dõi & Nhắn tin/Chỉnh sửa  */}
                <View className="px-4 pb-4">
                    {profile.id !== currentUserId ? (
                        // Nút dành cho người dùng khác
                        <View className="flex-row space-x-3 w-full">
                            {/* Nút Follow/Unfollow */}
                            <View className="flex-1">
                                <CustomButton
                                    onPress={handleToggleFollow}
                                    title={profile.isFollowing ? "Đang Theo Dõi" : "Theo Dõi"}
                                    //  Đã Theo dõi: Viền (Outline) | Chưa Theo dõi: Màu chính (Primary)
                                    variant={profile.isFollowing ? 'outline' : 'primary'}
                                    size="medium"
                                    className="w-full"
                                    isLoading={isFollowingPending}
                                />
                            </View>

                            {/* Nút Message/Chat */}
                            <View style={{ width: '40%' }}>
                                <CustomButton
                                    onPress={handleChatPress}
                                    title="Nhắn tin"
                                    variant="primary"
                                    size="medium"
                                    className="w-full"
                                    iconName="send"
                                />
                            </View>
                        </View>
                    ) : (
                        // Nút dành cho chính mình (Chỉnh sửa hồ sơ)
                        <CustomButton
                            onPress={() => Alert.alert("Thông báo", "Mở màn hình chỉnh sửa Profile")}
                            title="Chỉnh sửa hồ sơ"
                            variant="secondary"
                            size="medium"
                            className="w-full"
                            iconName="edit-3"
                        />
                    )}
                </View>


                {/* KHỐI STATS (Số liệu Thống kê) - Nổi bật hơn */}
                <View className={`flex-row justify-around py-3 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E0C1F]`}>
                    {/* Posts */}
                    <TouchableOpacity onPress={() => {}} className="items-center p-1 active:opacity-70"> 
                        <Text className={`text-xl font-bold text-indigo-500 text-center`}>{posts.length}</Text>
                        <Text className={`text-sm ${textMuted}`}>Bài đăng</Text>
                    </TouchableOpacity>
                    {/* Followers */}
                    <TouchableOpacity onPress={() => handleOpenFollowModal('followers')} className="items-center p-1 active:opacity-70">
                        <Text className={`text-xl font-bold ${textPrimary} text-center`}>{profile.followerCount || 0}</Text>
                        <Text className={`text-sm ${textMuted}`}>Người theo dõi</Text>
                    </TouchableOpacity>
                    {/* Following */}
                    <TouchableOpacity onPress={() => handleOpenFollowModal('following')} className="items-center p-1 active:opacity-70">
                        <Text className={`text-xl font-bold ${textPrimary} text-center`}>{profile.followingCount || 0}</Text>
                        <Text className={`text-sm ${textMuted}`}>Đang theo dõi</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Tiêu đề Bài đăng */}
                <View className={`pt-4 px-4 border-b border-gray-200 dark:border-gray-700`}>
                    <Text className={`text-lg font-bold ${textPrimary} pb-2`}>
                        Bài đăng
                    </Text>
                </View>
            </View>
        );
    };
    
    // Nếu đang tải ban đầu
    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải profile...</Text>
            </SafeAreaView>
        );
    }
    
    // Màn hình chính
    return (
        <View className="flex-1 bg-white dark:bg-[#0E0C1F]">
            {/* Floating Header */}
            <View className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center p-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2"
                    >
                        <Icon name="arrow-left" size={24} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danh sách bài đăng với Header */}
            <FlatList
                ListHeaderComponent={renderProfileHeader}
                data={posts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 80 }} // Add padding to account for floating header
                renderItem={({ item }) => {
                    const isPostUser = item.userId === currentUserId;
                    return (
                        <PostItem
                            {...item}
                            id={Number(item.id)}
                            // Gán các hàm xử lý
                            onPostUpdate={(type, value) => updatePost(item.id, type, value)}
                            onCommentPress={() => openCommentModal(item.id)}
                            onSharePress={() => Alert.alert('Chia sẻ', 'Tính năng chưa phát triển')}
                            onUserPress={item.User?.id === userId ? undefined : handleUserPress}
                            onLikeCountPress={handleLikeCountPress}
                            onEdit={isPostUser ? () => handleEditPress(item) : undefined}
                            onDelete={isPostUser ? () => handleDeletePress(item.id) : undefined}
                            onHidePost={() => {}}
                            isUserPost={isPostUser}

                            // Truyền images từ fileUrl
                            images={Array.isArray(item.fileUrl) ? item.fileUrl : [item.fileUrl]}

                            // Truyền musicLink
                            musicLink={item.musicLink}
                        />
                    );
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#4F46E5']}
                        tintColor="#4F46E5"
                    />
                }
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

            {/* LIKE MODAL */}
            <LikeModal
                visible={likeModalVisible}
                onClose={handleCloseLikeModal}
                postId={selectedPostIdForLikes || ''}
            />

            {/* EDIT MODAL */}
            {editModalVisible && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center z-20">
                    <View className={`w-11/12 p-4 rounded-lg ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className="text-lg font-bold mb-4 text-black dark:text-white">Chỉnh sửa bài viết</Text>
                        <TextInput
                            value={editContent}
                            onChangeText={setEditContent}
                            multiline
                            className={`border rounded p-2 mb-4 ${colorScheme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}
                            style={{ minHeight: 100 }}
                        />
                        <View className="flex-row justify-end">
                            <TouchableOpacity
                                onPress={handleCloseEditModal}
                                className="px-4 py-2 mr-2"
                            >
                                <Text className="text-gray-500">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveEdit}
                                className="px-4 py-2 bg-blue-500 rounded"
                            >
                                <Text className="text-white">Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
