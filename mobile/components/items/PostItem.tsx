import React, { useState, useEffect } from "react";
import { Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { togglePostLike } from "../../services/socialApi";

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

// --- ĐỊNH NGHĨA INTERFACE CHO POSTITEM PROPS ---
interface PostItemProps {
    id: number; // Tương ứng với postId
    userId: number;
    User: { username: string; avatarUrl: string; fullName: string }; // Thay thế cho avatarUrl, username
    uploadedAt: string; // Tương ứng với time
    content: string; // ✅ ĐỔI TỪ contentText sang content ĐỂ KHỚP VỚI PROFILESCREEN
    images: string[]; // Tương ứng với images (mảng URL ảnh)
    musicLink: string | null; // Tương ứng với musicLink
    heartCount: number; // Tương ứng với likeCount
    commentCount: number;
    shareCount: number;
    isLiked: boolean;

    // Callbacks
    onPostUpdate: (type: 'heartCount' | 'isLiked' | 'share', value: any) => void;
    onCommentPress: () => void;
    onSharePress: () => void;
    onUserPress: (userId: number) => void;
}

// --- COMPONENT POSTITEM (ĐÃ CẬP NHẬT LOGIC VÀ UI THEO YÊU CẦU MỚI) ---
const PostItem = ({
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
}) => {
    const colorScheme = useColorScheme();
    
    // STATE: Theo dõi trạng thái đã thích (liked)
    const [isLiked, setIsLiked] = useState(initialIsLiked);

    // STATE: Dùng state nội bộ để hiển thị số like (được đồng bộ với prop)
    const [currentLikeCount, setCurrentLikeCount] = useState(heartCount);

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

        // 1. Tối ưu: Cập nhật UI tạm thời (Optimistic Update)
        const prevIsLiked = isLiked;
        const prevLikeCount = currentLikeCount;
        const newIsLikedOptimistic = !isLiked;
        const likeChangeOptimistic = newIsLikedOptimistic ? 1 : -1;

        // Cập nhật tạm thời
        setIsLiked(newIsLikedOptimistic);
        setCurrentLikeCount((prevCount) => prevCount + likeChangeOptimistic);
        
        try {
            // 2. GỌI API & NHẬN KẾT QUẢ THỰC TẾ
            // togglePostLike sẽ trả về { isLiked: boolean, heartCount: number }
            const result = await togglePostLike(postId); 

            // 3. CẬP NHẬT TRẠNG THÁI CHÍNH THỨC DỰA TRÊN SERVER
            setIsLiked(result.isLiked); // ✅ Dùng trạng thái isLiked từ Server
            setCurrentLikeCount(result.heartCount); // ✅ Dùng số like từ Server

            // 4. Cập nhật cho màn hình cha (SocialScreen)
            if (onPostUpdate) {
                // Truyền heartCount chính xác từ Server
                onPostUpdate("heartCount", result.heartCount);
            }
        } catch (error) {
            console.error('Lỗi khi thích/bỏ thích bài đăng:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thích.');
            // 5. QUAY LẠI TRẠNG THÁI CŨ NẾU THẤT BẠI (Revert Optimistic Update)
            setIsLiked(prevIsLiked); 
            setCurrentLikeCount(prevLikeCount);
        }
    };

    const likeIconColor = isLiked 
        ? '#ef4444' // Màu đỏ khi đã thích (isLiked === true)
        : (colorScheme === 'dark' ? '#a1a1aa' : '#000000');

    // Xử lý nút Bình luận
    const handleComment = () => {
        if (onCommentPress) {
            onCommentPress();
        }
    };

    // Xử lý nút Chia sẻ
    const handleShare = () => {
        if (onPostUpdate) {
            // Giả định onPostUpdate có thể nhận 'share'
            onPostUpdate("share", 1);
        }
        if (onSharePress) {
            onSharePress();
        } else {
            Alert.alert(
                "Chia sẻ",
                `Mở Share Sheet để chia sẻ bài đăng của ${User?.username}.`
            );
        }
    };
    
    // Sử dụng hàm tiện ích formatTimeAgo
    const displayTime = formatTimeAgo(uploadedAt);

    // --- PHẦN RENDER LOGIC CỦA BẠN ---
    return (
        <View className="bg-white dark:bg-[#171431] p-5 mb-3 rounded-xl shadow-lg shadow-black/50">
            {/* Header */}
            <View className="flex-row items-center mb-1.5">
                <TouchableOpacity 
                    // ✅ GỌI onUserPress KHI NHẤN VÀO KHU VỰC AVATAR VÀ USERNAME
                    onPress={() => onUserPress(userId)} 
                    className="flex-row items-center"
                >
                    <Image 
                        source={{ uri: User?.avatarUrl || 'https://via.placeholder.com/150' }} 
                        className="w-9 h-9 rounded-full" 
                    />
                </TouchableOpacity>
            
                <View className="ml-2 flex-col">
                    <View className="flex-row items-center">
                        <Text className="font-bold text-sm text-black dark:text-white">{User?.fullName}</Text>
                    </View>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">{displayTime}</Text>
                </View>
            </View>

            {/* Content Text */}
            {content ? (
                <Text className="text-sm text-black dark:text-gray-300 mb-2">{content}</Text>
            ) : null}

            {/* Images */}
            {images && images.length > 0 ? (
                // 1. Dùng ScrollView để cuộn ngang nếu có nhiều ảnh
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 mt-3">
                    {/* 2. Dùng hàm map() để lặp qua TẤT CẢ các URL trong mảng 'images' */}
                    {images.map((imgUrl, index) => (
                        <Image
                            key={index}
                            source={{ uri: imgUrl }}
                            style={{ 
                                width: 300,
                                height: 300, 
                                resizeMode: 'cover', 
                                borderRadius: 10, 
                                marginRight: 10
                            }}
                        />
                    ))}
                </ScrollView>
            ) : null}

            {/* Music Link */}
            {musicLink ? (
                <TouchableOpacity
                    onPress={() => Linking.openURL(musicLink)}
                    className="bg-blue-900/50 p-2 rounded-lg mb-2"
                >
                    <Text className="text-blue-400 underline">Nghe nhạc tại đây</Text>
                </TouchableOpacity>
            ) : null}

            {/* Interaction Buttons */}
            <View className={`flex-row justify-between pt-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                {/* NÚT LIKE (TIM) */}
                <TouchableOpacity
                    onPress={handleLike}
                    className="flex-row items-center space-x-1"
                >
                    <Icon
                        name={isLiked ? "heart" : "heart"} // Cả hai icon đều là 'heart', chỉ khác màu
                        size={20}
                        color={likeIconColor} // Màu đỏ khi liked, xám khi chưa liked
                    />
                    <Text
                        className={`ml-1 ${isLiked ? "text-red-400 font-bold" : (colorScheme === "dark" ? "text-gray-400" : "text-black")}`}
                    >
                        {currentLikeCount}
                    </Text>
                </TouchableOpacity>

                {/* NÚT BÌNH LUẬN */}
                <TouchableOpacity
                    onPress={handleComment}
                    className="flex-row items-center space-x-1"
                >
                    <Icon name="message-circle" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                    <Text className={`ml-1 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>{commentCount}</Text>
                </TouchableOpacity>

                {/* NÚT CHIA SẺ */}
                <TouchableOpacity
                    onPress={handleShare}
                    className="flex-row items-center space-x-1"
                >
                    <Icon name="share-2" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                    <Text className={`ml-1 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>{shareCount}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PostItem;