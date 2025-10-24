import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { fetchPosts, fetchCommentsByPostId, createNewComment, createNewPost, togglePostLike, toggleCommentLike } from "../../services/socialApi";
import useAuthStore from "@/store/authStore";
import * as ImagePicker from 'expo-image-picker';
// import { uploadMedia } from '../../services/uploadService';
import { useNavigate } from "@/hooks/useNavigate";
import PostItem from "../../components/items/PostItem";
import CommentModal from "../../components/modals/CommentModal";



const SocialScreen = () => {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<any[]>([]); // Sử dụng any[] nếu Post interface chưa rõ ràng
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const { navigate } = useNavigate();


  // === 🆕 STATES MỚI VÀ ĐÃ ĐƯỢC CHỈNH SỬA ===
  const [newPostText, setNewPostText] = useState("");
  const [postMediaUrls, setPostMediaUrls] = useState<string[]>([]); // 🆕 Lưu trữ Mảng URLs
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null); // ID bài hát đính kèm
  const [isUploading, setIsUploading] = useState(false); // Trạng thái upload file

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<any | null>(null); // Dùng state cho reply
  const [quote, setQuote] = useState<any | null>(null); // Dùng state cho quote
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Helper function để format thời gian (giữ nguyên)
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày`;
  };

  const handleUserPress = useCallback((targetUserId: number) => {
    if (!targetUserId) {
      Alert.alert("Lỗi", "Không tìm thấy ID người dùng.");
      return;
    }
    navigate('ProfileSocialScreen', { userId: targetUserId });
  }, [navigate]);

  // Helper function để map dữ liệu từ API (giữ nguyên, nhưng có thể cần tối ưu hóa logic fileUrl/musicLink)
  const mapApiPostToLocal = (apiPost: any) => ({
    id: apiPost.id,
    userId: apiPost.userId,
    User: apiPost.User || { id: apiPost.userId, avatarUrl: '', username: 'Anonymous', fullName: 'Anonymous' },
    uploadedAt: apiPost.uploadedAt,
    content: apiPost.content,
    fileUrl: apiPost.fileUrl,
    heartCount: apiPost.heartCount,
    commentCount: apiPost.commentCount,
    shareCount: apiPost.shareCount,
    isLiked: apiPost.isLiked,
    songId: apiPost.songId,
    // Additional mapped fields for compatibility
    avatarUrl: apiPost.User?.avatarUrl || '',
    username: apiPost.User?.username || 'Anonymous',
    groupName: '',
    time: formatTime(apiPost.uploadedAt),
    contentText: apiPost.content,
    // SỬA: Sử dụng fileUrl cho images (chấp nhận ảnh/video)
    images: Array.isArray(apiPost.fileUrl) ? apiPost.fileUrl : (apiPost.fileUrl ? [apiPost.fileUrl] : []),
    // SỬA: Sử dụng songId cho musicLink
    musicLink: apiPost.songId ? `🎵 Song ID: ${apiPost.songId}` : '',
    isOnline: false,
    comments: [],
  });



  // useEffect để tải bài đăng (giữ nguyên)
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const apiPosts = await fetchPosts();
        const mappedPosts = apiPosts.map(mapApiPostToLocal);
        setPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Lỗi', 'Không thể tải bài đăng');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSelectMedia = async () => {
    if (isUploading) return;

    // Yêu cầu cấp quyền (giữ nguyên)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh để tiếp tục.");
      return;
    }

    try {
      setIsUploading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true, // 👈 BẬT CHẾ ĐỘ CHỌN NHIỀU
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      // 🆕 Lấy TẤT CẢ URI từ mảng assets
      const newUris = result.assets.map(asset => asset.uri);

      // ⚠️ LOGIC UPLOAD: Bạn cần lặp qua newUris và upload từng file lên server
      // Ví dụ tạm thời: Lưu URI cục bộ vào state (Bạn cần thay bằng logic upload thật)

      // Nếu dùng logic upload thật:
      // const uploadedUrls = await Promise.all(newUris.map(uri => uploadMedia(uri)));
      // setPostMediaUrls(prevUrls => [...prevUrls, ...uploadedUrls]); 

      // Nếu dùng logic URI cục bộ:
      setPostMediaUrls(prevUrls => [...prevUrls, ...newUris]);

      Alert.alert("Thành công", `Đã chọn ${newUris.length} media.`);

    } catch (e) {
      console.error("Lỗi khi chọn/tải media:", e);
      Alert.alert("Lỗi", "Không thể chọn media.");
    } finally {
      setIsUploading(false);
    }
  };
  // Hàm addPost đã được sửa lỗi gọi API
  const addPost = async () => {
    // 1. Kiểm tra điều kiện đăng bài (ít nhất phải có Content HOẶC Media)
    if (newPostText.trim() === "" && postMediaUrls.length === 0) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung hoặc chọn ảnh/video.");
      return;
    }

    try {
      // 2. CHUẨN BỊ PAYLOAD CHO API BACKEND
      const content = newPostText.trim();
      const fileUrlsToSend = postMediaUrls.length > 0 ? postMediaUrls : null;
      const songId = selectedSongId; // ID bài hát đính kèm (có thể là null)

      // 3. GỌI API TẠO BÀI ĐĂNG (ĐÃ GỬI ĐỦ 3 THAM SỐ)
      const apiPost = await createNewPost(content, fileUrlsToSend, songId);

      // 4. MAP KẾT QUẢ VÀ CẬP NHẬT STATE
      const newPost = mapApiPostToLocal(apiPost);
      setPosts([newPost, ...posts]);

      // 5. RESET INPUTS
      setNewPostText("");
      setPostMediaUrls([]); // Reset URL media
      setSelectedSongId(null); // Reset Song ID
      Keyboard.dismiss();

    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      Alert.alert('Lỗi Đăng Bài', error.response?.data?.error || 'Không thể tạo bài đăng.');
    }
  };

  // HÀM CẬP NHẬT POSTS: Được gọi từ PostItem (giữ nguyên)
  const updatePost = (id, type, value) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === id) {
          if (type === "like") {
            // Logic cập nhật like count trong state gốc
            return { ...post, likeCount: (post.likeCount || 0) + (value || 0) };
          } else if (type === "comment") {
            return { ...post, commentCount: (post.commentCount || 0) + (value || 0) };
          } else if (type === "share") {
            return { ...post, shareCount: (post.shareCount || 0) + (value || 0) };
          }
        }
        return post;
      })
    );
  };

  // Chức năng Comment Modal (giữ nguyên)
  // Dùng để tải comments khi modal mở
  const loadComments = async (postId: string) => {
    try {
      const fetchedComments = await fetchCommentsByPostId(postId);

      // 💡 CẬP NHẬT TRỰC TIẾP comments vào post TƯƠNG ỨNG trong state posts
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: fetchedComments } : post
        )
      );
      return fetchedComments;
    } catch (e) {
      console.error('Lỗi tải comments:', e);
      Alert.alert('Lỗi', 'Không thể tải bình luận cho bài viết này.');
      return [];
    }
  };
  const openCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);

    // Tải comments ngay khi modal mở
    loadComments(postId);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
  };

  // Hàm hủy trả lời hoặc trích dẫn
  const cancelReplyOrQuote = () => {
    setReplyTo(null);
    setQuote(null);
  };

  // Hàm set reply/quote (sẽ được truyền vào CommentModal)
  const handleSetReply = (comment: any) => {
    setReplyTo(comment);
    setQuote(null);
  };

  const handleSetQuote = (comment: any) => {
    setQuote(comment);
    setReplyTo(null);
  };

  const addComment = async (text: string, parentId: string | null) => {
    // ⚠️ Đảm bảo đã khai báo và có sẵn: selectedPostId, setNewComment, cancelReplyOrQuote
    // Lấy thông tin người dùng hiện tại từ store để tự tạo comment object
    const currentUser = useAuthStore.getState().user;

    if (!selectedPostId || !text.trim() || !currentUser) return;

    // Khởi tạo một đối tượng comment tạm thời để hiển thị ngay lập tức
    const optimisticComment = {
      // Tên trường phải khớp với interface Comment (trong socialApi.tsx)
      id: Date.now().toString(), // ID tạm thời, sẽ được thay thế sau
      userId: currentUser.id,
      postId: selectedPostId,
      content: text.trim(),
      parentId: parentId,
      commentedAt: new Date().toISOString(), // Thời gian hiện tại
      likeCount: 0,
      isLiked: false,
      // Đối tượng User được lồng (phải viết hoa U theo Alias Sequelize)
      User: {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        // Thêm các trường User khác nếu cần
      },
      // Đối tượng Replies (phải viết hoa R theo Alias Sequelize)
      Replies: [],
      // Tùy chỉnh hiển thị quote nếu đang trong chế độ quote
      quote: quote
        ? { username: quote.User?.username, content: quote.content }
        : undefined,
    };

    // 1. CẬP NHẬT UI TỨC THỜI (OPTIMISTIC UPDATE)
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === selectedPostId) {

          let updatedComments = [...(post.comments || [])];

          if (parentId) {
            // LÀ TRẢ LỜI (Reply): Tìm comment cha và thêm vào Replies
            updatedComments = updatedComments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  // Thêm vào mảng Replies (VIẾT HOA R)
                  Replies: [...(comment.Replies || []), optimisticComment]
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
      // 2. GỌI API TẠO COMMENT
      const apiComment = await createNewComment(selectedPostId, text.trim(), parentId);

      // 3. CẬP NHẬT LẠI ID CHÍNH THỨC VÀ DỮ LIỆU TỪ SERVER
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === selectedPostId) {
            let updatedComments = [...(post.comments || [])];

            // Tìm và thay thế comment tạm thời bằng comment chính thức
            const updateCommentArray = (arr) => arr.map(c => {
              if (c.id === optimisticComment.id) {
                return { ...apiComment, User: c.User, Replies: apiComment.Replies || c.Replies };
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
      console.error('Lỗi khi gửi bình luận:', error);
      Alert.alert('Lỗi', 'Gửi bình luận thất bại. Đã hoàn tác.');

      // 4. ROLLBACK nếu API thất bại (Xóa comment tạm thời khỏi UI)
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === selectedPostId) {

            const rollbackCommentArray = (arr) => arr.filter(c => c.id !== optimisticComment.id).map(c => {
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

  const updateCommentLike = async (postId, commentId, isReply, replyId) => {
    // ⚠️ Tạm thời bỏ qua API cho Reply, chỉ xử lý Comment Cha
    if (isReply) {
      Alert.alert("Thông báo", "Chức năng thích trả lời (Reply) chưa được triển khai API.");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const comment = post.comments.find(c => c.id === commentId);
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
      console.error('Lỗi khi thích/bỏ thích bình luận:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thích bình luận.');

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

  const handleShare = () => {
    Alert.alert("Chia sẻ", "Chức năng chia sẻ sẽ được triển khai sau.");
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-[#0E0C1F] px-3 pt-10">
      {/* Input đăng bài mới */}
      <View className="flex-row items-start mb-2 border-b pb-4 border-gray-300 dark:border-gray-700">
        {/* Ảnh đại diện User */}
        <Image
          source={{ uri: user?.avatarUrl }}
          className="w-10 h-10 rounded-full mr-2"
        />

        <View className="flex-1 mb-5">
          {/* 1. INPUT NỘI DUNG */}
          <TextInput
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
            value={newPostText}
            onChangeText={setNewPostText}
            className={`flex-1 border-b px-2 pb-2 text-base ${colorScheme === "dark"
                ? "border-gray-600 bg-transparent text-white"
                : "border-gray-300 bg-transparent text-black"
              }`}
            multiline
            style={{ minHeight: 40 }}
          />

          {/* 2. HIỂN THỊ MEDIA ĐÃ CHỌN (Sử dụng ScrollView cho Gallery ngang) */}
          {postMediaUrls.length > 0 ? (
            <View className="mt-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                {postMediaUrls.map((url, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image
                      source={{ uri: url }}
                      style={{ width: 100, height: 100, borderRadius: 8, resizeMode: 'cover' }}
                    />
                    {/* Nút Xóa (Hủy chọn từng ảnh) */}
                    <TouchableOpacity
                      onPress={() => setPostMediaUrls(postMediaUrls.filter((_, i) => i !== index))}
                      className="absolute top-[-8] right-[-8] p-1 rounded-full bg-red-500 border-2 border-white"
                    >
                      <Icon name="x" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Đã chọn: {postMediaUrls.length} ảnh/video.
              </Text>
            </View>
          ) : null}

          {/* 3. HIỂN THỊ SONG ID ĐÃ CHỌN */}
          {selectedSongId ? (
            <View className="mt-2 p-2 bg-purple-100 dark:bg-purple-900 rounded flex-row items-center">
              <Icon name="headphones" size={16} color="#8b5cf6" />
              <Text className="ml-2 text-purple-700 dark:text-purple-300 flex-1" numberOfLines={1}>
                Đính kèm Bài hát ID: {selectedSongId}
              </Text>
              <TouchableOpacity onPress={() => setSelectedSongId(null)}>
                <Icon name="x" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : null}


          <View className="flex-row justify-between items-center mt-2">
            {/* NÚT CHỌN MEDIA (CALLS handleSelectMedia) */}
            <TouchableOpacity onPress={handleSelectMedia} disabled={isUploading} className="flex-row items-center p-2 rounded">
              {isUploading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <>
                  <Icon name="image" size={20} color="#3b82f6" />
                </>
              )}
            </TouchableOpacity>

            {/* NÚT ĐÍNH KÈM NHẠC (CALLS logic để gán/hủy selectedSongId) */}
            <TouchableOpacity
              // Giả định: Khi bấm, gán/hủy một ID mẫu (thay thế bằng Modal chọn nhạc)
              onPress={() => setSelectedSongId(selectedSongId ? null : 42)}
              className="flex-row items-center"
            >
              <Icon name="headphones" size={20} color="#8b5cf6" />
              <Text className="ml-2 text-purple-600 dark:text-purple-400">
                {selectedSongId}
              </Text>
            </TouchableOpacity>

            {/* 4. NÚT ĐĂNG BÀI (CALLS addPost) */}
            <TouchableOpacity
              onPress={addPost}
              // Điều kiện đăng bài: Phải có Text HOẶC Media URL VÀ không đang upload
              disabled={(!newPostText.trim() && !postMediaUrls) || isUploading}
              className={`ml-auto px-4 py-2 rounded-full ${(!newPostText.trim() && !postMediaUrls) || isUploading ? "bg-gray-400" : "bg-green-600"
                }`}
            >
              <Text className="font-bold text-white">Đăng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Danh sách bài đăng */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2 text-gray-600 dark:text-gray-400">Đang tải bài đăng...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            // 💡 HÃY THÊM DÒNG LOG NÀY
            if (!item.userId && !item.User?.id) {
              console.log('❌ LỖI DỮ LIỆU POST THIẾU USER ID:', item);
            }
            // ----------------------------

            return (
              <PostItem
                {...item} // ✅ TRUYỀN TẤT CẢ PROPS (Bao gồm fileUrl là chuỗi JSON)
                postId={item.id} // Thừa, vì id đã có trong {...item}
                onPostUpdate={(type, value) => updatePost(item.id, type, value)}
                onCommentPress={() => openCommentModal(item.id)}
                onSharePress={handleShare}
                userId={item.userId || item.User?.id} // Đảm bảo userId là số
                onUserPress={handleUserPress}
              />
            )
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Comment Modal */}
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
        // ✅ TRUYỀN PROPS MỚI
        newComment={newComment}
        setNewComment={setNewComment}
        replyTo={replyTo}
        setReplyTo={setReplyTo} // Truyền setter
        quote={quote}
        setQuote={setQuote} // Truyền setter

      />
    </View>
  );
};

export default SocialScreen;