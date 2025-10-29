import React, { useState, useEffect } from "react";
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Share
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { togglePostLike, reportPost, updatePost } from "../../services/socialApi";
import PostOptionsModal from "../modals/PostOptionsModal";
import ReportReasonModal from "../modals/ReportReasonModal";

// Lấy kích thước màn hình để tính toán chiều rộng ảnh
const { width: screenWidth } = Dimensions.get('window');
// Kích thước cố định cho ảnh trong Post (Đảm bảo ảnh không tràn màn hình)
const IMAGE_WIDTH = screenWidth - 32; // Giả định padding ngang tổng cộng là 32 (p-4 * 2)
// Chiều cao tương đối cho ảnh (ví dụ: tỷ lệ 4:3)
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75; 


// --- HÀM TIỆN ÍCH: formatTimeAgo (Được giữ lại) ---
const formatTimeAgo = (dateString: string): string => {
    const commentDate = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    const intervals = [
        { label: 'năm', seconds: 31536000 },
        { label: 'tháng', seconds: 2592000 },
        { label: 'ngày', seconds: 86400 },
        { label: 'giờ', seconds: 3600 },
        { label: 'phút', seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label} trước`;
        }
    }
    return 'vừa xong';
};

// --- ĐỊNH NGHĨA INTERFACE CHO POSTITEM PROPS  ---
interface PostItemProps {
    id: number;
    userId: number;
    User: { username: string; avatarUrl: string; fullName: string };
    uploadedAt: string;
    content: string;
    images: string[];
    musicLink: string | null;
    heartCount: number;
    commentCount: number;
    shareCount: number;
    isLiked: boolean;

    // Callbacks
    onPostUpdate: (type: 'heartCount' | 'isLiked' | 'share' | 'content', value: any) => void;
    onCommentPress: () => void;
    onSharePress: () => void;
    onUserPress: (userId: number) => void;
    onLikeCountPress: (postId: number) => void;
    onHidePost: (postId: number) => void;
    onRefresh?: () => void;

    // Additional options for user's own posts
    onEdit?: () => void;
    onDelete?: () => void;
    isUserPost?: boolean;
}

// --- COMPONENT POSTITEM  ---
const PostItem: React.FC<PostItemProps> = ({ // React.FC<PostItemProps> để gán type
    id: postId,
    userId,
    User,
    uploadedAt,
    content,
    images,
    musicLink,
    heartCount,
    commentCount,
    shareCount,
    isLiked: initialIsLiked,
    onPostUpdate,
    onCommentPress,
    onSharePress,
    onUserPress,
    onLikeCountPress,
    onHidePost,
    onRefresh,
    onEdit,
    onDelete,
    isUserPost,
}) => {
    const colorScheme = useColorScheme();
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [currentLikeCount, setCurrentLikeCount] = useState(heartCount);

    // Theo dõi chỉ số ảnh hiện tại cho Indicator
    const [activeIndex, setActiveIndex] = useState(0);

    // State cho modal options
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);

    // State cho report modal
    const [reportModalVisible, setReportModalVisible] = useState(false);

    // State cho ẩn bài viết tạm thời với undo
    const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);
    const [undoTimer, setUndoTimer] = useState<number | null>(null);

    // State cho inline editing
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    // Đồng bộ editContent khi content prop thay đổi
    useEffect(() => {
        setEditContent(content);
    }, [content]);

    // Đồng bộ state nội bộ khi props thay đổi
    useEffect(() => {
        setIsLiked(initialIsLiked);
    }, [initialIsLiked]);

    useEffect(() => {
        setCurrentLikeCount(heartCount);
    }, [heartCount]);

    // Xử lý nút Tim
    const handleLike = async () => {
        if (!postId) return;

        const prevIsLiked = isLiked;
        const prevLikeCount = currentLikeCount;
        const newIsLikedOptimistic = !isLiked;
        const likeChangeOptimistic = newIsLikedOptimistic ? 1 : -1;

        setIsLiked(newIsLikedOptimistic);
        setCurrentLikeCount((prevCount) => prevCount + likeChangeOptimistic);
        
        try {
            const result = await togglePostLike(postId.toString());
            if ('isLiked' in result && 'heartCount' in result) {
                setIsLiked(result.isLiked);
                setCurrentLikeCount(result.heartCount);

                if (onPostUpdate) {
                    onPostUpdate("heartCount", result.heartCount);
                }
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Lỗi khi thích/bỏ thích bài đăng:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thích.');
            setIsLiked(prevIsLiked);
            setCurrentLikeCount(prevLikeCount);
        }
    };

    const likeIconColor = isLiked 
        ? '#ef4444'
        : (colorScheme === 'dark' ? '#a1a1aa' : '#000000');

    // Xử lý nút Bình luận 
    const handleComment = () => {
        if (onCommentPress) {
            onCommentPress();
        }
    };

    // Xử lý nút Chia sẻ
    const handleShare = async () => {
        try {
            let shareMessage = `${User?.fullName}: `;

            if (content) {
                shareMessage += `${content}\n\n`;
            } else {
                shareMessage += `Bài đăng của ${User?.fullName}\n\n`;
            }

            // Thêm URL hình ảnh nếu có
            if (images && images.length > 0) {
                shareMessage += `Hình ảnh: ${images.join(', ')}\n\n`;
            }

            // Thêm liên kết đến bài viết
            const postLink = `app://post/${postId}`; // Deep link giả định
            shareMessage += `Xem bài viết: ${postLink}`;

            const result = await Share.share({
                message: shareMessage,
                // url: postLink,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Shared with activity type of result.activityType
                } else {
                    // Shared
                }
                // Update share count after successful share
                if (onPostUpdate) {
                    onPostUpdate("share", 1);
                }
            } else if (result.action === Share.dismissedAction) {
                // Dismissed
            }
        } catch (error) {
            console.error('Lỗi khi chia sẻ:', error);
            Alert.alert('Lỗi', 'Không thể chia sẻ bài viết.');
        }
    };

    // HÀM XỬ LÝ SỰ KIỆN CUỘN CHO INDICATOR
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        // Tính toán index dựa trên vị trí cuộn (chia cho kích thước ảnh)
        const index = Math.round(contentOffsetX / IMAGE_WIDTH);
        setActiveIndex(index);
    };

    // Hàm xử lý báo cáo
    const handleReport = () => {
        setOptionsModalVisible(false);
        setReportModalVisible(true);
    };

    // Hàm xử lý gửi báo cáo cuối cùng
    const handleFinalReport = async (postId: number, reason: string) => {
        try {
            const result = await reportPost(postId.toString(), reason);
            if ('message' in result) {
                Alert.alert("Thành công", result.message);
            } else {
                Alert.alert("Lỗi", "Có lỗi xảy ra khi báo cáo.");
            }
        } catch (error) {
            console.error('Lỗi khi gửi báo cáo:', error);
            Alert.alert("Lỗi", "Không thể gửi báo cáo. Vui lòng thử lại.");
        }
    };

    // Hàm xử lý ẩn bài viết với undo
    const handleHide = () => {
        setIsTemporarilyHidden(true);
        // Đặt timer để ẩn vĩnh viễn sau 10 giây
        const timer = setTimeout(() => {
            if (onHidePost) {
                onHidePost(postId);
            }
            setIsTemporarilyHidden(false);
        }, 10000); // 10 giây
        setUndoTimer(timer);
    };

    // Hàm hoàn tác ẩn bài viết
    const handleUndoHide = () => {
        if (undoTimer) {
            clearTimeout(undoTimer);
            setUndoTimer(null);
        }
        setIsTemporarilyHidden(false);
    };

    // Hàm xử lý inline edit
    const handleInlineEdit = () => {
        setIsEditing(true);
        setOptionsModalVisible(false);
    };

    // Hàm lưu chỉnh sửa
    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            Alert.alert('Lỗi', 'Nội dung không được để trống.');
            return;
        }

        try {
            const result = await updatePost(postId.toString(), editContent);
            if ('status' in result && result.status === 'error') {
                throw new Error('Update failed');
            } else {
                // Cập nhật local state
                if (onPostUpdate) {
                    onPostUpdate('content', editContent);
                }
                setIsEditing(false);
                Alert.alert('Thành công', 'Bài viết đã được cập nhật.');
                // Trigger refresh to update UI
                if (onRefresh) {
                    onRefresh();
                }
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật bài viết. Vui lòng thử lại.');
        }
    };

    // Hàm hủy chỉnh sửa
    const handleCancelEdit = () => {
        setEditContent(content);
        setIsEditing(false);
    };

    const displayTime = formatTimeAgo(uploadedAt);

    // Nếu bài viết đang bị ẩn tạm thời, hiển thị banner undo
    if (isTemporarilyHidden) {
        return (
            <View className="bg-gray-100 dark:bg-gray-800 p-4 mb-3 rounded-xl border border-gray-300 dark:border-gray-600">
                <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600 dark:text-gray-300">
                        Bài viết đã được ẩn
                    </Text>
                    <TouchableOpacity
                        onPress={handleUndoHide}
                        className="bg-indigo-500 px-3 py-1 rounded-lg"
                    >
                        <Text className="text-white text-sm font-medium">Hoàn tác</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- PHẦN RENDER LOGIC ---
    return (
        <View className="bg-white dark:bg-[#171431] p-4 mb-3 rounded-xl shadow-md shadow-gray-400 dark:shadow-black">

            {/* Header  */}
            <View className="flex-row items-center mb-3">
                <TouchableOpacity
                    onPress={() => onUserPress(userId)}
                    className="flex-row items-center"
                >
                    <Image
                        source={{ uri: User?.avatarUrl || 'https://via.placeholder.com/150' }}
                        className="w-10 h-10 rounded-full border-2 border-indigo-400"
                    />
                </TouchableOpacity>

                <View className="ml-3 flex-col">
                    <Text className="font-extrabold text-base text-black dark:text-white">{User?.fullName}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">{displayTime}</Text>
                </View>

                <TouchableOpacity
                    className="ml-auto p-1"
                    onPress={() => setOptionsModalVisible(true)}
                >
                    <Icon name="more-horizontal" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                </TouchableOpacity>
            </View>

            {/* Content Text or Edit Input */}
            {isEditing ? (
                <View className="mb-3">
                    <TextInput
                        value={editContent}
                        onChangeText={setEditContent}
                        multiline
                        className="text-base text-black dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg leading-relaxed"
                        placeholder="Nhập nội dung bài viết..."
                        placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                    />
                    <View className="flex-row justify-end mt-2">
                        <TouchableOpacity
                            onPress={handleCancelEdit}
                            className="bg-gray-500 px-4 py-2 rounded-lg mr-2"
                        >
                            <Text className="text-white text-sm font-medium">Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSaveEdit}
                            className="bg-indigo-500 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white text-sm font-medium">Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                content ? (
                    <Text className="text-base text-black dark:text-gray-300 mb-3 leading-relaxed">{content}</Text>
                ) : null
            )}

            {/*  PHẦN GALLERY MEDIA VÀ INDICATOR */}
            {images && images.length > 0 ? (
                <View className="mb-3">
                    <ScrollView
                        horizontal
                        pagingEnabled //  Cho phép cuộn từng trang
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll} //  Bắt sự kiện cuộn
                        scrollEventThrottle={16}
                        className="rounded-xl overflow-hidden"
                        style={{ height: IMAGE_HEIGHT }} 
                    >
                        {images.map((imgUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: imgUrl }}
                                style={{
                                    width: IMAGE_WIDTH,
                                    height: '100%',
                                    resizeMode: 'cover',
                                }}
                            />
                        ))}
                    </ScrollView>

                    {/* Indicator (Chấm tròn) chỉ hiển thị khi có nhiều hơn 1 ảnh */}
                    {images.length > 1 && (
                        <View className="flex-row justify-center mt-2">
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    className={`w-2 h-2 rounded-full mx-1 ${
                                        index === activeIndex 
                                            ? 'bg-indigo-500' 
                                            : colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </View>
                    )}
                </View>
            ) : null}

            {/* Music Link (Nâng cấp) */}
            {/* {musicLink ? (
                <TouchableOpacity
                    onPress={() => Linking.openURL(musicLink)}
                    className="flex-row items-center bg-indigo-500/10 p-3 rounded-lg mb-3 border border-indigo-200 dark:border-indigo-900"
                >
                    <Icon name="music" size={18} color="#6366F1" />
                    <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium flex-1" numberOfLines={1}>
                        {musicLink}
                    </Text>
                </TouchableOpacity>
            ) : null} */}


            {/* Interaction Stats Bar */}
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                {/* KHỐI TRÁI: Thích  */}
                <View className="flex-row items-center">
                    {/* Thích */}
                    <TouchableOpacity
                        onPress={() => onLikeCountPress(postId)}
                        disabled={currentLikeCount === 0} // Chỉ cho phép nhấn nếu có lượt thích
                        className="p-1 -ml-1"
                    >
                        <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold"> 
                            {currentLikeCount} Thích 
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* KHỐI PHẢI: Chia sẻ */}
                <View className="flex-row items-center ">
                    {/* Bình luận */}
                    <Text className="text-xs text-gray-500 dark:text-gray-400 px-2">
                        {commentCount} Bình luận
                    </Text>
                    {/* Chia sẻ */}
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {shareCount} Chia sẻ
                    </Text>
                </View>
               
            </View>


            {/* Interaction Buttons (Lớn hơn, rõ ràng hơn) */}
            <View className="flex-row justify-around">
                {/* NÚT LIKE (TIM) */}
                <TouchableOpacity
                    onPress={handleLike}
                    className="flex-row items-center p-2 rounded-full"
                >
                    <Icon
                        name={isLiked ? "heart" : "heart"}
                        size={22}
                        color={likeIconColor}
                    />
                    <Text
                        className={`ml-2 text-sm ${isLiked ? "text-red-400 font-bold" : (colorScheme === "dark" ? "text-gray-400" : "text-black")}`}
                    >
                        Thích
                    </Text>
                </TouchableOpacity>

                {/* NÚT BÌNH LUẬN */}
                <TouchableOpacity
                    onPress={handleComment}
                    className="flex-row items-center p-2 rounded-full"
                >
                    <Icon name="message-circle" size={22} color={colorScheme === "dark" ? "#6B7280" : "#4B5563"} />
                    <Text className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Bình luận</Text>
                </TouchableOpacity>

                {/* NÚT CHIA SẺ */}
                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-row items-center p-2 rounded-full"
                >
                    <Icon name="share-2" size={22} color={colorScheme === "dark" ? "#6B7280" : "#4B5563"} />
                    <Text className={`ml-2 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Chia sẻ</Text>
                </TouchableOpacity>
            </View>

            {/* Post Options Modal */}
            <PostOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onReport={handleReport}
                onHide={handleHide}
                onEdit={onEdit || handleInlineEdit}
                onDelete={onDelete}
                isUserPost={isUserPost}
            />

            {/* Report Reason Modal */}
            <ReportReasonModal
                visible={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
                postId={postId}
                onFinalReport={handleFinalReport}
            />
        </View>
    );
};

export default PostItem;
