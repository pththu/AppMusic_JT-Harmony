import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const MessageItem = ({
  message,
  isMyMessage,
  onLongPress,
}) => {
  const timeAgo = formatDistanceToNowStrict(parseISO(message.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <Text className={isMyMessage ? "text-white" : "text-black dark:text-white"} >
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

export default MessageItem;