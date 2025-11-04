import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import {
  fetchPosts,
  fetchCommentsByPostId,
  createNewComment,
  createNewPost,
  togglePostLike,
  toggleCommentLike,
  updatePost,
  deletePost,
} from "../../services/socialApi";
import useAuthStore from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { useNavigate } from "@/hooks/useNavigate";
import PostItem from "../../components/items/PostItem";
import CommentModal from "../../components/modals/CommentModal";
import LikeModal from "../../components/modals/LikeModal";
import NewPostCreator from "../../components/items/NewPostItem";

const SocialScreen = () => {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const { navigate } = useNavigate();

  // State cho New Post Creator
  const [newPostText, setNewPostText] = useState("");
  const [selectedMediaAssets, setSelectedMediaAssets] = useState<any[]>([]); //  Lưu trữ expo assets cho preview và upload
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null); // ID bài hát đính kèm
  const [isUploading, setIsUploading] = useState(false); // Trạng thái upload file

  // State cho Comment Modal
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<any | null>(null); // Dùng state cho reply
  const [quote, setQuote] = useState<any | null>(null); // Dùng state cho quote
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); // Post ID hiện tại trong modal comment

  const [isRefreshing, setIsRefreshing] = useState(false); // Refresh screen

  // State cho Like Modal
  const [likeModalVisible, setLikeModalVisible] = useState(false); // Hiển thị/ẩn modal like
  const [selectedPostIdForLikes, setSelectedPostIdForLikes] = useState<
    string | null
  >(null); // Post ID hiện tại trong modal like

  // State cho search
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);

  // Helper function để format thời gian
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày`;
  };

  // Hàm map dữ liệu bài đăng từ API về định dạng local
  const mapApiPostToLocal = (apiPost: any) => ({
    id: apiPost.id,
    userId: apiPost.userId,
    User: apiPost.User || {
      id: apiPost.userId,
      avatarUrl: "",
      username: "Anonymous",
      fullName: "Anonymous",
    },
    uploadedAt: apiPost.uploadedAt,
    content: apiPost.content,
    fileUrl: apiPost.fileUrl,
    heartCount: apiPost.heartCount,
    commentCount: apiPost.commentCount,
    shareCount: apiPost.shareCount,
    isLiked: apiPost.isLiked,
    songId: apiPost.songId,
    avatarUrl: apiPost.User?.avatarUrl || "",
    username: apiPost.User?.username || "Anonymous",
    fullName: apiPost.User?.fullName || "Anonymous",
    groupName: "",
    time: formatTime(apiPost.uploadedAt),
    contentText: apiPost.content,
    images: Array.isArray(apiPost.fileUrl)
      ? apiPost.fileUrl
      : apiPost.fileUrl
        ? [apiPost.fileUrl]
        : [],
    musicLink: apiPost.songId ? `Song ID: ${apiPost.songId}` : "",
    isOnline: false,
    comments: [],
  });

  // Hàm xử lý khi nhấn vào user avatar
  const handleUserPress = useCallback(
    (targetUserId: number) => {
      if (!targetUserId) {
        Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
        return;
      }
      navigate("ProfileSocialScreen", { userId: targetUserId });
    },
    [navigate]
  );

  // logic tải bài đăng vào hàm useCallback
  const loadPosts = useCallback(async () => {
    try {
      const apiPosts = await fetchPosts();
      const mappedPosts = apiPosts.map(mapApiPostToLocal);
      setPosts(mappedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Lỗi", "Không thể tải bài đăng");
    }
  }, []);

  // Hàm xử lý khi vuốt xuống làm mới
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true); // Bắt đầu trạng thái làm mới
    await loadPosts(); // Gọi hàm tải bài đăng
    setIsRefreshing(false); // Kết thúc trạng thái làm mới
  }, [loadPosts]);

  // useEffect để tải bài đăng lần đầu
  useEffect(() => {
    setLoading(true);
    loadPosts().finally(() => setLoading(false));
  }, [loadPosts]);

  // useEffect để lọc bài đăng khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) =>
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.fullName &&
            post.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const handleSelectMedia = async () => {
    if (isUploading) return;

    // Yêu cầu cấp quyền
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
        allowsMultipleSelection: true, // BẬT CHẾ ĐỘ CHỌN NHIỀU
      });

      if (result.canceled) {
        return;
      }
      // Lưu trữ toàn bộ assets để preview và upload
      setSelectedMediaAssets((prevAssets) => [...prevAssets, ...result.assets]);
    } catch (e) {
      console.error("Lỗi khi chọn media:", e);
      Alert.alert("Lỗi", "Không thể chọn media.");
    }
  }; 

  // Hàm thêm bài đăng mới
  const addPost = async () => {
    // Kiểm tra điều kiện đăng bài (ít nhất phải có Content HOẶC Media)
    if (newPostText.trim() === "" && selectedMediaAssets.length === 0) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung hoặc chọn ảnh/video.");
      return;
    }
    try {
      setIsUploading(true);
      // UPLOAD MEDIA NẾU CÓ
      let fileUrlsToSend = null;
      if (selectedMediaAssets.length > 0) {
        const uploadResult = await UploadMultipleFile(selectedMediaAssets);
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
        fileUrlsToSend = uploadResult.data.data.map((item: any) => item.url);
      }

      // CHUẨN BỊ PAYLOAD CHO API BACKEND
      const content = newPostText.trim();
      const songId = selectedSongId; // ID bài hát đính kèm (có thể là null)

      // GỌI API TẠO BÀI ĐĂNG
      const apiPost = await createNewPost(content, fileUrlsToSend, songId);

      // MAP KẾT QUẢ VÀ CẬP NHẬT STATE
      const newPost = mapApiPostToLocal(apiPost);
      setPosts([newPost, ...posts]);

      // RESET INPUTS
      setNewPostText("");
      setSelectedMediaAssets([]);
      setSelectedSongId(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error("Lỗi khi tạo bài đăng:", error);
      Alert.alert(
        "Lỗi Đăng Bài",
        error.response?.data?.error || "Không thể tạo bài đăng."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // HÀM CẬP NHẬT POSTS: Được gọi từ PostItem
  const updatePostState = (id, type, value) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === id) {
          if (type === "heartCount") {
            // Logic cập nhật heart count trong state gốc với giá trị mới từ API
            return { ...post, heartCount: value };
          } else if (type === "comment") {
            return {
              ...post,
              commentCount: (post.commentCount || 0) + (value || 0),
            };
          } else if (type === "share") {
            return {
              ...post,
              shareCount: (post.shareCount || 0) + (value || 0),
            };
          }
        }
        return post;
      })
    );
  };

  // Hàm xử lý chỉnh sửa bài viết
  const handleEditPost = async (
    postId: string,
    newContent: string,
    newFileUrls: string[] | null,
    newSongId: number | null
  ) => {
    try {
      const updatedPost = await updatePost(
        postId,
        newContent,
        newFileUrls,
        newSongId
      );
      if ("message" in updatedPost) {
        throw new Error(updatedPost.message);
      }
      // Cập nhật state với bài viết đã chỉnh sửa
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                content: newContent,
                fileUrl: newFileUrls,
                songId: newSongId,
              }
            : post
        )
      );
      Alert.alert("Thành công", "Bài viết đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa bài viết:", error);
      Alert.alert("Lỗi", "Không thể cập nhật bài viết.");
    }
  };

  // Hàm xử lý xóa bài viết
  const handleDeletePost = async (postId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa bài viết này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await deletePost(postId);
            if ("message" in result) {
              throw new Error(result.message);
            }
            // Xóa bài viết khỏi state
            setPosts((prevPosts) =>
              prevPosts.filter((post) => post.id !== postId)
            );
            Alert.alert("Thành công", "Bài viết đã được xóa.");
          } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            Alert.alert("Lỗi", "Không thể xóa bài viết.");
          }
        },
      },
    ]);
  };

  // Chức năng Comment Modal
  // Dùng để tải comments khi modal mở
  const loadComments = async (postId: string) => {
    try {
      const fetchedComments = await fetchCommentsByPostId(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: fetchedComments } : post
        )
      );
      return fetchedComments;
    } catch (e) {
      console.error("Lỗi tải comments:", e);
      Alert.alert("Lỗi", "Không thể tải bình luận cho bài viết này.");
      return [];
    }
  };

  // Mở modal comment
  const openCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);

    // Tải comments ngay khi modal mở
    loadComments(postId);
  };

  // Đóng modal comment
  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
  };

  // Hàm hủy trả lời
  const cancelReplyOrQuote = () => {
    setReplyTo(null);
    setQuote(null);
  };

  // Hàm set reply/quote
  const handleSetReply = (comment: any) => {
    setReplyTo(comment);
    setQuote(null);
  };

  const handleSetQuote = (comment: any) => {
    setQuote(comment);
    setReplyTo(null);
  };

  // Hàm thêm comment với optimistic update
  const addComment = async (text: string, parentId: string | null) => {
    // Lấy thông tin người dùng hiện tại từ store để tự tạo comment object
    const currentUser = useAuthStore.getState().user;

    if (!selectedPostId || !text.trim() || !currentUser) return;

    // Khởi tạo một đối tượng comment tạm thời để hiển thị ngay lập tức
    const optimisticComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      postId: selectedPostId,
      content: text.trim(),
      parentId: parentId,
      commentedAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
      User: {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        fullName: currentUser.fullName,
      },
      Replies: [],
      quote: quote
        ? { username: quote.User?.username, content: quote.content }
        : undefined,
    };

    // CẬP NHẬT UI TỨC THỜI
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === selectedPostId) {
          let updatedComments = [...(post.comments || [])];

          if (parentId) {
            // LÀ TRẢ LỜI (Reply): Tìm comment cha và thêm vào Replies
            updatedComments = updatedComments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  Replies: [...(comment.Replies || []), optimisticComment],
                };
              }
              return comment;
            });
          } else {
            // LÀ BÌNH LUẬN CHA: Thêm vào đầu danh sách comments
            updatedComments = [optimisticComment, ...updatedComments];
          }
          return {
            ...post,
            commentCount: (post.commentCount || 0) + 1,
            comments: updatedComments,
          };
        }
        return post;
      })
    );

    // Dọn dẹp Input ngay lập tức
    setNewComment("");
    cancelReplyOrQuote();

    try {
      // GỌI API TẠO COMMENT
      const apiComment = await createNewComment(
        selectedPostId,
        text.trim(),
        parentId
      );

      if ("message" in apiComment) {
        throw new Error(apiComment.message);
      }

      // CẬP NHẬT LẠI ID CHÍNH THỨC VÀ DỮ LIỆU TỪ SERVER
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === selectedPostId) {
            let updatedComments = [...(post.comments || [])];
            // Tìm và thay thế comment tạm thời bằng comment chính thức
            const updateCommentArray = (arr) =>
              arr.map((c) => {
                if (c.id === optimisticComment.id) {
                  return {
                    ...apiComment,
                    User: c.User,
                    Replies: apiComment.Replies || c.Replies,
                  };
                }
                // Nếu là comment cha, tìm trong Replies của nó
                if (c.Replies) {
                  return { ...c, Replies: updateCommentArray(c.Replies) };
                }
                return c;
              });

            return {
              ...post,
              comments: updateCommentArray(updatedComments),
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      Alert.alert("Lỗi", "Gửi bình luận thất bại. Đã hoàn tác.");

      // ROLLBACK nếu API thất bại (Xóa comment tạm thời khỏi UI)
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === selectedPostId) {
            const rollbackCommentArray = (arr) =>
              arr
                .filter((c) => c.id !== optimisticComment.id)
                .map((c) => {
                  if (c.Replies) {
                    return { ...c, Replies: rollbackCommentArray(c.Replies) };
                  }
                  return c;
                });

            return {
              ...post,
              commentCount: (post.commentCount || 0) - 1,
              comments: rollbackCommentArray(post.comments || []),
            };
          }
          return post;
        })
      );
    }
  };

  // Hàm cập nhật like cho comment với optimistic update
  const updateCommentLike = async (postId, commentId, isReply, replyId) => {
    // Tạm thời bỏ qua API cho Reply, chỉ xử lý Comment Cha
    if (isReply) {
      Alert.alert(
        "Thông báo",
        "Chức năng thích trả lời (Reply) chưa được triển khai API."
      );
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const comment = post.comments.find((c) => c.id === commentId);
    if (!comment) return;

    const prevIsLiked = comment.isLiked;
    const prevLikeCount = comment.likeCount;
    const newIsLikedOptimistic = !prevIsLiked;
    const likeChangeOptimistic = newIsLikedOptimistic ? 1 : -1;

    // 1. Optimistic Update: Cập nhật UI tạm thời
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === commentId) {
                return {
                  ...c,
                  isLiked: newIsLikedOptimistic,
                  likeCount: prevLikeCount + likeChangeOptimistic,
                };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );

    try {
      // 2. GỌI API MỚI
      const result = await toggleCommentLike(commentId);

      if ("message" in result) {
        throw new Error(result.message);
      }

      // 3. Cập nhật trạng thái chính thức từ Server
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    isLiked: result.isLiked, // Dùng kết quả từ API
                    likeCount: result.likeCount, // Dùng kết quả từ API
                  };
                }
                return c;
              }),
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích bình luận:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái thích bình luận.");

      // 4. Rollback nếu thất bại
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    isLiked: prevIsLiked,
                    likeCount: prevLikeCount,
                  };
                }
                return c;
              }),
            };
          }
          return p;
        })
      );
    }
  };

  // Hàm xử lý khi nhấn chia sẻ bài viết
  const handleShare = () => {
    Alert.alert("Chia sẻ", "Chức năng chia sẻ sẽ được triển khai sau.");
  };

  // Mở modal like
  const openLikeModal = (postId: string) => {
    setSelectedPostIdForLikes(postId);
    setLikeModalVisible(true);
  };

  // Đóng modal like
  const closeLikeModal = () => {
    setLikeModalVisible(false);
    setSelectedPostIdForLikes(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-[#0E0C1F]">
      {/* Header (Title + Search) */}
      <View className="px-3 pt-2 pb-1 border-b border-gray-200 dark:border-gray-800">
        {isSearchVisible ? (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setIsSearchVisible(false)}
              className="mr-2"
            >
              <Icon
                name="arrow-left"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <TextInput
              className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 text-black dark:text-white"
              placeholder="Tìm kiếm bài đăng hoặc người dùng..."
              placeholderTextColor={
                colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        ) : (
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-extrabold text-black dark:text-white">
              Social Feed
            </Text>
            <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
              <Icon
                name="search"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={searchQuery.trim() !== "" ? filteredPosts : posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        // Thao tác vuốt xuống để làm mới (Pull-to-Refresh)
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === "dark" ? "#fff" : "#000"}
          />
        }
        contentContainerStyle={{
          paddingBottom: 50, // Thêm padding dưới để tránh bị che bởi Tab Bar
        }}
        // Thêm Header cho FlatList (Sử dụng NewPostCreator)
        ListHeaderComponent={
          <View className="p-3">
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
          </View>
        }
        renderItem={({ item }) => {
          // if (!item.userId && !item.User?.id) {
          //   console.log("LỖI DỮ LIỆU POST THIẾU USER ID:", item);
          // }

          return (
            <View className="mb-4 px-3">
              <PostItem
                {...item}
                postId={item.id}
                onPostUpdate={(type, value) =>
                  updatePostState(item.id, type, value)
                }
                onCommentPress={() => openCommentModal(item.id)}
                onSharePress={handleShare}
                userId={item.userId || item.User?.id}
                onUserPress={handleUserPress}
                onLikeCountPress={openLikeModal}
                onHidePost={(postId) => {
                  setPosts((prevPosts) =>
                    prevPosts.filter((post) => post.id !== postId)
                  );
                }}
                onRefresh={onRefresh}
                onEdit={undefined}
                onDelete={() => handleDeletePost(item.id)}
                isUserPost={item.userId === user?.id}
              />
            </View>
          );
        }}
        // Hiển thị trạng thái Loading/Empty khi danh sách post rỗng
        ListEmptyComponent={
          loading && posts.length === 0 ? (
            <View className="flex-1 justify-center items-center mt-10">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">
                Đang tải bài đăng...
              </Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center mt-10">
              <Icon name="info" size={30} color="#9CA3AF" />
              <Text className="mt-2 text-gray-500 dark:text-gray-400 text-base font-semibold">
                Chưa có bài đăng nào. Hãy là người đầu tiên!
              </Text>
            </View>
          )
        }
      />

      {/* Comment Modal  */}
      <CommentModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        comments={
          posts.find((post) => post.id === selectedPostId)?.comments || []
        }
        onAddComment={addComment}
        onCommentLike={updateCommentLike}
        postId={selectedPostId}
        onUserPress={handleUserPress}
        newComment={newComment}
        setNewComment={setNewComment}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        quote={quote}
        setQuote={setQuote}
      />

      {/* Like Modal */}
      <LikeModal
        visible={likeModalVisible}
        onClose={closeLikeModal}
        postId={selectedPostIdForLikes}
      />
    </SafeAreaView>
  );
};

export default SocialScreen;
