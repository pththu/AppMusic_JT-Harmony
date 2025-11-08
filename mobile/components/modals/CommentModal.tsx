import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { toggleCommentLike, Comment } from "../../services/socialApi";

const formatTimeAgo = (dateString: string): string => {
  const commentDate = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }
  return "vừa xong";
};

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string, parentId: string | null) => Promise<void> | void;
  onCommentLike: (
    postId: string,
    commentId: string,
    isReply: boolean,
    replyId: string
  ) => void;
  postId: string | null;
  onUserPress: (userId: number) => void;
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  replyTo: Comment | null;
  setReplyTo: React.Dispatch<React.SetStateAction<Comment | null>>;
  quote: Comment | null;
  setQuote: React.Dispatch<React.SetStateAction<Comment | null>>;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  comments,
  onAddComment,
  onCommentLike,
  postId,
  onUserPress,
  newComment,
  setNewComment,
  replyTo,
  setReplyTo,
  quote,
  setQuote,
}) => {
  const colorScheme = useColorScheme();

  const [isSending, setIsSending] = useState(false); // Trạng thái gửi bình luận
  const [isKeyboardVisible, setKeyboardVisible] = useState(false); // Trạng thái bàn phím
  const [expandedReplies, setExpandedReplies] = useState({}); // Quản lý trạng thái mở rộng replies

  // Lắng nghe sự kiện bàn phím
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Xử lý thêm bình luận
  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        setIsSending(true);
        //  ParentId VẪN ĐƯỢC TÍNH DỰA TRÊN replyTo
        const parentId = replyTo ? replyTo.id : null;

        await onAddComment(newComment.trim(), parentId);

        setNewComment("");
        setReplyTo(null);
        setQuote(null);
      } catch (error) {
        console.error("Lỗi khi gửi bình luận trong modal:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Xử lý trả lời bình luận
  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setQuote(null);
  };

  // Nếu SocialScreen vẫn gọi, ta giữ lại hàm rỗng
  const handleQuote = (comment: Comment) => {
    console.warn("Nút Trích dẫn đã bị xóa khỏi UI.");
  };

  // Hủy trả lời hoặc trích dẫn
  const cancelReplyOrQuote = () => {
    setReplyTo(null);
    setQuote(null);
  };

  // Chuyển đổi trạng thái mở rộng replies
  const toggleExpandedReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Tính tổng số bình luận bao gồm cả replies
  const totalCommentCount = comments.reduce((total, comment) => {
    let count = 1;
    count += comment.Replies ? comment.Replies.length : 0;
    return total + count;
  }, 0);

  // Component hiển thị từng bình luận
  const CommentItem = ({ comment, isReply = false }) => {
    const isDark = colorScheme === "dark";
    const avatarSize = isReply ? 28 : 36;
    const textSize = isReply ? "text-xs" : "text-sm";
    const indent = isReply ? "ml-8" : "ml-0";

    return (
      <View className={`mb-3 flex-row ${indent}`}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => onUserPress(comment.User.id)}
          className="mr-2 self-start"
        >
          <Image
            source={{
              uri: comment.User?.avatarUrl || "https://via.placeholder.com/150",
            }}
            style={{ width: avatarSize, height: avatarSize }}
            className="rounded-full border border-gray-300 dark:border-gray-600"
          />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Header (Username và Time) */}
          <View className="flex-row items-center mb-0.5">
            <Text
              className={`font-extrabold ${textSize} ${isDark ? "text-white" : "text-black"}`}
            >
              {comment.User?.username}
            </Text>
            <Text
              className={`text-xs ml-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {typeof formatTimeAgo === "function"
                ? formatTimeAgo(comment.commentedAt)
                : comment.commentedAt}
            </Text>
          </View>

          {/* Nội dung Trích dẫn (Quote) */}
          {comment.quote ? (
            <View
              className={`rounded p-2 mb-1 border-l-4 border-indigo-500 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
            >
              <Text
                className={`italic text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}
                numberOfLines={2}
              >
                "{comment.quote.content}"
              </Text>
              <Text
                className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                - {comment.quote.username}
              </Text>
            </View>
          ) : null}

          {/* Nội dung Comment */}
          <Text
            className={`${textSize} ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {comment.content}
          </Text>

          {/* Thanh Tương tác (Like/Reply) */}
          <View className="flex-row mt-1.5">
            {/* Nút Like */}
            <TouchableOpacity
              onPress={() =>
                onCommentLike(
                  postId!,
                  comment.id,
                  isReply,
                  isReply ? comment.id : null
                )
              }
              className="flex-row items-center "
            >
              <Icon
                name={comment.isLiked ? "heart" : "heart"}
                size={isReply ? 14 : 16}
                color={
                  comment.isLiked ? "#ef4444" : isDark ? "#9ca3af" : "#000000"
                }
              />
              <Text
                className={`text-xs ${comment.isLiked ? "text-red-400 font-bold" : isDark ? "text-gray-400" : "text-gray-600"} px-1`}
              >
                {comment.likeCount || 0}
              </Text>
            </TouchableOpacity>

            {/* Nút Trả lời */}
            <TouchableOpacity
              onPress={() => handleReply(comment)}
              className="flex-row items-center px-4"
            >
              <Icon
                name="corner-up-left"
                size={isReply ? 14 : 16}
                color={isDark ? "#9ca3af" : "#000000"}
              />
              <Text
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} px-1`}
              >
                Trả lời
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <TouchableWithoutFeedback>
            <View
              className={`rounded-t-3xl p-4 ${isKeyboardVisible ? "h-1/2" : "h-4/5"} ${colorScheme === "dark" ? "bg-[#171431]" : "bg-white"}`}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Text
                  className={`text-xl font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}
                >
                  Bình luận ({totalCommentCount})
                </Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Icon
                    name="x"
                    size={24}
                    color={colorScheme === "dark" ? "#9ca3af" : "#000000"}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isExpanded = expandedReplies[item.id];
                  const visibleReplies = item.Replies
                    ? isExpanded
                      ? item.Replies
                      : item.Replies.slice(0, 2)
                    : [];

                  return (
                    <View className="mb-4">
                      {/* Render Comment Cha */}
                      <CommentItem comment={item} isReply={false} />

                      {/* Render Replies (trả lời) */}
                      <View className="ml-12 border-l-2 border-gray-300 dark:border-gray-700 pl-3 pt-1">
                        {visibleReplies.map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            isReply={true}
                          />
                        ))}
                      </View>

                      {/* Nút xem thêm replies */}
                      {item.Replies && item.Replies.length > 2 && (
                        <TouchableOpacity
                          onPress={() => toggleExpandedReplies(item.id)}
                          className="ml-12 mt-1"
                        >
                          <Text className="text-blue-500 font-medium text-xs">
                            {isExpanded
                              ? "Ẩn các trả lời"
                              : `Xem ${item.Replies.length - visibleReplies.length} trả lời khác`}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />

              {/* Hiển thị thông tin trả lời hoặc trích dẫn ở trên thanh nhập */}
              {(replyTo || quote) && (
                <View
                  className={`rounded-lg p-3 mb-2 flex-row justify-between items-center border border-indigo-300 dark:border-indigo-600 ${colorScheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <Text
                    className={`text-sm flex-1 ${colorScheme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                    numberOfLines={1}
                  >
                    {replyTo
                      ? `Đang trả lời ${replyTo.User?.username}: ${replyTo.content}`
                      : ""}
                  </Text>
                  <TouchableOpacity
                    onPress={cancelReplyOrQuote}
                    className="p-1 ml-2"
                  >
                    <Icon name="x" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Thanh nhập liệu */}
              <View
                className={`flex-row items-end py-3 px-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}
              >
                <TextInput
                  placeholder={"Viết bình luận..."}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#aaa" : "#777"
                  }
                  value={newComment}
                  onChangeText={setNewComment}
                  editable={!isSending}
                  className={`flex-1 border rounded-full px-4 py-2 text-base ${colorScheme === "dark" ? "border-gray-600 bg-[#0E0C1F] text-white" : "border-gray-400 bg-white text-black"}`}
                  multiline
                  style={{ maxHeight: 100 }}
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={!newComment.trim() || isSending}
                  className={`ml-2 px-4 py-2 rounded-full ${!newComment.trim() || isSending ? "bg-gray-400" : "bg-[#4F46E5]"}`}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="4F46E5" />
                  ) : (
                    <Text className="text-white font-bold">Gửi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentModal;
