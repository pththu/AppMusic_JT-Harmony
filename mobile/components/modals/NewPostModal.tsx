import NewPostCreator from "@/components/items/NewPostItem";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

const NewPostModal = ({
  newPostModalVisible,
  setNewPostModalVisible,
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
  return (
    <Modal
      visible={newPostModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setNewPostModalVisible(false)}
    >
      {selectedMediaAssets.length > 0 ? (
        <TouchableOpacity
          className="flex-1 justify-end"
          activeOpacity={1}
          onPress={() => setNewPostModalVisible(false)}
        >
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl">
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 mt-4" />
            <View className="px-4 pb-4">
              <Text className="text-lg font-bold text-black dark:text-white mb-4 text-center">
                Đăng bài viết mới
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: '85%' }}

              >
                <NewPostCreator
                  user={user}
                  newPostText={newPostText}
                  setNewPostText={setNewPostText}
                  selectedMediaAssets={selectedMediaAssets}
                  setSelectedMediaAssets={setSelectedMediaAssets}
                  selectedSongId={selectedSongId}
                  setSelectedSongId={setSelectedSongId}
                  isUploading={isUploading}
                  handleSelectMedia={handleSelectMedia}
                  addPost={addPost}
                />
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            className="flex-1 justify-end"
            activeOpacity={1}
            onPress={() => setNewPostModalVisible(false)}
          >
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 mt-4" />
              <View className="px-4 pb-4">
                <Text className="text-lg font-bold text-black dark:text-white mb-4 text-center">
                  Đăng bài viết mới
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: '75%' }}
                >
                  <NewPostCreator
                    user={user}
                    newPostText={newPostText}
                    setNewPostText={setNewPostText}
                    selectedMediaAssets={selectedMediaAssets}
                    setSelectedMediaAssets={setSelectedMediaAssets}
                    selectedSongId={selectedSongId}
                    setSelectedSongId={setSelectedSongId}
                    isUploading={isUploading}
                    handleSelectMedia={handleSelectMedia}
                    addPost={addPost}
                  />
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </Modal>
  )
};

export default NewPostModal;