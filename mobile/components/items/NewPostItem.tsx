import React from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface NewPostItemProps {
    user: { avatarUrl?: string };
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

const NewPostItem: React.FC<NewPostItemProps> = ({
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
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const canPost = (newPostText.trim() || selectedMediaAssets.length > 0) && !isUploading;

    return (
        // THẺ ĐĂNG BÀI MỚI
        <View
            className={`mb-4 p-3 rounded-xl shadow-lg 
            ${isDark ? "bg-[#1A1A2E] border border-gray-700" : "bg-white border border-gray-200 shadow-gray-300"}`}
            style={{ elevation: 5 }}
        >
            <View className="flex-row items-start mb-2">
                {/* Ảnh đại diện User */}
                <Image
                    source={{ uri: user?.avatarUrl }}
                    className="w-12 h-12 rounded-full mr-3 border-2 border-indigo-500" 
                />

                <View className="flex-1">
                    {/* 1. INPUT NỘI DUNG */}
                    <TextInput
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

            {/* 2. HIỂN THỊ MEDIA ĐÃ CHỌN */}
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

            {/* 3. HIỂN THỊ SONG ID ĐÃ CHỌN */}
            {selectedSongId ? (
                <View className="mt-3 p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Icon name="music" size={18} color={isDark ? "#A5B4FC" : "#4F46E5"} />
                        <Text className="ml-2 text-indigo-700 dark:text-indigo-300 flex-1 font-semibold" numberOfLines={1}>
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
                        style={{ backgroundColor: isUploading ? '#374151' : '#4F46E5' }} 
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Icon name="image" size={20} color="white" />
                        )}
                    </TouchableOpacity>

                    {/* NÚT CHỌN BÀI HÁT */}
                    {/* <TouchableOpacity
                        onPress={() => Alert.alert("Chọn Bài Hát", "Mở Modal chọn bài hát...")}
                        className="flex-row items-center p-2 rounded-full border border-indigo-500"
                    >
                        <Icon name="headphones" size={20} color="#4F46E5" />
                    </TouchableOpacity> */}
                </View>


                {/* 4. NÚT ĐĂNG BÀI (CALLS addPost) */}
                <TouchableOpacity
                    onPress={addPost}
                    disabled={!canPost}
                    className={`ml-auto px-6 py-2 rounded-full shadow-md 
                        ${canPost ? "bg-green-600 shadow-green-700" : "bg-gray-400"
                        }`}
                >
                    <Text className="font-bold text-white text-base">Đăng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default NewPostItem;