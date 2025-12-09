import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import {
  fetchCommentsByPostId,
  createNewComment,
  toggleCommentLike,
  updatePost,
  deletePost,
  Post as PostType,
  Comment,
  sharePost
} from "../../services/socialApi";
import { Cover } from "../../services/coverService";
import useAuthStore from "@/store/authStore";
import PostItem from "../../components/items/PostItem";
import CoverItem from "../../components/items/CoverItem";
import CommentModal from "../../components/modals/CommentModal";
import FollowListModal from "../../components/modals/FollowListModal";
import LikeModal from "../../components/modals/LikeModal";
import CustomButton from "@/components/custom/CustomButton";
import { createOrGetPrivateConversation } from "../../services/chatApi";
import { useNavigate } from "@/hooks/useNavigate";
import { useFollowStore } from "@/store/followStore";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { FollowUser, UnfollowUser } from "@/services/followService";
import { useLocalSearchParams } from "expo-router";
import { useProfileSocialData } from "@/hooks/useProfileSocialData";

export default function ProfileSocialScreen() {
  const params = useLocalSearchParams();
  const userId = params.userId ? JSON.parse(params.userId as string) : "";
  const { navigate, goBack } = useNavigate();
  const { success, error, info, confirm } = useCustomAlert();

  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  const isGuest = useAuthStore((state) => state.isGuest);
  const currentUser = useAuthStore((state) => state.user);
  const followees = useFollowStore((state) => state.userFollowees);
  const setFollowees = useFollowStore((state) => state.setFollowees);
  const removeFollowee = useFollowStore((state) => state.removeFollowee);

  const currentUserId = currentUser?.id;

  const [activeTab, setActiveTab] = useState<"posts" | "covers">("posts"); // Tab active

  // STATES CHO COMMENT MODAL
  const [commentModalVisible, setCommentModalVisible] = useState(false); // Modal bình luận
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); // Post ID đang xem bình luận
  const [comments, setComments] = useState<Comment[]>([]); // Danh sách bình luận
  const [newComment, setNewComment] = useState(""); // Nội dung bình luận mới
  const [replyTo, setReplyTo] = useState<Comment | null>(null); // Bình luận đang trả lời
  const [quote, setQuote] = useState<Comment | null>(null); // Bình luận đang trích dẫn

  const [isFollowingPending, setIsFollowingPending] = useState(false); // Trạng thái chờ follow/unfollow

  // STATES CHO FOLLOW MODAL
  const [followModalVisible, setFollowModalVisible] = useState(false); // Hiển thị modal follow
  const [followListType, setFollowListType] = useState<"followers" | "following">("followers"); // Loại danh sách hiển thị
  const [followListData, setFollowListData] = useState([]);
  // STATES CHO LIKE MODAL
  const [likeModalVisible, setLikeModalVisible] = useState(false); // Hiển thị modal like
  const [selectedPostIdForLikes, setSelectedPostIdForLikes] = useState<string | null>(null); // Post ID đang xem danh sách like

  // STATES CHO EDIT MODAL
  const [editModalVisible, setEditModalVisible] = useState(false); // Hiển thị modal edit
  const [editingPost, setEditingPost] = useState(null); // Bài đăng đang chỉnh sửa
  const [editContent, setEditContent] = useState(""); // Nội dung chỉnh sửa

  // STATES CHO RE-SHARE MODAL
  const [reShareModalVisible, setReShareModalVisible] = useState(false); // Hiển thị modal re-share
  const [reShareTargetPost, setReShareTargetPost] = useState<any | null>(null); // Bài đăng đang chia sẻ
  const [reShareCaption, setReShareCaption] = useState(""); // Nội dung chia sẻ
  const [isSharing, setIsSharing] = useState(false); // Trạng thái đang chia sẻ

  const isCurrentUserProfile = currentUser && currentUser.id === userId;

  // Hàm tải dữ liệu profile và bài đăng
  const {
    profile,
    posts,
    covers,
    loading,
    isFollowing,
    isRefreshing,
    followersOfProfile,
    followeesOfProfile,
    setIsRefreshing,
    setPosts,
    setCovers,
    setProfile,
  } = useProfileSocialData(userId);


  // Hàm xử lý mở Chat
  const handleChatPress = useCallback(async () => {
    if (isGuest) {
      info("Thông báo", "Hãy đăng nhập để sử dụng tính năng này.");
      return;
    }
    if (!profile) return;
    try {
      // Gọi API để tạo/lấy Conversation ID
      const result = await createOrGetPrivateConversation(userId);
      if ("status" in result && result.status === "error") {
        error("Lỗi", result.message);
        return;
      }
      const { conversationId } = result as { conversationId: number };

      // Chuyển hướng đến màn hình Chat với ID vừa nhận
      (navigation as any).navigate("ChatScreen", {
        conversationId: conversationId,
        // Truyền thông tin người chat cùng để hiển thị trên header
        user: {
          id: userId,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
        },
      });
    } catch (err) {
      console.error("Lỗi khi mở chat:", err);
      error("Lỗi", "Không thể mở chat. Vui lòng thử lại.");
    }
  }, [userId, profile, navigate]);

  // HÀM XỬ LÝ KHI NHẤN VÀO USER
  const handleUserPress = useCallback(
    (targetUserId: number) => {
      // Nếu nhấn vào ảnh của chính mình, nó sẽ reload màn hình.
    },
    [navigate]
  );

  // Hàm cập nhật bài đăng trong danh sách
  const updatePostState = useCallback(
    (
      postId: string,
      type:
        | "isLiked"
        | "heartCount"
        | "commentCount"
        | "shareCount"
        | "content"
        | "share",
      value: any
    ) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newValue =
              typeof value === "function" ? value(post[type]) : value;
            return {
              ...post,
              [type]: newValue,
            };
          }
          return post;
        })
      );
    },
    []
  );

  // HÀM XỬ LÝ MỞ LIKE MODAL
  const handleLikeCountPress = useCallback((postId: number) => {
    setSelectedPostIdForLikes(postId.toString());
    setLikeModalVisible(true);
  }, []);

  // HÀM XỬ LÝ ĐÓNG LIKE MODAL
  const handleCloseLikeModal = useCallback(() => {
    setLikeModalVisible(false);
    setSelectedPostIdForLikes(null);
  }, []);

  // HÀM XỬ LÝ MỞ EDIT MODAL
  const handleEditPress = useCallback((post: any) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditModalVisible(true);
  }, []);

  // HÀM XỬ LÝ ĐÓNG EDIT MODAL
  const handleCloseEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingPost(null);
    setEditContent("");
  }, []);

  // HÀM XỬ LÝ LƯU EDIT
  const handleSaveEdit = useCallback(async () => {
    if (!editingPost || !editContent.trim()) return;

    try {
      const updatedPost = await updatePost(
        editingPost.id,
        editContent,
        null, // newFileUrls
        null // newSongId
      );
      if ("message" in updatedPost) {
        throw new Error(updatedPost.message);
      }
      // Cập nhật state với bài viết đã chỉnh sửa
      updatePostState(editingPost.id, "content", editContent);
      handleCloseEditModal();
      success("Thành công", "Bài viết đã được cập nhật.");
    } catch (err) {
      console.error("Lỗi khi cập nhật bài viết:", err);
      error("Lỗi", "Không thể cập nhật bài viết.");
    }
  }, [editingPost, editContent, updatePost]);

  // HÀM XỬ LÝ XÓA POST
  const handleDeletePress = useCallback(async (postId: string) => {
    confirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      async () => {
        try {
          const result = await deletePost(postId);
          if ("message" in result) {
            throw new Error(result.message);
          }
          // Xóa khỏi state local
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          success("Thành công", "Bài viết đã được xóa.");
        } catch (error) {
          console.error("Lỗi khi xóa bài viết:", error);
          error("Lỗi", "Không thể xóa bài viết.");
        }
      },
    );
  }, []);

  // HÀM XỬ LÝ REFRESH
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setIsRefreshing(false);
  }, []);

  // Xử lý Thích/Bỏ thích bài đăng
  const handleTogglePostLike = async (postId: string) => {
    // PostItem sẽ tự gọi API và gửi kết quả về qua onPostUpdate.
  };

  // Hàm mở Modal
  const openCommentModal = async (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    try {
      const fetchedComments = await fetchCommentsByPostId(postId);
      if ("message" in fetchedComments) {
        throw new Error(String(fetchedComments.message));
      }
      setComments(fetchedComments);
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      // Alert.alert("Lỗi", "Không thể tải bình luận.");
      error("Lỗi", "Không thể tải bình luận.");
    }
  };

  // Hàm đóng Modal
  const closeCommentModal = () => {
    setSelectedPostId(null);
    setCommentModalVisible(false);
    setComments([]);
    setNewComment("");
    setReplyTo(null);
    setQuote(null);
  };

  // Hàm thêm bình luận
  const addComment = async (text: string, parentId: string | null) => {
    if (!selectedPostId) return;
    try {
      const newCommentData = await createNewComment(
        selectedPostId,
        text,
        parentId
      );
      if ("message" in newCommentData) {
        throw new Error(String(newCommentData.message));
      }
      // Cập nhật danh sách bình luận
      setComments((prev) => [newCommentData, ...prev]);
      // Cập nhật số lượng bình luận trong bài đăng
      updatePostState(
        selectedPostId,
        "commentCount",
        (prevCount: number) => prevCount + 1
      );
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      // Alert.alert("Lỗi", "Không thể thêm bình luận.");
      error("Lỗi", "Không thể thêm bình luận.");
    }
  };

  // Hàm xử lý like bình luận
  const handleCommentLike = async (
    postId: string,
    commentId: string,
    isReply: boolean,
    replyId: string
  ) => {
    try {
      const result = await toggleCommentLike(commentId);
      if ("message" in result) {
        throw new Error(String(result.message));
      }
      // Cập nhật trạng thái like trong danh sách bình luận
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (isReply) {
            // Cập nhật reply
            if (comment.Replies) {
              comment.Replies = comment.Replies.map((reply) =>
                reply.id === replyId
                  ? {
                    ...reply,
                    isLiked: result.isLiked,
                    likeCount: result.likeCount,
                  }
                  : reply
              );
            }
            return comment;
          } else {
            // Cập nhật comment
            return comment.id === commentId
              ? {
                ...comment,
                isLiked: result.isLiked,
                likeCount: result.likeCount,
              }
              : comment;
          }
        })
      );
    } catch (err) {
      console.error("Lỗi khi like bình luận:", err);
      error("Lỗi", "Không thể cập nhật trạng thái like.");
    }
  };

  //  HÀM XỬ LÝ THEO DÕI
  const handleToggleFollow = useCallback(async (user, isFollow) => {
    if (isGuest) {
      info("Thông báo", "Hãy đăng nhập để sử dụng tính năng này.");
      return;
    }
    if (!user || !currentUserId) return;
    if (user.id === currentUserId) return; // Không cho phép follow chính mình

    setIsFollowingPending(true);
    if (isFollow) {
      await handleUnfollow(user);
    } else {
      await handleFollow(user);
    }
    setIsFollowingPending(false);
  }, [profile, currentUserId]);

  const handleFollow = useCallback(async (user) => {
    try {
      const response = await FollowUser(user.id);
      if (response.success) {
        setFollowees([...followees, response.data]);
        if (user.id === profile.id) {
          setProfile((prev) => ({ ...prev, followerCount: prev.followerCount + 1 }));
        }
      }
    } catch (err) {
      error("Lỗi", "Không thể theo dõi người dùng: " + err.message);
    }
  }, [profile]);

  const handleUnfollow = useCallback(async (user) => {
    try {
      const payload = {
        followeeId: user.id,
        followerId: currentUserId,
      }
      const response = await UnfollowUser(payload);
      if (response.success) {
        removeFollowee(payload.followeeId);
        if (user.id === profile.id) {
          setProfile((prev) => ({ ...prev, followerCount: prev.followerCount - 1 }));
        }
      }
    } catch (error) {
      error("Lỗi", "Không thể hủy theo dõi người dùng." + error.message);
    }
  }, [profile]);

  // HÀM XỬ LÝ MỞ Follow MODAL
  const handleOpenFollowModal = (type: "followers" | "following") => {
    if (type === "followers") {
      setFollowListType("followers");
      setFollowListData(followersOfProfile);
    } else {
      setFollowListType("following");
      setFollowListData(followeesOfProfile);
    }
    setFollowModalVisible(true);
  };

  const handleCloseFollowModal = () => {
    setFollowModalVisible(false);
  };

  // HÀM XỬ LÝ RE-SHARE
