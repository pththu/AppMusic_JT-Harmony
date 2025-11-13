import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Comment, createTrackComment, fetchCommentsByTrackId, toggleCommentLike } from "@/services/socialApi";
import { usePlayerStore } from "@/store/playerStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TrackCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  trackId: number | null;
  defaultTimecodeMs?: number | null;
  onUserPress?: (userId: number) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const TrackCommentsModal: React.FC<TrackCommentsModalProps> = ({
  visible,
  onClose,
  trackId,
  defaultTimecodeMs,
  onUserPress,
}) => {
  const colorScheme = useColorScheme();
  const setTargetSeekMs = usePlayerStore((s) => s.setTargetSeekMs);
  const setUiOverlayOpen = usePlayerStore((s) => s.setUiOverlayOpen);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; username?: string } | null>(null);
  const [attachTime, setAttachTime] = useState<number | null>(
    defaultTimecodeMs ?? null
  );

  const timeLabel = useMemo(() => {
    const sec = (attachTime ?? 0) / 1000;
    return formatTime(sec);
  }, [attachTime]);

  useEffect(() => {
    if (!visible || !trackId) return;
    setAttachTime(defaultTimecodeMs ?? null);
    const load = async () => {
      try {
        setLoading(true);
        const items = await fetchCommentsByTrackId(trackId, {});
        setComments(items);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [visible, trackId, defaultTimecodeMs]);

  // Inform player to pause background updates while modal is open
  useEffect(() => {
    setUiOverlayOpen && setUiOverlayOpen(!!visible);
    return () => {
      setUiOverlayOpen && setUiOverlayOpen(false);
    };
  }, [visible, setUiOverlayOpen]);

  const handleSend = async () => {
    if (!trackId || !newText.trim()) return;
    const optimistic: Comment = {
      id: Date.now().toString(),
      userId: 0 as any,
      postId: 0 as any,
      content: newText.trim(),
      parentId: replyingTo ? (replyingTo.id as any) : null,
      commentedAt: new Date().toISOString(),
      User: { id: 0 as any, username: "Bạn", avatarUrl: "", fullName: "" },
      likeCount: 0,
      isLiked: false,
      Replies: [],
      timecodeMs: attachTime ?? undefined,
    };
    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, Replies: [optimistic, ...(c.Replies || [])] }
            : c
        )
      );
    } else {
      setComments((prev) => [optimistic, ...prev]);
    }
    setNewText("");
    try {
      const res = await createTrackComment(
        trackId,
        optimistic.content,
        replyingTo ? replyingTo.id : null,
        attachTime ?? undefined
      );
      if ("message" in res) throw new Error(res.message);
      // Sau khi gửi thành công: reload lại danh sách để đồng bộ UI với server
      const latest = await fetchCommentsByTrackId(trackId, {});
      setComments(latest);
    } catch (e) {
      if (replyingTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, Replies: (c.Replies || []).filter((r) => r.id !== optimistic.id) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      }
    }
    setReplyingTo(null);
  };

  const onToggleLike = async (commentId: string) => {
    // optimistic toggle
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? Math.max(0, (c.likeCount || 0) - 1) : (c.likeCount || 0) + 1 }
          : {
              ...c,
              Replies: (c.Replies || []).map((r) =>
                r.id === commentId
                  ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? Math.max(0, (r.likeCount || 0) - 1) : (r.likeCount || 0) + 1 }
                  : r
              ),
            }
      )
    );
    try {
      await toggleCommentLike(commentId);
    } catch (e) {
      // rollback
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? (c.likeCount || 0) + 1 : Math.max(0, (c.likeCount || 0) - 1) }
            : {
                ...c,
                Replies: (c.Replies || []).map((r) =>
                  r.id === commentId
                    ? { ...r, isLiked: !r.isLiked, likeCount: r.isLiked ? (r.likeCount || 0) + 1 : Math.max(0, (r.likeCount || 0) - 1) }
                    : r
                ),
              }
        )
      );
    }
  };

  const renderReply = (reply: Comment) => {
    const hasTime = typeof reply.timecodeMs === "number";
    return (
      <TouchableOpacity key={reply.id} className="mt-2 pl-10" activeOpacity={0.8} onPress={() => hasTime && setTargetSeekMs && setTargetSeekMs(reply.timecodeMs as number)}>
        <View className="flex-row items-start">
          <Image source={{ uri: reply.User?.avatarUrl || undefined }} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#ccc' }} />
          <View className="flex-1 ml-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`${colorScheme === "dark" ? "text-white" : "text-black"} text-xs font-semibold`}>
                  {reply.User?.fullName || reply.User?.username || "User"}
                </Text>
                <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"} text-2xs`}>@{reply.User?.username}</Text>
              </View>
              {hasTime && (
                <TimeChip ms={reply.timecodeMs as number} onPress={() => setTargetSeekMs && setTargetSeekMs(reply.timecodeMs as number)} />
              )}
            </View>
            <Text className={`${colorScheme === "dark" ? "text-gray-300" : "text-gray-800"} mt-1 text-sm`}>{reply.content}</Text>
            <View className="flex-row items-center mt-1">
              <TouchableOpacity onPress={() => onToggleLike(reply.id)} className="mr-4 flex-row items-center">
                <Icon
                  name="heart"
                  size={14}
                  color={reply.isLiked ? '#ef4444' : (colorScheme === 'dark' ? '#9ca3af' : '#6b7280')}
                />
                <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-xs ml-1`}>{Number(reply.likeCount || 0)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReplyingTo({ id: reply.id, username: reply.User?.username })}>
                <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Trả lời</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(({ item }: { item: Comment }) => {
    const hasTime = typeof item.timecodeMs === "number";
    const onRowPress = () => {
      if (hasTime && setTargetSeekMs) setTargetSeekMs(item.timecodeMs as number);
    };
    return (
      <View className="mb-4 px-3">
        <View className="flex-row items-start">
          <Image source={{ uri: item.User?.avatarUrl || undefined }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ccc' }} />
          <View className="flex-1 ml-2">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={onRowPress} activeOpacity={0.8}>
                <Text className={`${colorScheme === "dark" ? "text-white" : "text-black"} text-sm font-semibold`}>
                  {item.User?.fullName || item.User?.username || "User"}
                </Text>
                <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"} text-xs`}>@{item.User?.username}</Text>
              </TouchableOpacity>
              {hasTime && (
                <TimeChip ms={item.timecodeMs as number} onPress={() => setTargetSeekMs && setTargetSeekMs(item.timecodeMs as number)} />
              )}
            </View>
            <Text className={`${colorScheme === "dark" ? "text-gray-300" : "text-gray-800"} mt-1`}>{item.content}</Text>
            <View className="flex-row items-center mt-2">
              <TouchableOpacity onPress={() => onToggleLike(item.id)} className="mr-5 flex-row items-center">
                <Icon
                  name="heart"
                  size={16}
                  color={item.isLiked ? '#ef4444' : (colorScheme === 'dark' ? '#9ca3af' : '#6b7280')}
                />
                <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm ml-1`}>{Number(item.likeCount || 0)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReplyingTo({ id: item.id, username: item.User?.username })}>
                <Text className={`${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Trả lời</Text>
              </TouchableOpacity>
            </View>
            {(item.Replies || []).map(renderReply)}
          </View>
        </View>
      </View>
    );
  }, [colorScheme, setTargetSeekMs]);

  const keyExtractor = useCallback((it: Comment) => it.id, []);

  const isIOS = Platform.OS === "ios";
  const TimeChip: React.FC<{ ms: number; onPress: () => void }> = ({ ms, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#6366F1',
        minWidth: 56,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{formatTime(ms / 1000)}</Text>
    </TouchableOpacity>
  );
  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}
          behavior={isIOS ? "padding" : "height"}
          keyboardVerticalOffset={isIOS ? Math.max(40, insets.top) : 0}
        >
          <TouchableWithoutFeedback>
            <View className={`rounded-t-3xl ${colorScheme === "dark" ? "bg-[#171431]" : "bg-white"}`} style={{ maxHeight: "85%", ...(isIOS ? {} : { borderTopLeftRadius: 20, borderTopRightRadius: 20 }) }}>
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                  Bình luận theo bài hát
                </Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Icon name="x" size={22} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                </TouchableOpacity>
              </View>

              {attachTime != null && (
                <View className="px-4 pt-2">
                  <View className="self-start px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                    <Text className="text-indigo-600 dark:text-indigo-300 text-xs">
                      Đang gắn mốc {timeLabel}
                    </Text>
                  </View>
                </View>
              )}

              {loading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={keyExtractor}
                  renderItem={renderItem}
                  contentContainerStyle={{ padding: 12 }}
                  keyboardShouldPersistTaps="handled"
                  removeClippedSubviews
                  windowSize={7}
                  initialNumToRender={12}
                  maxToRenderPerBatch={12}
                />
              )}

              <View className={`flex-row items-end px-3 py-3 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
                <TouchableOpacity
                  onPress={() => {
                    const pos = usePlayerStore.getState().playbackPosition || 0;
                    setAttachTime(Math.floor(pos * 1000));
                  }}
                  className="px-3 py-2 rounded-full bg-indigo-500 mr-2"
                >
                  <Text className="text-white text-xs font-bold">Gắn {formatTime(usePlayerStore.getState().playbackPosition || 0)}</Text>
                </TouchableOpacity>
                <TextInput
                  placeholder="Viết bình luận..."
                  placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
                  value={newText}
                  onChangeText={setNewText}
                  className={`flex-1 border rounded-full px-4 py-2 text-base ${colorScheme === "dark" ? "border-gray-600 bg-[#0E0C1F] text-white" : "border-gray-400 bg-white text-black"}`}
                  multiline
                  style={{ maxHeight: 100 }}
                />
                <TouchableOpacity onPress={handleSend} disabled={!newText.trim()} className={`ml-2 px-4 py-2 rounded-full ${!newText.trim() ? "bg-gray-400" : "bg-[#4F46E5]"}`}>
                  <Text className="text-white font-bold">Gửi</Text>
                </TouchableOpacity>
              </View>
              {replyingTo && (
                <View className="px-4 pb-2">
                  <View className="self-start px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 flex-row items-center">
                    <Text className={`${colorScheme === 'dark' ? 'text-white' : 'text-black'} text-xs`}>Đang trả lời @{replyingTo.username}</Text>
                    <TouchableOpacity className="ml-2" onPress={() => setReplyingTo(null)}>
                      <Text className="text-xs text-red-500">Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(TrackCommentsModal);
