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
  useColorScheme
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { toggleCommentLike, Comment } from "../../services/socialApi";

const formatTimeAgo = (dateString: string): string => {
    // 1. Chuyển đổi chuỗi ngày tháng thành đối tượng Date
    const commentDate = new Date(dateString);
    const now = new Date();
    
    // 2. Tính toán khoảng thời gian chênh lệch (tính bằng mili giây)
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    // 3. Định nghĩa các khoảng thời gian lớn hơn
    const intervals = [
        { label: 'năm', seconds: 31536000 },
        { label: 'tháng', seconds: 2592000 },
        { label: 'ngày', seconds: 86400 },
        { label: 'giờ', seconds: 3600 },
        { label: 'phút', seconds: 60 },
        { label: 'giây', seconds: 1 }
    ];

    // 4. Lặp qua các khoảng thời gian để tìm đơn vị phù hợp
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            // Trường hợp > 1 đơn vị
            return `${count} ${interval.label} trước`;
        }
    }
    
    // Trường hợp < 1 phút (ví dụ: 1-59 giây)
    return 'vừa xong';
};

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string, parentId: string | null) => void;
  onCommentLike: (postId: string, commentId: string, isReply: boolean, replyId: string) => void;
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
  
  // ✅ CHỈ GIỮ LẠI state nội bộ (không liên quan đến input)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Lấy ID của comment cha (nếu đang trả lời)
      const parentId = replyTo ? replyTo.id : null; 

      // Gọi hàm onAddComment (hàm addComment ở SocialScreen)
      onAddComment(newComment.trim(), parentId); 

      // Cleanup - Dùng prop setters
      setNewComment("");
      setReplyTo(null);
      setQuote(null);
    }
  };

  // Hàm xử lý khi nhấn trả lời comment
  const handleReply = (comment: Comment) => {
    setReplyTo(comment); // Dùng prop setter
    setQuote(null);
  };

  // Hàm xử lý khi nhấn trích dẫn comment
  const handleQuote = (comment: Comment) => {
    setQuote(comment); // Dùng prop setter
    setReplyTo(null);
  };

  // Hàm hủy trả lời hoặc trích dẫn
  const cancelReplyOrQuote = () => {
    setReplyTo(null); // Dùng prop setter
    setQuote(null);
  };

  // Hàm toggle mở rộng replies
  const toggleExpandedReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View
          className={`rounded-t-xl p-4 ${isKeyboardVisible ? "h-1/2" : "h-3/4"} ${colorScheme === "dark" ? "bg-[#171431]" : "bg-white"}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>Bình luận</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isExpanded = expandedReplies[item.id];
              // Dữ liệu replies được Server trả về dưới Alias 'Replies'
              const visibleReplies = item.Replies
                ? isExpanded
                  ? item.Replies
                  : item.Replies.slice(0, 3)
                : [];
              return (
                <View className="mb-3">
                  {/* Comment cha */}
                  <View className="flex-row items-center mb-1">
                    <TouchableOpacity 
                            
                            onPress={() => onUserPress(item.User.id)}
                            className="flex-row items-center mb-1"
                    >
                                          <Image
                      source={{
                        uri: item.User?.avatarUrl || "https://randomuser.me/api/portraits/men/3.jpg",
                      }}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                        </TouchableOpacity>

                    <Text className={`font-bold text-sm ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                      {item.User?.username} 
                    </Text>
                    <Text className={`text-xs ml-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                      {/* Dùng formatTimeAgo (cần được định nghĩa hoặc truyền vào) */}
                      {typeof formatTimeAgo === 'function' ? formatTimeAgo(item.commentedAt) : item.commentedAt}
                    </Text>
                  </View>
                  {/* Hiển thị trích dẫn nếu có */}
                  {item.quote ? (
                    <View className={`rounded p-2 mb-1 ml-8 border-l-4 border-blue-500 ${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                      <Text className={`italic text-sm ${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {item.quote.content}
                      </Text>
                      <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        - {item.quote.username}
                      </Text>
                    </View>
                  ) : null}
                  <Text className={`text-sm ml-8 ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    {item.content}
                  </Text>
                  {/* Nút trả lời và trích dẫn */}
                  <View className="flex-row ml-8 mt-1">
                    {/* Nút Like (giữ nguyên) */}
                    <TouchableOpacity
                      onPress={() =>
                        // isReply: false, replyId: null
                        onCommentLike(postId!, item.id, false, null)
                      }
                      className="flex-row items-center space-x-1"
                    >
                      <Icon
                        name={item.isLiked ? "heart" : "heart"}
                        size={16}
                        color={item.isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")}
                      />
                      <Text
                        className={`text-xs ${item.isLiked ? "text-red-400" : (colorScheme === "dark" ? "text-gray-200" : "text-gray-800")}`}
                      >
                        {item.likeCount}
                      </Text>
                    </TouchableOpacity>
                    {/* Nút Trả lời (Dùng prop setter) */}
                    <TouchableOpacity
                      onPress={() => handleReply(item)}
                      className="flex-row items-center px-2"
                    >
                      <Icon name="corner-up-left" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                      <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trả lời</Text>
                    </TouchableOpacity>
                    {/* Nút Trích dẫn (Dùng prop setter) */}
                    <TouchableOpacity
                      onPress={() => handleQuote(item)}
                      className="flex-row items-center space-x-1"
                    >
                      <Icon name="repeat" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                      <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trích dẫn</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Hiển thị replies */}
                  {visibleReplies.map((reply) => (
                    <View key={reply.id} className="ml-12 mt-2">
                      <View className="flex-row items-center mb-1">
                        <Image
                          source={{
                            uri: reply.User?.avatarUrl || "https://randomuser.me/api/portraits/men/3.jpg",
                          }}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        <Text className={`font-bold text-xs ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                          {reply.User?.username} 
                        </Text>
                        <Text className={`text-xs ml-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                          {typeof formatTimeAgo === 'function' ? formatTimeAgo(reply.commentedAt) : reply.commentedAt}
                        </Text>
                      </View>
                      <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                        {reply.content}
                      </Text>
                      {/* Nút like và trả lời cho reply */}
                      <View className="flex-row mt-1">
                        {/* Nút Like Reply (giữ nguyên) */}
                        <TouchableOpacity
                          onPress={() =>
                            // isReply: true, replyId: reply.id
                            onCommentLike(postId!, item.id, true, reply.id)
                          }
                          className="flex-row items-center space-x-1"
                        >
                          <Icon
                            name={reply.isLiked ? "heart" : "heart"}
                            size={14}
                            color={reply.isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")}
                          />
                          <Text
                            className={`text-xs ${reply.isLiked ? "text-red-400" : (colorScheme === "dark" ? "text-gray-400" : "text-gray-600")}`}
                          >
                            {reply.likeCount}
                          </Text>
                        </TouchableOpacity>
                        {/* Nút Trả lời Reply (Dùng prop setter) */}
                        <TouchableOpacity
                          onPress={() => handleReply(reply)}
                          className="flex-row items-center px-2"
                        >
                          <Icon
                            name="corner-up-left"
                            size={14}
                            color={colorScheme === "dark" ? "#9ca3af" : "#000000"}
                          />
                          <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trả lời</Text>
                        </TouchableOpacity>
                        {/* Nút Trích dẫn Reply (Dùng prop setter) */}
                        <TouchableOpacity
                          onPress={() => handleQuote(reply)} // 💡 SỬA: handleQuote(reply) thay vì handleQuote(item)
                          className="flex-row items-end space-x-1"
                        >
                          <Icon name="repeat" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                          <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                            Trích dẫn
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {/* Nút xem thêm replies */}
                  {item.Replies && item.Replies.length > 3 && (
                    <TouchableOpacity
                      onPress={() => toggleExpandedReplies(item.id)}
                      className="ml-12 mt-1"
                    >
                      <Text className="text-blue-400 text-xs">
                        {isExpanded
                          ? "Ẩn các trả lời"
                          : `Xem ${item.Replies.length - 3} trả lời khác`}
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
            <View className={`rounded p-2 mb-2 flex-row justify-between items-center ${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
              <Text
                className={`italic text-sm flex-1 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                numberOfLines={1}
              >
                {replyTo
                  ? `Trả lời ${replyTo.User?.username}: ${replyTo.content}`
                  : `Trích dẫn ${quote!.User?.username}: ${quote!.content}`}
              </Text>
              <TouchableOpacity onPress={cancelReplyOrQuote}>
                <Icon name="x" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          {/* Thanh nhập liệu */}
          <View className={`flex-row items-end py-3 px-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
            <TextInput
              placeholder={"Viết bình luận..."}
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
              value={newComment} // ✅ Dùng prop state
              onChangeText={setNewComment} // ✅ Dùng prop setter
              className={`flex-1 border rounded-full px-4 py-2 text-base ${colorScheme === "dark" ? "border-gray-600 bg-[#0E0C1F] text-white" : "border-gray-400 bg-white text-black"}`}
              multiline
              style={{ maxHeight: 100 }}
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!newComment.trim()} 
              className={`ml-2 px-4 py-2 rounded-full ${!newComment.trim() ? "bg-gray-400" : "bg-green-600"}`}
            >
              <Text className="text-white font-bold">Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;
