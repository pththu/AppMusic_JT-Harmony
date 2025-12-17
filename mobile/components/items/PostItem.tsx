import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { FindTrackById } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import React, { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { hidePost, reportPost, togglePostLike, updatePost } from "../../services/socialApi";
import PostOptionsModal from "../modals/PostOptionsModal";
import ReportReasonModal from "../modals/ReportReasonModal";

// Lấy kích thước màn hình để tính toán chiều rộng ảnh
const { width: screenWidth } = Dimensions.get('window');
// Kích thước cố định cho ảnh trong Post (Đảm bảo ảnh không tràn màn hình)
const IMAGE_WIDTH = screenWidth - 32; // Giả định padding ngang tổng cộng là 32 (p-4 * 2)
// Chiều cao tương đối cho ảnh (tỷ lệ 4:3)
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.75;


// --- HÀM TIỆN ÍCH: formatTimeAgo ---
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

const PostItem = ({
    id: postId,
    userId,
    User,
    uploadedAt,
    content,
    images,
    musicLink = null,
    songId = null,
    heartCount,
    commentCount,
    shareCount,
    isLiked: initialIsLiked,
    originalPost = null,
    onPostUpdate,
    onCommentPress,
    onSharePress,
    onUserPress,
    onLikeCountPress,
    onHidePost,
    onRefresh = () => { },
    onEdit,
    onDelete,
    isUserPost,
}) => {
    const colorScheme = useColorScheme();
    const { info, success, error, warning } = useCustomAlert();
    const { navigate } = useNavigate();
    const isGuest = useAuthStore((state) => state.isGuest);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [currentLikeCount, setCurrentLikeCount] = useState(heartCount);

    const originalPostImages = useMemo(() => {
        if (!originalPost) return [];
        if (Array.isArray(originalPost.fileUrl)) {
            return originalPost.fileUrl.filter((url) => typeof url === 'string' && url.length > 0);
        }
        if (typeof originalPost.fileUrl === 'string' && originalPost.fileUrl.length > 0) {
            return [originalPost.fileUrl];
        }
        return [];
    }, [originalPost]);

    // Theo dõi chỉ số ảnh hiện tại cho Indicator
    const [activeIndex, setActiveIndex] = useState(0);

    // State cho modal options
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);

    // Xử lý khi nhấn vào music link để chuyển đến SongScreen
    const handleMusicPress = async () => {
        if (!songId) return;
        
        try {
            // Tìm thông tin bài hát theo ID
            const response = await FindTrackById(songId);
            if (response.success && response.data) {
                // Chuyển đến SongScreen với thông tin bài hát
                navigate('SongScreen', { songId: songId });
            } else {
                error('Lỗi', 'Không tìm thấy thông tin bài hát.');
            }
        } catch (err) {
            console.log('Lỗi khi tìm bài hát:', err);
            error('Lỗi', 'Không thể mở bài hát.');
        }
    };

    // State cho report modal
    const [reportModalVisible, setReportModalVisible] = useState(false);

    // State cho ẩn bài viết tạm thời với undo
    const [isTemporarilyHidden, setIsTemporarilyHidden] = useState(false);
    const [undoTimer, setUndoTimer] = useState<number | null>(null);
    // State cho inline editing
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const likeIconColor = isLiked ? '#ef4444' : (colorScheme === 'dark' ? '#a1a1aa' : '#000000');

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
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
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
        } catch (err) {
            console.log('Lỗi khi thích/bỏ thích bài đăng:', err);
            error("Không thể cập nhật trạng thái thích.");
            setIsLiked(prevIsLiked);
            setCurrentLikeCount(prevLikeCount);
        }
    };

    // Xử lý nút Bình luận 
    const handleComment = () => {
        if (onCommentPress) {
            onCommentPress();
        }
    };

    // Xử lý nút Chia sẻ
    const handleShare = () => {
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
        if (onSharePress) {
            onSharePress(postId);
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
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
        setOptionsModalVisible(false);
        setReportModalVisible(true);
    };

    // Hàm xử lý gửi báo cáo cuối cùng
    const handleFinalReport = async (postId: number, reason: string) => {
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
        try {
            const result = await reportPost(postId.toString(), reason);
            if ('message' in result) {
                success(result.message);
            } else {
                error("Có lỗi xảy ra khi báo cáo.");
            }
        } catch (err) {
            console.log('Lỗi khi gửi báo cáo:', err);
            error("Không thể gửi báo cáo. Vui lòng thử lại.");

        }
    };

    // Hàm xử lý ẩn bài viết với undo
    const handleHide = async () => {
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
        setIsTemporarilyHidden(true);
        // Đặt timer để ẩn vĩnh viễn sau 10 giây
        const timer = setTimeout(async () => {
            try {
                await hidePost(postId.toString());
                if (onHidePost) {
                    onHidePost(postId);
                }
            } catch (error) {
                console.log('Lỗi khi ẩn bài viết:', error);
                error('Lỗi', 'Không thể ẩn bài viết. Vui lòng thử lại.');
            }
            setIsTemporarilyHidden(false);
        }, 10000); // 10 giây
        setUndoTimer(timer);
    };

    // Hàm hoàn tác ẩn bài viết
    const handleUndoHide = () => {
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
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
        if (isGuest) {
            info("Hãy đăng nhập để sử dụng tính năng này.");
            return;
        }
        if (!editContent.trim()) {
            error('Nội dung không được để trống.');
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
                success('Bài viết đã được cập nhật.');

                // Trigger refresh to update UI
                if (onRefresh) {
                    onRefresh();
                }
            }
        } catch (error) {
            console.log('Lỗi khi cập nhật bài viết:', error);
            error('Không thể cập nhật bài viết. Vui lòng thử lại.');

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
                        className="w-10 h-10 rounded-full border-2 border-emerald-400"
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
                <>
                    {content ? (
                        <Text className="text-base text-black dark:text-gray-300 mb-2 leading-relaxed">{content}</Text>
                    ) : null}

                    {originalPost ? (
                        <View className="mb-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-[#111827]">
                            <View className="flex-row items-center mb-1">
                                <Image
                                    source={{
                                        uri:
                                            originalPost.User?.avatarUrl ||
                                            'https://via.placeholder.com/150',
                                    }}
                                    className="w-7 h-7 rounded-full border border-indigo-400"
                                />
                                <View className="ml-2">
                                    <Text className="text-xs font-semibold text-black dark:text-white">
                                        {originalPost.User?.fullName || 'Người dùng'}
                                    </Text>
                                </View>
                            </View>
                            {originalPost.content ? (
                                <Text
                                    className="text-sm text-gray-800 dark:text-gray-200"
                                    numberOfLines={3}
                                >
                                    {originalPost.content}
                                </Text>
                            ) : null}
                            {originalPostImages.length > 0 ? (
                                <Image
                                    source={{ uri: originalPostImages[0] }}
                                    className="mt-2 w-full rounded-lg"
                                    style={{ height: 140, resizeMode: 'cover' }}
                                />
                            ) : null}
                        </View>
                    ) : null}
                </>
            )}

            {/*  PHẦN GALLERY MEDIA VÀ INDICATOR */}
            {images && images.length > 0 ? (
                <View className="mb-3">
                    <ScrollView
                        horizontal
                        pagingEnabled //  Cho phép cuộn từng trang
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
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
                                    className={`w-2 h-2 rounded-full mx-1 ${index === activeIndex
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
            {musicLink ? (
                <TouchableOpacity
                    onPress={handleMusicPress}
                    className="flex-row items-center bg-indigo-500/10 p-3 rounded-lg mb-3 border border-indigo-200 dark:border-indigo-900"
                    activeOpacity={0.8}
                >
                    <Icon name="music" size={18} color="#6366F1" />
                    <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium flex-1" numberOfLines={1}>
                        {musicLink}
                    </Text>
                    <Icon name="chevron-right" size={16} color="#6366F1" />
                </TouchableOpacity>
            ) : null}

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

            {/* Interaction Buttons */}
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