const openReShare = (post: any) => {
  setReShareTargetPost(post);
  setReShareCaption("");
  setReShareModalVisible(true);
};

const closeReShareModal = () => {
  if (isSharing) return;
  setReShareModalVisible(false);
  setReShareCaption("");
  setReShareTargetPost(null);
};

const handleShare = async () => {
  if (!reShareTargetPost || isSharing) return;

  setIsSharing(true);
  try {
    const result = await sharePost(reShareTargetPost.id, reShareCaption);
    
    // Kiểm tra xem có newPost trong result không (success case)
    if ('newPost' in result) {
      // Cập nhật số lượt share trong danh sách
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === reShareTargetPost.id
            ? { ...post, shareCount: String(Number(post.shareCount) + 1) }
            : post
        )
      );
      success("Thành công", "Đã chia sẻ bài viết");
      closeReShareModal();
    } else {
      // Error case - có message và status field
      throw new Error(result.status === 'error' ? result.message : "Không thể chia sẻ bài viết");
    }
  } catch (error) {
    console.error("Lỗi khi chia sẻ bài viết:", error);
    error("Lỗi", error.message || "Đã xảy ra lỗi khi chia sẻ bài viết");
  } finally {
    setIsSharing(false);
  }
};

  const renderProfileHeader = () => {
    if (!profile) return null;

    const textMuted = "text-gray-600 dark:text-gray-400";
    const textPrimary = "text-black dark:text-white";

    return (
      <View className="bg-gray-50 dark:bg-[#0E0C1F]">
        {/* KHỐI THÔNG TIN CƠ BẢN: Avatar, Tên, Username */}
        <View className="px-4 pt-4">
          <View className="flex-row items-start mb-4">
            {/* Avatar */}
            <Image
              source={{
                uri: profile.avatarUrl || "https://via.placeholder.com/150",
              }}
              className="w-24 h-24 rounded-full mr-4 bg-gray-300 border-2  border-emerald-400 dark:border-[#0E0C1F]"
            />

            <View className="flex-1 justify-start pt-2">
              {/* Tên và Username */}
              <Text className={`text-2xl font-extrabold ${textPrimary} mt-1`}>
                {profile.fullName || profile.username || "Người dùng"}
              </Text>
              <Text className={`text-base ${textMuted} mb-3`}>
                @{profile.username}
              </Text>
            </View>
          </View>

          {/* Tiểu sử */}
          {profile.bio ? (
            <Text className={`text-base ${textPrimary} mb-4 leading-snug`}>
              {profile.bio}
            </Text>
          ) : (
            <Text className={`text-base italic ${textMuted} mb-4`}>
              {isCurrentUserProfile
                ? "Hãy thêm tiểu sử để mọi người hiểu hơn về bạn."
                : "Người dùng này chưa có tiểu sử."}
            </Text>
          )}
        </View>

        {/* KHỐI NÚT HÀNH ĐỘNG: Theo dõi & Nhắn tin/Chỉnh sửa  */}
        <View className="px-4 pb-4">
          {profile.id !== currentUserId ? (
            <View className="flex-row w-full">
              <View className="flex-1">
                <CustomButton
                  title={isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  onPress={() => handleToggleFollow(profile, isFollowing)}
                  iconName={isFollowing ? 'checkmark' : 'add'}
                />
              </View>

              {/* Nút Message/Chat */}
              <View style={{ width: "40%" }}>
                <TouchableOpacity onPress={handleChatPress}
                  className="border border-green-600 rounded-full py-2 px-4 items-center ml-3 active:opacity-70"
                >
                  <Text className="text-green-600 font-bold text-lg text-center">
                    Nhắn tin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-row w-full gap-4">
              <View className="flex-1">
                <TouchableOpacity onPress={() => navigate("EditProfile")}
                  className="border border-green-600 rounded-full py-2 px-4 items-center active:opacity-70"
                >
                  <Text className="text-green-600 font-bold text-lg text-center">
                    Chỉnh sửa hồ sơ
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: "50%" }}>
                <TouchableOpacity onPress={() => (navigation as any).navigate("ConversationsScreen")}
                  className="border border-green-600 rounded-full py-2 px-4 items-center active:opacity-70">
                  <Text className="text-green-600 font-bold text-lg text-center">
                    Danh sách trò chuyện
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* KHỐI STATS (Số liệu Thống kê) */}
        <View
          className={`flex-row justify-around py-3 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0E0C1F]`}
        >
          {/* Posts */}
          <TouchableOpacity
            onPress={() => { }}
            className="items-center p-1 active:opacity-70"
          >
            <Text className={`text-xl font-bold text-indigo-500 text-center`}>
              {posts.length}
            </Text>
            <Text className={`text-sm ${textMuted}`}>Bài đăng</Text>
          </TouchableOpacity>
          {/* Covers */}
          <TouchableOpacity
            onPress={() => { }}
            className="items-center p-1 active:opacity-70"
          >
            <Text className={`text-xl font-bold text-indigo-500 text-center`}>
              {covers.length}
            </Text>
            <Text className={`text-sm ${textMuted}`}>Cover</Text>
          </TouchableOpacity>
          {/* Followers */}
          <TouchableOpacity
            onPress={() => handleOpenFollowModal("followers")}
            className="items-center p-1 active:opacity-70"
          >
            <Text className={`text-xl font-bold ${textPrimary} text-center`}>
              {profile.followerCount || 0}
            </Text>
            <Text className={`text-sm ${textMuted}`}>Người theo dõi</Text>
          </TouchableOpacity>
          {/* Following */}
          <TouchableOpacity
            onPress={() => handleOpenFollowModal("following")}
            className="items-center p-1 active:opacity-70"
          >
            <Text className={`text-xl font-bold ${textPrimary} text-center`}>
              {profile.followingCount || 0}
            </Text>
            <Text className={`text-sm ${textMuted}`}>Đang theo dõi</Text>
          </TouchableOpacity>
        </View>

        {/* Tiêu đề Bài đăng với Tabs */}
        <View
          className={`pt-4 px-4 border-b border-gray-200 dark:border-gray-700`}
        >
          <Text className={`text-lg font-bold ${textPrimary} pb-2`}>
            {activeTab === "posts" ? "Bài đăng" : "Cover"}
          </Text>
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab("posts")}
              className={`px-4 py-2 rounded-full mr-2 ${activeTab === "posts"
                ? "bg-green-500"
                : "bg-gray-200 dark:bg-gray-700"
                }`}
            >
              <Text
                className={`text-sm font-medium ${activeTab === "posts"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                Bài đăng ({posts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("covers")}
              className={`px-4 py-2 rounded-full ${activeTab === "covers"
                ? "bg-green-500"
                : "bg-gray-200 dark:bg-gray-700"
                }`}
            >
              <Text
                className={`text-sm font-medium ${activeTab === "covers"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                Cover ({covers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Nếu đang tải ban đầu
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">
          Đang tải profile...
        </Text>
      </SafeAreaView>
    );
  }

  // Màn hình chính
  return (
    <View className="flex-1 bg-white dark:bg-[#0E0C1F]">
      {/* Floating Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between p-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
          >
            <Icon name="arrow-left" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách bài đăng với Header */}
      <FlatList
        ListHeaderComponent={renderProfileHeader}
        data={activeTab === "posts" ? posts : covers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 80 }}
        renderItem={({ item }) => {
          if (activeTab === "covers") {
            const cover = item as Cover;
            return (
              <CoverItem
                id={cover.id}
                userId={cover.userId}
                User={cover.User}
                uploadedAt={cover.uploadedAt}
                content={cover.content}
                fileUrl={cover.fileUrl}
                heartCount={cover.heartCount}
                isLiked={cover.isLiked}
                originalSongId={cover.originalSongId}
                OriginalSong={cover.OriginalSong}
                onUserPress={
                  cover.User?.id === userId ? undefined : handleUserPress
                }
                onRefresh={handleRefresh}
                onCommentPress={() => openCommentModal(cover.id)}
                onSharePress={() =>
                  Alert.alert("Chia sẻ", "Tính năng chưa phát triển")
                }
                likeCount={cover.heartCount}
                commentCount={0} // Covers don't have commentCount
                isLikedPost={cover.isLiked}
              />
            );
          } else {
            const post = item as PostType;
            const isPostUser = post.userId === currentUserId;
            return (
              <PostItem
                {...post}
                id={Number(post.id)}
                onPostUpdate={(type, value) =>
                  updatePostState(post.id, type, value)
                }
                onCommentPress={() => openCommentModal(post.id)}
                onSharePress={() => openReShare(post)}
                onUserPress={
                  post.User?.id === userId ? undefined : handleUserPress
                }
                onLikeCountPress={handleLikeCountPress}
                onEdit={isPostUser ? () => handleEditPress(post) : undefined}
                onDelete={
                  isPostUser ? () => handleDeletePress(post.id) : undefined
                }
                onHidePost={() => { }}
                isUserPost={isPostUser}
                // Truyền images từ fileUrl
                images={
                  Array.isArray(post.fileUrl) ? post.fileUrl : [post.fileUrl]
                }
                // Truyền musicLink
                musicLink={post.musicLink}
              />
            );
          }
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={() => (
          <View className="p-8 items-center">
            <Text className="text-gray-500 dark:text-gray-400">
              {activeTab === "posts"
                ? "Người dùng này chưa có bài đăng nào."
                : "Người dùng này chưa có cover nào."}
            </Text>
          </View>
        )}
      />

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        comments={comments}
        onAddComment={addComment}
        onCommentLike={handleCommentLike}
        postId={selectedPostId}
        onUserPress={handleUserPress}
        newComment={newComment}
        setNewComment={setNewComment}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        quote={quote}
        setQuote={setQuote}
      />

      {/* FOLLOW LIST MODAL MỚI */}
      <FollowListModal
        data={followListData}
        visible={followModalVisible}
        onClose={handleCloseFollowModal}
        listType={followListType} // 'followers' hoặc 'following'
        handleToggleFollow={handleToggleFollow}
      />

      {/* LIKE MODAL */}
      <LikeModal
        visible={likeModalVisible}
        onClose={handleCloseLikeModal}
        postId={selectedPostIdForLikes || ""}
      />

      {/* EDIT MODAL */}
      {editModalVisible && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-20">
          <View
            className={`w-11/12 p-4 rounded-lg ${colorScheme === "dark" ? "bg-gray-800" : "bg-white"}`}
          >
            <Text className="text-lg font-bold mb-4 text-black dark:text-white">
              Chỉnh sửa bài viết
            </Text>
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              className={`border rounded p-2 mb-4 ${colorScheme === "dark" ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-black"}`}
              style={{ minHeight: 100 }}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={handleCloseEditModal}
                className="px-4 py-2 mr-2"
              >
                <Text className="text-gray-500">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="px-4 py-2 bg-emerald-500 rounded"
              >
                <Text className="text-white">Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* RE-SHARE MODAL */}
      <Modal
        visible={reShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReShareModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 bg-white dark:bg-gray-900 rounded-2xl p-4">
            <Text className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Chia sẻ bài viết
            </Text>
            
            {reShareTargetPost && (
              <View className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Text className="text-gray-700 dark:text-gray-300">
                  {reShareTargetPost.content}
                </Text>
              </View>
            )}

            <TextInput
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="Thêm mô tả của bạn..."
              placeholderTextColor="#9CA3AF"
              value={reShareCaption}
              onChangeText={setReShareCaption}
              multiline
              numberOfLines={3}
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={closeReShareModal}
                disabled={isSharing}
                className="px-4 py-2 rounded-lg mr-2 bg-gray-300 dark:bg-gray-700"
              >
                <Text className="text-gray-800 dark:text-gray-200">Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleShare}
                disabled={isSharing}
                className="px-4 py-2 rounded-lg bg-blue-500"
              >
                {isSharing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium">Chia sẻ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
