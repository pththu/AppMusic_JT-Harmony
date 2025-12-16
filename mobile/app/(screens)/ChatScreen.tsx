import ChatOptionsModal from "@/components/modals/ChatOptionsModal";
import MessageOptionsModal from "@/components/modals/MessageOptionsModal";
import { useNavigate } from "@/hooks/useNavigate";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { deleteConversation, deleteMessage, fetchMessages, hideMessage } from "@/services/chatApi";
import {
  connectSocket,
  disconnectSocket,
  joinConversation,
  Message,
  sendMessage,
  startTyping,
  stopTyping,
  subscribeToNewMessages,
  subscribeToTypingStatus,
} from "@/services/chatService";
import useAuthStore from "@/store/authStore";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
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

// Định nghĩa Route Params
type RootStackParamList = {
  ChatScreen: {
    conversationId: number;
    user: { id: number; username: string; fullName: string; avatarUrl: string | null };
  };
};
type ChatRouteProp = RouteProp<RootStackParamList, "ChatScreen">;

// Component Item Tin nhắn
interface MessageItemProps {
  message: Message;
  isMyMessage: boolean;
  onLongPress: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMyMessage,
  onLongPress,
}) => {
  // Định dạng thời gian
  const timeAgo = formatDistanceToNowStrict(parseISO(message.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  // Render nội dung tin nhắn
  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <Text
            className={
              isMyMessage ? "text-white" : "text-black dark:text-white"
            }
          >
            {message.content}
          </Text>
        );
      case "image":
        return (
          <Image
            source={{ uri: message.fileUrl || "" }}
            className="w-48 h-48 rounded-lg"
            resizeMode="cover"
            onError={() => { }}
          />
        );
      case "video":
        return (
          <View className="w-48 h-48 bg-gray-300 dark:bg-gray-700 rounded-lg justify-center items-center">
            <Icon name="play-circle" size={48} color="#4F46E5" />
            <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Video
            </Text>
          </View>
        );
      default:
        return (
          <Text
            className={
              isMyMessage ? "text-white" : "text-black dark:text-white"
            }
          >
            {message.content}
          </Text>
        );
    }
  };

  // Render preview của tin nhắn được trả lời
  const renderReplyPreview = () => {
    if (!message.replyTo) return null;

    const getReplyContent = () => {
      switch (message.replyTo.type) {
        case "text":
          return message.replyTo.content || "Tin nhắn";
        case "image":
          return "Ảnh";
        case "video":
          return "Video";
        case "file":
          return "File";
        default:
          return "Tin nhắn";
      }
    };

    return (
      <View
        className={`m-2 p-2 rounded-lg border-l-4 ${isMyMessage
          ? "bg-blue-600 border-blue-300"
          : "bg-gray-300 dark:bg-gray-700 border-gray-500"
          }`}
      >
        <Text
          className={`text-xs font-semibold ${isMyMessage ? "text-blue-200" : "text-gray-600 dark:text-gray-300"
            }`}
        >
          Trả lời {message.replyTo.Sender.fullName}
        </Text>
        <Text
          className={`text-sm mt-1 ${isMyMessage ? "text-blue-100" : "text-gray-800 dark:text-gray-200"
            }`}
          numberOfLines={1}
        >
          {getReplyContent()}
        </Text>
      </View>
    );
  };

  return (
    <View
      className={`flex-row mb-2 px-3 ${isMyMessage ? "justify-end" : "justify-start"}`}
    >
      {!isMyMessage && (
        <Image
          source={{
            uri: message.Sender.avatarUrl || "https://via.placeholder.com/40",
          }}
          className="w-8 h-8 rounded-full mr-2 mt-1"
        />
      )}
      <View className="flex-col max-w-[75%]">
        {!isMyMessage && (
          <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            {message.Sender.fullName}
          </Text>
        )}
        <TouchableOpacity
          onLongPress={() => onLongPress(message)}
          className={`p-2 rounded-xl ${isMyMessage
            ? "bg-blue-500 rounded-tr-none"
            : "bg-gray-200 dark:bg-gray-800"
            }`}
        >
          {renderReplyPreview()}
          {renderMessageContent()}
        </TouchableOpacity>
        <Text
          className={`text-xs mt-1 opacity-70 ${isMyMessage
            ? "text-blue-200 text-right"
            : "text-gray-500 dark:text-gray-400 text-left"
            }`}
        >
          {timeAgo}
        </Text>
      </View>
    </View>
  );
};

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { navigate, goBack } = useNavigate();

  // Lấy params
  const { conversationId, user } = route.params;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [isPaginating, setIsPaginating] = useState<boolean>(false);
  const limit = 20;

  // State cho việc tải tin nhắn cũ
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State cho upload media
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // State cho selected media assets
  const [selectedMediaAssets, setSelectedMediaAssets] = useState<any[]>([]);

  // State cho modal options
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // State cho chat options modal
  const [isChatOptionsVisible, setIsChatOptionsVisible] = useState<boolean>(false);

  // State cho reply
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Ref cho FlatList để scroll
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      // Scroll xuống cuối sau một khoảng thời gian ngắn để đảm bảo UI đã render
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Reset state khi conversationId thay đổi (khi remount hoặc navigate lại)
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    setTypingUsers([]);
    setInputMessage("");
    setIsLoadingMore(false);
    setRefreshing(false);
  }, [conversationId]);

  // Lấy Lịch sử Tin nhắn
  const loadMessages = useCallback(
    async (pageToLoad: number) => {
      if (!hasMoreMessages && pageToLoad > 1) return;

      try {
        if (pageToLoad === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        // Offset là số tin nhắn đã có
        const offset = (pageToLoad - 1) * limit;
        // Endpoint: GET /api/v1/conversations/:conversationId/messages?limit=20&offset=0
        const newMessages = await fetchMessages(conversationId, limit, offset);
        if (newMessages.length === 0) {
          setHasMoreMessages(false);
        }
        // Tin nhắn từ server trả về DESC (mới nhất trước)
        // Đảo ngược để ASC (cũ nhất trước) cho FlatList không inverted
        const reversedNewMessages = newMessages.reverse();
        setMessages((prevMessages) => {
          // Lọc bỏ tin nhắn trùng lặp (nếu có, dựa vào ID)
          const newIds = new Set(reversedNewMessages.map((m) => m.id));
          const filteredPrevMessages = prevMessages.filter(
            (m) => !newIds.has(m.id)
          );

          if (pageToLoad === 1) {
            // Tải lần đầu: tin nhắn cũ nhất trước
            return [...reversedNewMessages];
          } else {
            // Tải thêm tin nhắn cũ: thêm vào đầu mảng
            return [...reversedNewMessages, ...filteredPrevMessages];
          }
        });

        setPage(pageToLoad + 1);
      } catch (error) {
        console.error("Lỗi khi tải tin nhắn:", error);
        Alert.alert("Lỗi", "Không thể tải lịch sử tin nhắn.");
      } finally {
        if (pageToLoad === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [conversationId]
  );

  // Tải tin nhắn lần đầu khi focus screen
  useFocusEffect(
    useCallback(() => {
      // Reset state mỗi khi focus để đảm bảo tải lại từ đầu
      setMessages([]);
      setPage(1);
      setHasMoreMessages(true);
      setIsLoading(true);
      setTypingUsers([]);
      setInputMessage("");
      setIsLoadingMore(false);

      loadMessages(1);
    }, [loadMessages])
  );

  // Xử lý Socket.IO

  useEffect(() => {
    // 1. Kết nối và Tham gia Conversation
    connectSocket();
    joinConversation(conversationId);

    // 2. Đăng ký lắng nghe tin nhắn mới
    const unsubscribeNewMessages = subscribeToNewMessages((message) => {
      // Chỉ thêm vào nếu tin nhắn đó thuộc conversation hiện tại
      if (message.conversationId === conversationId) {
        // Xóa tin nhắn tạm nếu có (dựa vào senderId và content giống nhau)
        setMessages((prevMessages) => {
          const filteredMessages = prevMessages.filter(
            (m) =>
              !(
                m.senderId === message.senderId &&
                m.content === message.content &&
                m.id !== message.id
              )
          );
          // Thêm tin nhắn mới vào CUỐI MẢNG (vì không inverted)
          return [...filteredMessages, message];
        });
      }
    });

    // 3. Đăng ký lắng nghe trạng thái gõ
    const unsubscribeTyping = subscribeToTypingStatus(
      ({ userId, isTyping }) => {
        // Bỏ qua tin nhắn gõ của chính mình
        if (userId === currentUserId) return;

        setTypingUsers((prev) => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId]; // Thêm người dùng vào danh sách đang gõ
          } else if (!isTyping && prev.includes(userId)) {
            return prev.filter((id) => id !== userId); // Xóa người dùng khỏi danh sách đang gõ
          }
          return prev;
        });
      }
    );

    // Hủy đăng ký và ngắt kết nối khi component unmount
    return () => {
      unsubscribeNewMessages();
      unsubscribeTyping();
      disconnectSocket();
    };
  }, [conversationId, currentUserId]); // Chỉ chạy lại khi conversationId hoặc currentUserId thay đổi

  // Xử lý Input

  // Trạng thái gõ
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const TYPING_TIMEOUT = 3000;
  const typingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (text: string) => {
    setInputMessage(text);

    if (!isTyping && text.trim().length > 0) {
      // Bắt đầu gõ
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Reset timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Thiết lập timer dừng gõ
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId);
    }, TYPING_TIMEOUT);

    // Nếu text rỗng, dừng gõ ngay lập tức
    if (text.trim().length === 0 && isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    }
  };

  // Xử lý Chọn Media (Ảnh/Video)

  const handleSelectMedia = async () => {
    if (isUploading) return;

    // Yêu cầu cấp quyền truy cập thư viện ảnh
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
        allowsMultipleSelection: true, // Cho phép chọn nhiều ảnh
      });

      if (result.canceled) {
        return;
      }

      // Thêm vào selectedMediaAssets thay vì upload ngay
      setSelectedMediaAssets((prev) => [...prev, ...result.assets]);
    } catch (e) {
      console.error("Lỗi khi chọn media:", e);
      Alert.alert("Lỗi", "Không thể chọn media.");
    }
  };

  // Xử lý Gửi Media (Ảnh/Video)

  const handleSendMedia = async (assets: any[]) => {
    if (assets.length === 0 || !currentUserId) return;

    setIsUploading(true);

    try {
      // Upload files lên server
      const uploadResult = await UploadMultipleFile(assets);
      if (!uploadResult.success) {
        Alert.alert("Lỗi", "Upload thất bại: " + uploadResult.message);
        return;
      }
      if (
        !uploadResult.data ||
        !uploadResult.data.data ||
        !Array.isArray(uploadResult.data.data)
      ) {
        Alert.alert("Lỗi", "Dữ liệu upload không hợp lệ từ server");
        return;
      }

      // Lấy danh sách URLs từ server
      const fileUrls = uploadResult.data.data.map((item: any) => item.url);

      // Gửi từng file như một tin nhắn riêng biệt
      for (let i = 0; i < fileUrls.length; i++) {
        const fileUrl = fileUrls[i];
        const asset = assets[i];
        const type = asset?.type === "image" ? "image" : "video";

        // Tạo tin nhắn tạm thời
        const tempMessage: Message = {
          id: Date.now() + Math.random(), // ID tạm thời duy nhất
          conversationId: conversationId,
          senderId: currentUserId,
          content: null, // Không có content text
          type: type as "image" | "video",
          fileUrl: fileUrl,
          createdAt: new Date().toISOString(),
          replyToId: null,
          replyTo: null,
          Sender: {
            id: currentUserId,
            username: useAuthStore.getState().user?.username || "Bạn",
            avatarUrl: useAuthStore.getState().user?.avatarUrl || "",
            fullName: useAuthStore.getState().user?.fullName || "Bạn",
          },
        };

        // Thêm tin nhắn tạm thời vào danh sách
        setMessages((prevMessages) => [...prevMessages, tempMessage]);

        // Gửi tin nhắn qua Socket
        const result = await sendMessage({
          conversationId: conversationId,
          content: null,
          type: type,
          fileUrl: fileUrl,
        });

        if (result.status === "error") {
          Alert.alert("Lỗi Gửi", "Không thể gửi media. Vui lòng thử lại.");
          // Xóa tin nhắn tạm
          setMessages((prevMessages) =>
            prevMessages.filter((m) => m.id !== tempMessage.id)
          );
        }
      }
    } catch (error) {
      console.error("Lỗi gửi media:", error);
      Alert.alert("Lỗi Gửi", "Đã xảy ra lỗi hệ thống khi gửi media.");
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý Gửi Tin nhắn Text

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || !currentUserId) return;

    // Dừng gõ và xóa timer
    stopTyping(conversationId);
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    setIsTyping(false);

    // Lưu trữ replyingTo trước khi reset
    const currentReplyingTo = replyingTo;

    // Tạo tin nhắn tạm thời (Optimistic Update)
    const tempMessage: Message = {
      id: Date.now(), // ID tạm thời
      conversationId: conversationId,
      senderId: currentUserId,
      content: trimmedMessage,
      type: "text",
      fileUrl: null,
      createdAt: new Date().toISOString(),
      Sender: {
        id: currentUserId,
        username: useAuthStore.getState().user?.username || "Bạn",
        avatarUrl: useAuthStore.getState().user?.avatarUrl || "",
        fullName: useAuthStore.getState().user?.fullName || "Bạn",
      },
      replyToId: currentReplyingTo?.id || null,
      replyTo: currentReplyingTo || null,
    };

    // 1. Thêm tin nhắn tạm thời vào danh sách (để hiển thị ngay)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setInputMessage("");
    setReplyingTo(null);

    try {
      // 2. Gửi tin nhắn qua Socket
      const result = await sendMessage({
        conversationId: conversationId,
        content: trimmedMessage,
        type: "text",
        fileUrl: null,
        replyToId: currentReplyingTo?.id || null,
      });

      if (result.status === "error") {
        // Nếu gửi thất bại, hiển thị lại lỗi và có thể xóa tin nhắn tạm
        Alert.alert("Lỗi Gửi", "Không thể gửi tin nhắn. Vui lòng thử lại.");

        // Xóa tin nhắn tạm khỏi danh sách
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m.id !== tempMessage.id)
        );
      }
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      Alert.alert("Lỗi Gửi", "Đã xảy ra lỗi hệ thống khi gửi tin nhắn.");

      // Xóa tin nhắn tạm khỏi danh sách
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== tempMessage.id)
      );
    }
  }, [inputMessage, conversationId, currentUserId, replyingTo]);

  // Xử lý Load Thêm Tin nhắn (Khi cuộn đến cuối)
  const handleLoadMore = useCallback(() => {
    // Chỉ tải thêm nếu không đang tải, có thêm tin nhắn, và không đang tải trang đầu
    if (!isLoadingMore && hasMoreMessages && !isLoading) {
      loadMessages(page);
    }
  }, [isLoadingMore, hasMoreMessages, isLoading, page, loadMessages]);

  // Xử lý Pull-to-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setHasMoreMessages(true);
      setIsLoadingMore(false);
      await loadMessages(1);
    } catch (error) {
      console.error("Lỗi khi refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadMessages]);

  // Xử lý Long Press trên tin nhắn
  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
  };

  // Xử lý các tùy chọn trong modal
  const handleReply = () => {
    if (selectedMessage) {
      setReplyingTo(selectedMessage);
    }
  };

  // Xóa tin nhắn
  const handleDelete = async () => {
    if (!selectedMessage) return;
    try {
      await deleteMessage(selectedMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Lỗi", "Không thể xóa tin nhắn.");
    }
  };

  const handleHide = async () => {
    if (!selectedMessage) return;
    try {
      await hideMessage(selectedMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    } catch (error) {
      console.error("Error hiding message:", error);
      Alert.alert("Lỗi", "Không thể ẩn tin nhắn.");
    }
  };

  // loading indicator khi đang tải lần đầu
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

  // Header cho FlatList
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
        {/* NHÓM MŨI TÊN VÀ AVATAR/TÊN */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => goBack()} className="p-2 -ml-2">
            <Icon name="arrow-left" size={24} color="#10B981" />
          </TouchableOpacity>

          {/* Thêm khoảng cách giữa mũi tên và avatar */}
          {user && (
            <View className="flex-row items-center ml-2">
              <View className="relative">
                <Image
                  source={{
                    uri: user.avatarUrl || "https://via.placeholder.com/40",
                  }}
                  className="w-8 h-8 rounded-full mr-2"
                  onError={() => { }}
                />
                {/* Status Indicator */}
                <View
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${typingUsers.length > 0 ? "bg-yellow-400" : "bg-green-400"
                    }`}
                />
              </View>
              <View>
                <Text className="text-base font-semibold text-black dark:text-white">
                  {user.fullName || "Unknown User"}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {typingUsers.length > 0 ? "Đang gõ..." : "Online"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Nút Ba chấm */}
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
          // Cấu hình cho chat
          showsVerticalScrollIndicator={false}
          // Xử lý Load More
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
          ListFooterComponent={null}
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

      {/* Message Options Modal */}
      <MessageOptionsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onReply={handleReply}
        onDelete={handleDelete}
        onHide={handleHide}
        isMyMessage={selectedMessage?.senderId === currentUserId}
      />

      {/* Chat Options Modal */}
      <ChatOptionsModal
        visible={isChatOptionsVisible}
        onClose={() => setIsChatOptionsVisible(false)}
        user={user}
        onViewProfile={() => {
          // Navigate to profile screen
          navigate("ProfileSocialScreen", { userId: user.id });
        }}
        onDeleteConversation={async () => {
          try {
            const result = await deleteConversation(conversationId);
            if ('status' in result && result.status === "error") {
              Alert.alert("Lỗi", result.message);
            } else {
              Alert.alert("Thành công", "Cuộc trò chuyện đã được xóa.");
              goBack(); // Navigate back after deletion
            }
          } catch (error) {
            console.error("Error deleting conversation:", error);
            Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện.");
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
