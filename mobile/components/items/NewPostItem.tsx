import React, { use, forwardRef } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigate } from "@/hooks/useNavigate";
import useAuthStore from '@/store/authStore';
import { useCustomAlert } from "@/hooks/useCustomAlert";

interface NewPostItemProps {
    user: { id: number; avatarUrl?: string };
    newPostText: string;
    setNewPostText: (text: string) => void;
    selectedMediaAssets: any[];
    setSelectedMediaAssets: (assets: any[]) => void;
    selectedSongId: number | null;
    setSelectedSongId: (id: number | null) => void;
    isUploading: boolean;
    handleSelectMedia: () => Promise<void>;
    addPost: () => Promise<void>;
}

export interface NewPostItemRef {
    focus: () => void;
}

const NewPostItem = forwardRef<NewPostItemRef, NewPostItemProps>(({
    user,
    newPostText,
    setNewPostText,
    selectedMediaAssets,
    setSelectedMediaAssets,
    selectedSongId,
    setSelectedSongId,
    isUploading,
    handleSelectMedia,
    addPost,
}, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isGuest = useAuthStore((state) => state.isGuest);
    const { navigate } = useNavigate();
    const { error, info, warning } = useCustomAlert();
    const avatarDefault = 'https://res.cloudinary.com/chaamz03/image/upload/v1762574889/kltn/user_hnoh3o.png';

    const textInputRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
        focus: () => {
            textInputRef.current?.focus();
        }
    }));

    const canPost = (newPostText.trim() || selectedMediaAssets.length > 0) && !isUploading;

    const handleAvatarPress = () => {
        navigate("ProfileSocialScreen", { userId: user.id });
    };

    return (
        // THẺ ĐĂNG BÀI MỚI
        <View
            className={`mb-4 p-3 rounded-xl shadow-lg 
            ${isDark ? "bg-[#1A1A2E] border border-gray-700" : "bg-white border border-gray-200 shadow-gray-300"}`}
            style={{ elevation: 5 }}
        >
            <View className="flex-row items-start mb-2">
                {/* Ảnh đại diện User */}
                <TouchableOpacity onPress={handleAvatarPress}>
                    <Image
                        source={{ uri: user?.avatarUrl || avatarDefault}}
                        className="w-12 h-12 rounded-full mr-3 border-2 border-emerald-500"
                    />
                </TouchableOpacity>


                <View className="flex-1">
                    {/* INPUT NỘI DUNG */}
                    <TextInput
                        ref={textInputRef}
                        placeholder="Bạn đang nghĩ gì?"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        value={newPostText}
                        onChangeText={setNewPostText}
                        className={`text-base p-2 rounded-lg 
                            ${isDark
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100 text-black"
                            }`}
                        multiline
                        style={{ minHeight: 60, textAlignVertical: 'top' }}
                    />
                </View>
            </View>

            {/* HIỂN THỊ MEDIA ĐÃ CHỌN */}
            {selectedMediaAssets.length > 0 && (
                <View className="mt-3 border-t pt-3 border-dashed border-gray-300 dark:border-gray-700">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                        {selectedMediaAssets.map((asset, index) => (
                            <View key={index} className="mr-3 relative">
                                <Image
                                    source={{ uri: asset.uri }}
                                    style={{ width: 110, height: 110, borderRadius: 12, resizeMode: 'cover' }} // Kích thước lớn hơn, bo tròn nhiều hơn
                                />
                                {/* Nút Xóa (Hủy chọn từng ảnh) */}
                                <TouchableOpacity
                                    onPress={() => setSelectedMediaAssets(selectedMediaAssets.filter((_, i) => i !== index))}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 opacity-90"
                                >
                                    <Icon name="x" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Đã chọn: {selectedMediaAssets.length} file (ảnh/video).
                    </Text>
                </View>
            )}

            {/* HIỂN THỊ SONG ID ĐÃ CHỌN */}
            {selectedSongId ? (
                <View className="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Icon name="music" size={18} color={isDark ? "#A5B4FC" : "#4F46E5"} />
                        <Text className="ml-2 text-emerald-700 dark:text-emerald-300 flex-1 font-semibold" numberOfLines={1}>
                            Đính kèm Bài hát ID: {selectedSongId}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedSongId(null)} className="ml-2 p-1">
                        <Icon name="x-circle" size={18} color={isDark ? "#F87171" : "#EF4444"} />
                    </TouchableOpacity>
                </View>
            ) : null}


            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700">
                {/* NÚT CHỌN MEDIA & SONG */}
                <View className="flex-row items-center">
                    {/* NÚT CHỌN MEDIA */}
                    <TouchableOpacity
                        onPress={handleSelectMedia}
                        disabled={isUploading}
                        className="flex-row items-center p-2 rounded-full mr-3"
                        style={{ backgroundColor: isUploading ? '#047857' : '#10b981' }}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#d1fae5" />
                        ) : (
                            <Icon name="image" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>


                {/* NÚT ĐĂNG BÀI */}
                <TouchableOpacity
                    onPress={addPost}
                    disabled={!canPost || isGuest}
                    className={`ml-auto px-6 py-2 rounded-full shadow-md 
                        ${isGuest ? "bg-gray-400" : (canPost ? "bg-green-600 shadow-green-700" : "bg-gray-400")}`}
                >
                    <Text className="font-bold text-white text-base">Đăng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

NewPostItem.displayName = 'NewPostItem';

export default NewPostItem;