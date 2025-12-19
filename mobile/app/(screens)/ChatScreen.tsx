import MessageItem from "@/components/items/MessageItem";
import ChatOptionsModal from "@/components/modals/ChatOptionsModal";
import MessageOptionsModal from "@/components/modals/MessageOptionsModal";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { useSocket } from "@/hooks/useSocket";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { deleteConversation, deleteMessage, fetchMessages, hideMessage } from "@/services/chatApi";
import {
  sendMessageApi
} from "@/services/chatServices";
import * as SocketService from "@/services/UnifiedSocketService";
import useAuthStore from "@/store/authStore";
import useMessageStore from "@/store/messageStore";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

const ChatScreen = () => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const user = useAuthStore((state) => state.user);
  const { receiver, currentConversation } = useMessageStore();

  const { navigate, goBack } = useNavigate();
  const { success, error, info, confirm } = useCustomAlert();

  // State
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 20;

  // Media upload
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMediaAssets, setSelectedMediaAssets] = useState([]);

  // Modals
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChatOptionsVisible, setIsChatOptionsVisible] = useState(false);

  // Reply
  const [replyingTo, setReplyingTo] = useState(null);

  const flatListRef = useRef<FlatList>(null);
  const socket = useSocket(); // Sử dụng useSocket - Hook toàn năng cho mọi socket operations

  // State cho typing users (riêng cho conversation này)
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  // Typing indicator
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const TYPING_TIMEOUT = 3000;
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Reset state khi conversationId thay đổi
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    setInputMessage("");
    setIsLoadingMore(false);
    setRefreshing(false);
    setTypingUsers([]);
  }, [currentConversation?.id]);

  // ✅ Setup Socket Event Listeners
  useEffect(() => {
    if (!socket.isConnected) return;

    // Join conversation
    SocketService.joinConversation(currentConversation?.id)
      .then(() => { console.log(`✅ Joined conversation ${currentConversation?.id}`); })
      .catch((err) => { console.error(`❌ Failed to join conversation ${currentConversation?.id}:`, err); });

    const handleNewMessage = (message) => {
      // Chỉ xử lý tin nhắn thuộc hội thoại đang mở
      if (message.conversationId === currentConversation.id) {
        setMessages((prevMessages) => {
          // CHỐNG TRÙNG LẶP (Deduplication)
          const isDuplicate = prevMessages.some((m) => m.id === message.id);
          if (isDuplicate) return prevMessages;
          if (message.senderId === user.id) return prevMessages; // Bỏ qua nếu là tin nhắn của chính mình (đã thêm tạm thời)

          const newMessage = {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            fileUrl: message.fileUrl || null,
            type: message.type,
            createdAt: message.createdAt,
            replyToId: message.replyToId || null,
            replyTo: message.replyTo || null,
            Sender: {
              id: receiver,
              username: receiver?.username || "Bạn bè",
              avatarUrl: receiver?.avatarUrl || "",
              fullName: receiver?.fullName || "Bạn bè",
            },
          }

          return [...prevMessages, newMessage];
        });
      }
    };

    // Listen to new messages
    const unsubNewMessage = SocketService.on('chat:new_message', handleNewMessage);

    // Listen to message deletion
    const unsubDeleteMessage = SocketService.on('chat:message_deleted', (data: { messageId: number; conversationId: number }) => {
      if (data.conversationId === currentConversation?.id) {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    });

    // Listen to typing
    const unsubTyping = SocketService.on('chat:user_typing', (data: {
      conversationId: number;
      userId: number;
      isTyping: boolean;
    }) => {
      if (data.conversationId !== currentConversation?.id || data.userId === currentUserId) return;

      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.userId)) {
          return [...prev, data.userId];
        } else if (!data.isTyping) {
          return prev.filter((id) => id !== data.userId);
        }
        return prev;
      });
    });

    // Cleanup
    return () => {
      unsubNewMessage();
      unsubDeleteMessage();
      unsubTyping();
      SocketService.leaveConversation(currentConversation?.id);
    };
  }, [currentConversation?.id, currentUserId]);

  // Load messages
  const loadMessages = useCallback(
    async (pageToLoad: number) => {
      if (!hasMoreMessages && pageToLoad > 1) return;

      try {
        if (pageToLoad === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const offset = (pageToLoad - 1) * limit;
        const newMessages = await fetchMessages(currentConversation?.id, limit, offset);

        if (newMessages.length === 0) {
          setHasMoreMessages(false);
        }

        const reversedNewMessages = newMessages.reverse();
        setMessages((prevMessages) => {
          const newIds = new Set(reversedNewMessages.map((m) => m.id));
          const filteredPrevMessages = prevMessages.filter(
            (m) => !newIds.has(m.id)
          );

          if (pageToLoad === 1) {
            return [...reversedNewMessages];
          } else {
            return [...reversedNewMessages, ...filteredPrevMessages];
          }
        });

        setPage(pageToLoad + 1);
      } catch (error) {
        console.log("Lỗi khi tải tin nhắn:", error);
        Alert.alert("Lỗi", "Không thể tải lịch sử tin nhắn.");
      } finally {
        if (pageToLoad === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [currentConversation?.id, hasMoreMessages]
  );

  // Load messages on focus
  useEffect(() => {
    // Reset state
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    setIsLoading(true);
    setInputMessage("");
    setIsLoadingMore(false);
    loadMessages(1); // Load dữ liệu
  }, [currentConversation?.id]);

  // Handle input change with typing indicator
  const handleInputChange = (text: string) => {
    setInputMessage(text);

    if (!isTyping && text.trim().length > 0) {
      setIsTyping(true);
      SocketService.startTyping(currentConversation?.id);
    }

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      SocketService.stopTyping(currentConversation?.id);
    }, TYPING_TIMEOUT);

    if (text.trim().length === 0 && isTyping) {
      setIsTyping(false);
      SocketService.stopTyping(currentConversation?.id);
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    }
  };

  const isOtherUserOnline = socket.isUserOnline(receiver?.id);

  // Select media
  const handleSelectMedia = async () => {
    if (isUploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh để tiếp tục.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (result.canceled) {
        return;
      }

      setSelectedMediaAssets((prev) => [...prev, ...result.assets]);
    } catch (e) {
      console.log("Lỗi khi chọn media:", e);
      error("Lỗi", "Không thể chọn media.");
    }
  };

  // Send media
  const handleSendMedia = async (assets: any[]) => {
    if (assets.length === 0 || !currentUserId) return;

    setIsUploading(true);

    try {
      const uploadResult = await UploadMultipleFile(assets);
      if (!uploadResult.success) {
        error("Lỗi", "Upload thất bại: " + uploadResult.message);
        return;
      }
      if (
        !uploadResult.data ||
        !uploadResult.data.data ||
        !Array.isArray(uploadResult.data.data)
      ) {
        error("Lỗi", "Dữ liệu upload không hợp lệ từ server");
        return;
      }

      const fileUrls = uploadResult.data.data.map((item: any) => item.url);

      for (let i = 0; i < fileUrls.length; i++) {
        const fileUrl = fileUrls[i];
        const asset = assets[i];
        const type = asset?.type === "image" ? "image" : "video";

        const tempMessage = {
          id: Date.now() + Math.random(),
          conversationId: currentConversation?.id,
          senderId: currentUserId,
          content: null,
          type: type as "image" | "video",
          fileUrl: fileUrl,
          createdAt: new Date().toISOString(),
          replyToId: null,
          replyTo: null,
          Sender: {
            id: currentUserId,
            username: user?.username || "Bạn",
            avatarUrl: user?.avatarUrl || "",
            fullName: user?.fullName || "Bạn",
          },
        };

        setMessages((prevMessages) => [...prevMessages, tempMessage]);

        const result = await sendMessageApi({
          conversationId: currentConversation?.id,
          content: null,
          type: type,
          fileUrl: fileUrl,
        });

        if (result.status === "error") {
          error("Lỗi Gửi", "Không thể gửi media. Vui lòng thử lại.");
          setMessages((prevMessages) =>
            prevMessages.filter((m) => m.id !== tempMessage.id)
          );
        } else {
          // Broadcast qua socket
          await SocketService.sendMessage({
            conversationId: currentConversation?.id,
            messageData: result.data,
          });
        }
      }
    } catch (err) {
      console.log("Lỗi gửi media:", err);
      error("Lỗi Gửi", "Đã xảy ra lỗi hệ thống khi gửi media.");
    } finally {
      setIsUploading(false);
    }
  };

  // Send text message
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || !currentUserId) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    setIsTyping(false);
    SocketService.stopTyping(currentConversation?.id);

    const currentReplyingTo = replyingTo;

    const tempMessage = {
      id: Date.now(),
      conversationId: currentConversation?.id,
      senderId: currentUserId,
      content: trimmedMessage,
      type: "text",
      fileUrl: null,
      createdAt: new Date().toISOString(),
      Sender: {
        id: currentUserId,
        username: user?.username || "Bạn",
        avatarUrl: user?.avatarUrl || "",
        fullName: user?.fullName || "Bạn",
      },
      replyToId: currentReplyingTo?.id || null,
      replyTo: currentReplyingTo || null,
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setInputMessage("");
    setReplyingTo(null);

    try {
      const result = await sendMessageApi({
        conversationId: currentConversation?.id,
        content: trimmedMessage,
        type: "text",
        fileUrl: null,
        replyToId: currentReplyingTo?.id || null,
      });

      if (result.success) {
        await SocketService.sendMessage({
          conversationId: currentConversation?.id,
          messageData: result.data,
        });
      } else {
        error("Lỗi Gửi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m.id !== tempMessage.id)
        );
      }
    } catch (error) {
      console.log("Lỗi gửi tin nhắn:", error);
      error("Lỗi Gửi", "Đã xảy ra lỗi hệ thống khi gửi tin nhắn.");
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== tempMessage.id)
      );
    }
  }, [inputMessage, currentConversation?.id, currentUserId, replyingTo]);

  // Load more messages
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreMessages && !isLoading) {
      loadMessages(page);
    }
  }, [isLoadingMore, hasMoreMessages, isLoading, page, loadMessages]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setHasMoreMessages(true);
      setIsLoadingMore(false);
      await loadMessages(1);
    } catch (error) {
      console.log("Lỗi khi refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadMessages]);

  // Long press handler
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
  };

  // Modal handlers
  const handleReply = () => {
    if (selectedMessage) {
      setReplyingTo(selectedMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    try {
      await deleteMessage(selectedMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    } catch (error) {
      console.log("Error deleting message:", error);
      error("Lỗi", "Không thể xóa tin nhắn.");
    }
  };

  const handleHide = async () => {
    if (!selectedMessage) return;
    try {
      await hideMessage(selectedMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    } catch (error) {
      console.log("Error hiding message:", error);
      Alert.alert("Lỗi", "Không thể ẩn tin nhắn.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">
          Đang tải danh sách tin nhắn...
        </Text>
      </SafeAreaView>
    );
  }

  const renderHeader = (): React.ReactElement | null => {
    if (!isLoadingMore) return null;
    return (
      <View className="p-2">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => goBack()} className="p-2 -ml-2">
            <Icon name="arrow-left" size={24} color="#10B981" />
          </TouchableOpacity>

          {receiver && (
            <View className="flex-row items-center ml-2">
              <View className="relative">
                {isOtherUserOnline && (
                  <View className="z-10 absolute bottom-0 -left-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
                <Image
                  source={{
                    uri: receiver?.avatarUrl || "https://via.placeholder.com/40",
                  }}
                  className="w-8 h-8 rounded-full mr-2"
                  onError={() => { }}
                />
              </View>
              <View>
                <Text className="text-base font-semibold text-black dark:text-white">
                  {receiver.fullName || "Unknown User"}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {typingUsers.length > 0
                    ? "Đang gõ..."
                    : isOtherUserOnline
                      ? "Online"
                      : "Offline"}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="p-2"
          onPress={() => {
            setIsChatOptionsVisible(true);
          }}
        >
          <Icon name="more-vertical" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 30}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MessageItem
              message={item}
              isMyMessage={item.senderId === currentUserId}
              onLongPress={handleLongPress}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                Chưa có tin nhắn nào.
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 text-center mt-2">
                Hãy bắt đầu cuộc trò chuyện!
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#10B981"]}
              tintColor="#10B981"
              enabled={!isLoading}
            />
          }
        />

        {/* Reply Preview */}
        {replyingTo && (
          <View className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Trả lời {replyingTo.Sender.fullName}
                </Text>
                <Text
                  className="text-sm text-gray-800 dark:text-gray-200 mt-1"
                  numberOfLines={1}
                >
                  {replyingTo.content ||
                    (replyingTo.type === "image"
                      ? "Ảnh"
                      : replyingTo.type === "video"
                        ? "Video"
                        : "File")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                className="p-1"
              >
                <Icon name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Preview Selected Media */}
        {selectedMediaAssets.length > 0 && (
          <View className="border-t border-gray-200 dark:border-gray-700 p-3">
            <View className="flex-row flex-wrap">
              {selectedMediaAssets.map((asset, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image
                    source={{ uri: asset.uri }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMediaAssets((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Icon name="x" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-center p-3 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={handleSelectMedia}
            disabled={isUploading}
            className="p-2 mr-2"
          >
            <Icon
              name={isUploading ? "loader" : "plus"}
              size={24}
              color="#4F46E5"
            />
          </TouchableOpacity>

          <TextInput
            className="flex-1 h-12 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-black dark:text-white"
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={inputMessage}
            onChangeText={handleInputChange}
            editable={!isLoading && !isUploading}
          />

          <TouchableOpacity
            onPress={() => {
              if (selectedMediaAssets.length > 0) {
                handleSendMedia(selectedMediaAssets);
                setSelectedMediaAssets([]);
              } else {
                handleSendMessage();
              }
            }}
            disabled={
              (!inputMessage.trim() && selectedMediaAssets.length === 0) ||
              isLoading ||
              isUploading
            }
            className={`ml-2 p-2 rounded-full ${(!inputMessage.trim() && selectedMediaAssets.length === 0) || isLoading || isUploading ? "bg-gray-400" : "bg-indigo-500"}`}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MessageOptionsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onReply={handleReply}
        onDelete={handleDelete}
        onHide={handleHide}
        isMyMessage={selectedMessage?.senderId === currentUserId}
      />

      <ChatOptionsModal
        visible={isChatOptionsVisible}
        onClose={() => setIsChatOptionsVisible(false)}
        user={receiver}
        onViewProfile={() => {
          navigate("ProfileSocialScreen", { userId: receiver.id });
        }}
        onDeleteConversation={async () => {
          try {
            const result = await deleteConversation(currentConversation?.id);
            if ('status' in result && result.status === "error") {
              Alert.alert("Lỗi", result.message);
            } else {
              Alert.alert("Thành công", "Cuộc trò chuyện đã được xóa.");
              goBack();
            }
          } catch (error) {
            console.log("Error deleting conversation:", error);
            Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện.");
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;