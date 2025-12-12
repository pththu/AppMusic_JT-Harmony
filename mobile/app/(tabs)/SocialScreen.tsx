import { useAuthData } from "@/hooks/useAuthData";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useNavigate } from "@/hooks/useNavigate";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { FindTrackById } from "@/services/musicService";
import useAuthStore from "@/store/authStore";
import { useFollowStore } from "@/store/followStore";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import CoverItem from "../../components/items/CoverItem";
import NewPostCreator from "../../components/items/NewPostItem";
import PostItem from "../../components/items/PostItem";
import CommentModal from "../../components/modals/CommentModal";
import LikeModal from "../../components/modals/LikeModal";
import UploadCoverModal from "../../components/modals/UploadCoverModal";
import SearchOverlay from "../../components/search/SearchOverlay";
import { fetchAllCovers } from "../../services/coverService";
import {
  createNewComment,
  createNewPost,
  deletePost,
  fetchCommentsByPostId,
  fetchPosts,
  fetchPostsForGuest,
  sharePost,
  toggleCommentLike
} from "../../services/socialApi";

const SocialScreen = () => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { info, success, error, warning, confirm } = useCustomAlert();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userFollowers = useFollowStore((state) => state.userFollowers);
  const userFollowees = useFollowStore((state) => state.userFollowees);

  const {
    fetchFollowees,
    fetchFollowers
  } = useAuthData();

  // FAB animation value
  const fabScale = useRef(new Animated.Value(1)).current;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // State cho New Post Creator
  const [newPostText, setNewPostText] = useState("");
  const [selectedMediaAssets, setSelectedMediaAssets] = useState<any[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // State cho Comment Modal
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); // Post ID hiện tại trong modal comment

  const [isRefreshing, setIsRefreshing] = useState(false); // Refresh screen

  // State cho Like Modal
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [selectedPostIdForLikes, setSelectedPostIdForLikes] = useState<
    string | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  // State cho tabs
  const [activeTab, setActiveTab] = useState<"posts" | "covers">("posts");
  // State cho Upload Cover Modal
  const [uploadCoverModalVisible, setUploadCoverModalVisible] = useState(false);
  // State cho Options Menu
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  // State cho NewPostCreator Modal
  const [newPostModalVisible, setNewPostModalVisible] = useState(false);
  // State cho Search Overlay
  const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);
  const [reShareModalVisible, setReShareModalVisible] = useState(false);
  const [reShareTargetPost, setReShareTargetPost] = useState<any | null>(null);
  const [reShareCaption, setReShareCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // State cho danh sách covers
  const [covers, setCovers] = useState<any[]>([]);
  const [coversLoading, setCoversLoading] = useState(true);

  const animateFABPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFABPress = () => {
    animateFABPress();
    setOptionsMenuVisible(true);
  };

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

  // tìm theo id trong db
  const findTrackById = async (trackId) => {
    try {
      const response = await FindTrackById(trackId);
      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.log("Lỗi khi tìm bài hát theo ID:", error);
    }
  }

  const mapApiPostToLocal = async (apiPost) => {
    let songNameAndArtists = "";
    let trackData = apiPost.OriginalSong;

    // 1. Ưu tiên dùng OriginalSong
    if (apiPost.OriginalSong && apiPost.OriginalSong.name) {
      const artists = Array.isArray(apiPost.OriginalSong.artists)
        ? apiPost.OriginalSong.artists.map((a) => a.name).join(", ")
        : "";
      songNameAndArtists = `${apiPost.OriginalSong.name}${artists ? " - " + artists : ""}`;
    }
    // 2. Nếu không có OriginalSong nhưng có songId, phải gọi API để lấy
    else if (apiPost.songId) {
      const fetchedTrack = await findTrackById(apiPost.songId);
      if (fetchedTrack) {
        trackData = fetchedTrack;
        const artists = Array.isArray(fetchedTrack.artists)
          ? fetchedTrack.artists.map((a) => a.name).join(", ")
          : "";
        songNameAndArtists = `Bài hát: ${fetchedTrack.name}${artists ? " - " + artists : ""}`;
      }
    }

    return {
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
      musicLink: songNameAndArtists,
      isOnline: false,
      comments: [],
      isCover: apiPost.isCover || false,
      originalSongId: apiPost.originalSongId,
      OriginalSong: trackData,
      originalPost: apiPost.OriginalPost,
    };
  };

  // Hàm xử lý khi nhấn vào user avatar
  const handleUserPress = useCallback(
    (targetUserId: number) => {
      if (!targetUserId) {
        error("Lỗi", "Không tìm thấy ID người dùng.");
        return;
      }
      navigate("ProfileSocialScreen", { userId: targetUserId });
    },
    [navigate]
  );

  // Hàm chọn ảnh
  const handleSelectMedia = async () => {
    if (isUploading) return;

    // Yêu cầu cấp quyền
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      error("Cần quyền truy cập thư viện ảnh để tiếp tục.");
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
      error("Không thể chọn media.");

    }
  };

  // Hàm thêm bài đăng mới
  const addPost = async () => {
    // Kiểm tra điều kiện đăng bài (ít nhất phải có Content HOẶC Media)
    if (newPostText.trim() === "" && selectedMediaAssets.length === 0) {
      warning("Vui lòng nhập nội dung hoặc chọn ảnh/video.");
      return;
    }
    try {
      setIsUploading(true);
      info("Đang xử lý", "Đang đăng bài viết của bạn, vui lòng đợi...");
      // UPLOAD MEDIA NẾU CÓ
      let fileUrlsToSend = null;
      if (selectedMediaAssets.length > 0) {
        const uploadResult = await UploadMultipleFile(selectedMediaAssets);
        if (!uploadResult.success) {
          error("Upload thất bại: " + uploadResult.message);
          return;
        }
        if (
          !uploadResult.data ||
          !uploadResult.data.data ||
          !Array.isArray(uploadResult.data.data)
        ) {
          error("Dữ liệu upload không hợp lệ từ server");

          return;
        }
        fileUrlsToSend = uploadResult.data.data.map((item: any) => item.url);
      }

      // CHUẨN BỊ PAYLOAD CHO API BACKEND
      const content = newPostText.trim();
      const songId = selectedSongId; // ID bài hát đính kèm (có thể là null)

      // GỌI API TẠO BÀI ĐĂNG
      const apiPost = await createNewPost(content, fileUrlsToSend, songId);

      // Kiểm tra lỗi từ API
      if (!apiPost || (apiPost as any).status === 'error') {
        throw new Error((apiPost as any)?.message || 'Không thể tạo bài đăng');
      }

      // Map bài đăng mới về format local (hàm async)
      const newPost = await mapApiPostToLocal(apiPost);
      console.log("Mapped Post:", newPost);

      // Cập nhật state: thêm bài mới lên đầu danh sách với dữ liệu thực từ server
      setPosts(prevPosts => [newPost, ...prevPosts]);

      // RESET INPUTS
      setNewPostText("");
      setSelectedMediaAssets([]);
      setSelectedSongId(null);
      Keyboard.dismiss();

      // Đóng modal NewPostCreator
      setNewPostModalVisible(false);

      // Thông báo thành công
      success("Thành công", "Bài viết của bạn đã được đăng thành công!");

    } catch (err) {
      console.error("Lỗi khi tạo bài đăng:", err);
      const errorMessage = err.response?.data?.error || err.message || "Không thể tạo bài đăng.";
      error("Lỗi Đăng Bài", errorMessage);
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
  // const handleEditPost = async (
  //   postId: string,
  //   newContent: string,
  //   newFileUrls: string[] | null,
  //   newSongId: number | null
  // ) => {
  //   try {
  //     const updatedPost = await updatePost(
  //       postId,
  //       newContent,
  //       newFileUrls,
  //       newSongId
  //     );
  //     if ("message" in updatedPost) {
  //       throw new Error(updatedPost.message);
  //     }
  //     // Cập nhật state với bài viết đã chỉnh sửa
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId
  //           ? {
  //             ...post,
  //             content: newContent,
  //             fileUrl: newFileUrls,
  //             songId: newSongId,
  //           }
  //           : post
  //       )
  //     );
  //     success("Bài viết đã được cập nhật.");
  //   } catch (error) {
  //     console.error("Lỗi khi chỉnh sửa bài viết:", error);
  //     error("Lỗi", "Không thể cập nhật bài viết.");
  //   }
  // };


  // Hàm xử lý xóa bài viết
  const handleDeletePost = async (postId) => {
    confirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      async () => {
        try {
          setIsUploading(true);

          console.log(postId)
          // Gọi API xóa bài viết
          const response = await deletePost(postId);
          // Kiểm tra kết quả trả về từ API
          if (response.success) {
            // Xóa bài viết khỏi state nếu xóa thành công
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            success("Bài viết đã được xóa thành công!");
          } else {
            console.log(4)
            error("Lỗi", response.message || "Không thể xóa bài viết.");
          }
        } catch (err) {
          console.log(5)
          error("Lỗi", err);
        } finally {
          setIsUploading(false);
        }
      },
      () => {
        console.log("Đã hủy xóa bài viết");
      }
    );
  };

  // Mở modal comment
  const openCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
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

  // Hàm thêm comment
  const addComment = async (text: string, parentId: string | null) => {
    // Lấy thông tin người dùng hiện tại từ store
    const currentUser = useAuthStore.getState().user;

    if (!selectedPostId || !text.trim() || !currentUser) return;

    console.log(text)

    // Khởi tạo một đối tượng comment tạm thởi để hiển thị ngay lập tức
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

    // CẬP NHẬT UI TỨC THỜI - Cập nhật cả posts và covers state
    const updateCommentsInState = (items) => {
      return items.map((item) => {
        if (item.id === selectedPostId) {
          let updatedComments = [...(item.comments || [])];

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
            ...item,
            commentCount: (item.commentCount || 0) + 1,
            comments: updatedComments,
          };
        }
        return item;
      });
    };

    setPosts(updateCommentsInState);
    setCovers(updateCommentsInState);
    setNewComment("");
    cancelReplyOrQuote();

    try {
      // GỌI API TẠO COMMENT
      const apiComment = await createNewComment(
        selectedPostId,
        text.trim(),
        parentId
      );

      // --- SỬA LẠI ĐOẠN NÀY ---
      // Kiểm tra nếu object trả về có status là 'error' thì mới ném lỗi
      // Hoặc kiểm tra nếu không có 'id' (vì comment thành công phải có id)
      if ('status' in apiComment && apiComment.status === 'error') {
        throw new Error(apiComment.message || "Lỗi không xác định");
      }
      // ------------------------

      // CẬP NHẬT LẠI ID CHÍNH THỨC VÀ DỮ LIỆU TỪ SERVER
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === selectedPostId) {
            let updatedComments = [...(post.comments || [])];
            const updateCommentArray = (arr) =>
              arr.map((c) => {
                if (c.id === optimisticComment.id) {
                  return {
                    ...apiComment,
                    User: c.User,
                    Replies: apiComment?.Replies || c.Replies,
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
    } catch (err) {
      console.log(3)
      console.error("Lỗi khi gửi bình luận:", err);
      error("Lỗi", "Gửi bình luận thất bại. Đã hoàn tác.");

      // ROLLBACK nếu API thất bại
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

  // Hàm xử lý khi nhấn chia sẻ bài viết (re-share nội bộ)
  const handleShare = async () => {
    if (!reShareTargetPost) return;
    try {
      setIsSharing(true);
      const caption = reShareCaption.trim();
      const result = await sharePost(String(reShareTargetPost.id), caption);

      if ("message" in result) {
        // Trường hợp lỗi từ API
        if (result.status === "error") {
          error("Lỗi", result.message || "Không thể chia sẻ bài viết.");
        }
        return;
      }

      const { newPost, originalPost } = result;

      // Thêm bài re-share mới vào đầu danh sách
      const mappedNewPost = await mapApiPostToLocal(newPost);
      setPosts((prevPosts) => [mappedNewPost, ...prevPosts]);

      // Cập nhật shareCount cho bài gốc
      if (originalPost && originalPost.id) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === originalPost.id
              ? { ...post, shareCount: originalPost.shareCount }
              : post
          ),
        );
      }
      setReShareModalVisible(false);
      setReShareCaption("");
      setReShareTargetPost(null);

      // Sau khi share thành công, đồng bộ lại danh sách bài đăng với backend
      setLoading(true);
      await loadPosts();
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi chia sẻ bài đăng:", err);
      error("Lỗi", "Không thể chia sẻ bài viết.");
    } finally {
      setIsSharing(false);
    }
  };

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

  // Hàm comment like
  const handleCommentLike = async (
    postId: string,
    commentId: string,
    isReply: boolean,
    replyId: string
  ) => {
    // Update UI
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        const updateComment = (comment: any) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likeCount: comment.isLiked
                ? String(Number(comment.likeCount) - 1)
                : String(Number(comment.likeCount) + 1),
            };
          }
          return comment;
        };

        const updateReply = (comment: any) => {
          if (comment.id === replyId) {
            return {
              ...comment,
              Replies: comment.Replies.map(updateComment),
            };
          }
          return comment;
        };

        return {
          ...p,
          comments: isReply
            ? p.comments.map(updateReply)
            : p.comments.map(updateComment),
        };
      })
    );

    try {
      const result = await toggleCommentLike(commentId);
      if ("message" in result) {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: p.comments.map((comment: any) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likeCount: comment.isLiked
                    ? String(Number(comment.likeCount) + 1)
                    : String(Number(comment.likeCount) - 1),
                };
              }
              return comment;
            }),
          };
        })
      );
    }
  };

  // Hàm tải comments
  const loadComments = async (postId) => {
    try {
      const fetchedComments = await fetchCommentsByPostId(postId);
      const commentsLength = Array.isArray(fetchedComments) ? fetchedComments.length : 0;

      // Cập nhật posts state (cho tab posts)
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) =>
          post.id === postId ? {
            ...post,
            comments: fetchedComments,
            commentCount: commentsLength
          } : post
        );
        return updatedPosts;
      });

      // Cập nhật covers state (cho tab covers)
      setCovers((prevCovers) => {
        const updatedCovers = prevCovers.map((cover) =>
          cover.id === postId ? {
            ...cover,
            comments: fetchedComments,
            commentCount: commentsLength
          } : cover
        );
        return updatedCovers;
      });

      return fetchedComments;
    } catch (e) {
      console.error('Error in loadComments:', e);
      error("Lỗi", "Không thể tải bình luận cho bài viết này." + e.message);
      return [];
    }
  };

  const loadPosts = useCallback(async () => {
    try {
      let apiPosts;
      if (isGuest) {
        apiPosts = await fetchPostsForGuest();
      } else {
        apiPosts = await fetchPosts();
      }

      if (apiPosts.success === false) {
        error("Lỗi", apiPosts.message || "Không thể tải bài đăng từ server.");
        return;
      }
      const mappedPosts = await Promise.all(
        apiPosts.map(mapApiPostToLocal)
      );
      setPosts(mappedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      error("Lỗi", "Không thể tải bài đăng từ server.");
    }
  }, []);

  // useEffect để tải dữ liệu khi component mount và khi activeTab thay đổi
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'covers') {
          await refreshCovers();
        } else {
          await loadPosts();
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // useEffect để lọc bài đăng khi searchQuery thay đổi
  useEffect(() => {
    let filtered = posts;

    // Lọc theo search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.fullName &&
            post.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);


  // Hàm xử lý khi vuốt xuống làm mới
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === 'covers') {
      await refreshCovers();
    } else {
      await loadPosts();
    }
    setIsRefreshing(false);
  }, [activeTab]);

  // Hàm tải lại danh sách covers
  const refreshCovers = useCallback(async () => {
    try {
      setCoversLoading(true);
      const response = await fetchAllCovers();

      // Kiểm tra nếu response có lỗi
      if (response && typeof response === 'object' && 'success' in response && response.success === false) {
        throw new Error((response as any).message || "Không thể tải covers");
      }

      let allCovers;
      if (Array.isArray(response)) {
        allCovers = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        allCovers = (response as any).data;
      } else {
        allCovers = response;
      }
      if (Array.isArray(allCovers) && allCovers.length > 0) {
        // Map covers về đúng định dạng như posts
        const mappedCovers = await Promise.all(allCovers.map(mapApiPostToLocal));
        setCovers(mappedCovers);
      } else {
        setCovers([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách covers:", err);
      error("Lỗi", "Không thể tải danh sách covers. Vui lòng thử lại sau.");
    } finally {
      setCoversLoading(false);
    }
  }, [mapApiPostToLocal]);

  // Hàm xử lý khi cover được đăng thành công
  const handleCoverPosted = useCallback(() => {
    refreshCovers(); // Tải lại danh sách covers
    setUploadCoverModalVisible(false); // Đóng modal
    success("Thành công", "Đăng cover thành công!");
  }, [refreshCovers]);

  useEffect(() => {
    if (userFollowees.length === 0) fetchFollowees(user?.id);
    if (userFollowers.length === 0) fetchFollowers(user?.id);
  })

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-[#0E0C1F]">
      {/* Header (Title + Search) */}
      <View className="px-3 pt-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row items-center">
              {/* Avatar User */}
              <TouchableOpacity onPress={() => navigate("ProfileSocialScreen", { userId: user?.id })}>
                <Image
                  source={{ uri: user?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1762574889/kltn/user_hnoh3o.png' }}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-emerald-500"
                />
              </TouchableOpacity>

              <View className="flex-1">
                <Text className="text-2xl font-extrabold text-black dark:text-white">
                  Khám phá
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Khám phá covers và bài đăng từ cộng đồng
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => setSearchOverlayVisible(true)}>
            <Icon
              name="search"
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === 'covers' ? covers : filteredPosts}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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
        ListHeaderComponent={
          <View className="p-3">
            {/* Enhanced Tab Header */}
            <View className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                {/* Posts Tab */}
                <TouchableOpacity
                  onPress={() => setActiveTab("posts")}
                  className={`flex-1 py-3 px-4 rounded-l-xl justify-center items-center ${activeTab === "posts"
                    ? "bg-emerald-500 dark:bg-emerald-600"
                    : "bg-transparent"
                    }`}
                >
                  <View className="flex-row items-center">
                    <Icon
                      name="edit-3"
                      size={16}
                      color={activeTab === "posts" ? "#fff" : (colorScheme === "dark" ? "#9CA3AF" : "#6B7280")}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className={`text-sm ${activeTab === "posts"
                        ? "text-white font-bold"
                        : "text-gray-600 dark:text-gray-400 font-medium"
                        }`}
                    >
                      Bài đăng
                    </Text>
                  </View>
                  {posts.length > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                      <Text className="text-white text-xs font-bold">
                        {posts.length > 99 ? "99+" : posts.length.toString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="w-px bg-gray-200 dark:bg-gray-700 h-8" />

                {/* Covers Tab */}
                <TouchableOpacity
                  onPress={() => setActiveTab("covers")}
                  className={`flex-1 py-3 px-4 rounded-r-xl justify-center items-center ${activeTab === "covers"
                    ? "bg-emerald-500 dark:bg-emerald-600"
                    : "bg-transparent"
                    }`}
                >
                  <View className="flex-row items-center">
                    <Icon
                      name="music"
                      size={16}
                      color={activeTab === "covers" ? "#fff" : (colorScheme === "dark" ? "#9CA3AF" : "#6B7280")}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className={`text-sm ${activeTab === "covers"
                        ? "text-white font-bold"
                        : "text-gray-600 dark:text-gray-400 font-medium"
                        }`}
                    >
                      Covers/Sáng tác
                    </Text>
                  </View>
                  {covers.length > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                      <Text className="text-white text-xs font-bold">
                        {covers.length > 99 ? "99+" : covers.length.toString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Active Indicator */}
              <View className="flex-row">
                <View
                  className={`h-1 bg-emerald-500 transition-all duration-300 ${activeTab === "posts" ? "flex-1" : "w-0"
                    }`}
                />
                <View
                  className={`h-1 bg-emerald-500 transition-all duration-300 ${activeTab === "covers" ? "flex-1" : "w-0"
                    }`}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          if (activeTab === 'covers') {
            return (
              <CoverItem
                id={item.id}
                userId={item.userId}
                User={item.User}
                uploadedAt={item.uploadedAt}
                content={item.content}
                fileUrl={item.fileUrl}
                heartCount={item.heartCount}
                isLiked={item.isLiked}
                originalSongId={item.originalSongId}
                OriginalSong={item.OriginalSong}
                onUserPress={handleUserPress}
                onRefresh={onRefresh}
                onCommentPress={() => openCommentModal(item.id)}
                onSharePress={() => openReShare(item)}
                onVoteCountPress={openLikeModal}
                likeCount={item.heartCount}
                commentCount={item.commentCount}
                shareCount={item.shareCount}
                isLikedPost={item.isLiked}
              />
            );
          }
          return (
            <>
              {item.isCover ? (
                <CoverItem
                  id={item.id}
                  userId={item.userId}
                  User={item.User}
                  uploadedAt={item.uploadedAt}
                  content={item.content}
                  fileUrl={item.fileUrl}
                  heartCount={item.heartCount}
                  isLiked={item.isLiked}
                  originalSongId={item.originalSongId}
                  OriginalSong={item.OriginalSong}
                  onUserPress={handleUserPress}
                  onRefresh={onRefresh}
                  onCommentPress={() => openCommentModal(item.id)}
                  onSharePress={() => openReShare(item)}
                  onVoteCountPress={openLikeModal}
                  likeCount={item.heartCount}
                  commentCount={item.commentCount}
                  shareCount={item.shareCount}
                  isLikedPost={item.isLiked}
                />
              ) : (
                <PostItem
                  {...item}
                  postId={item.id}
                  songId={item.songId}
                  onPostUpdate={(type, value) =>
                    updatePostState(item.id, type, value)
                  }
                  onCommentPress={() => openCommentModal(item.id)}
                  onSharePress={() => openReShare(item)}
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
                  onDelete={() => handleDeletePost(item?.id)}
                  isUserPost={item.userId === user?.id}
                />
              )}</>
          );
        }}
        // Hiển thị trạng thái Loading/Empty khi danh sách rỗng
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 justify-center items-center mt-10">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">
                {activeTab === 'covers' ? 'Đang tải covers...' : 'Đang tải bài đăng...'}
              </Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center mt-10">
              <Icon name="info" size={30} color="#9CA3AF" />
              <Text className="mt-2 text-gray-500 dark:text-gray-400 text-base font-semibold">
                {activeTab === 'covers' ? 'Chưa có cover nào' : 'Chưa có bài đăng nào. Hãy là người đầu tiên!'}
              </Text>
            </View>
          )
        }
      />

      {/* Floating Action Button */}
      <Animated.View
        className="absolute bottom-24 right-4"
        style={{
          transform: [{ scale: fabScale }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={handleFABPress}
          className="w-14 h-14 bg-emerald-700 rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
      <Modal
        visible={reShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeReShareModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 bg-white dark:bg-gray-900 rounded-2xl p-4">
            <Text className="text-lg font-bold mb-2 text-black dark:text-white">
              Chia sẻ bài viết
            </Text>
            {reShareTargetPost && (
              <View className="mb-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {reShareTargetPost.User?.fullName || reShareTargetPost.fullName}
                </Text>
                {reShareTargetPost.content ? (
                  <Text
                    className="text-sm text-gray-800 dark:text-gray-200"
                    numberOfLines={3}
                  >
                    {reShareTargetPost.content}
                  </Text>
                ) : null}
              </View>
            )}

            <TextInput
              className="min-h-[80px] max-h-32 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-black dark:text-white mb-3"
              placeholder="Thêm chú thích cho bài chia sẻ của bạn..."
              placeholderTextColor={
                colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
              }
              value={reShareCaption}
              onChangeText={setReShareCaption}
              editable={!isSharing}
              multiline
            />

            <View className="flex-row justify-end mt-1">
              <TouchableOpacity
                onPress={closeReShareModal}
                disabled={isSharing}
                className="px-4 py-2 rounded-lg mr-2 bg-gray-300 dark:bg-gray-700"
              >
                <Text className="text-sm font-medium text-black dark:text-white">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                disabled={isSharing}
                className="px-4 py-2 rounded-lg bg-indigo-500 flex-row items-center justify-center"
              >
                {isSharing && (
                  <ActivityIndicator size="small" color="#fff" className="mr-2" />
                )}
                <Text className="text-sm font-medium text-white">
                  Đăng lại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comment Modal  */}
      <CommentModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        comments={
          (activeTab === 'covers'
            ? covers.find((cover) => cover.id === selectedPostId)?.comments
            : posts.find((post) => post.id === selectedPostId)?.comments
          ) || []
        }
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

      {/* Like Modal */}
      <LikeModal
        visible={likeModalVisible}
        onClose={closeLikeModal}
        postId={selectedPostIdForLikes}
      />

      {/* NewPostCreator Modal */}
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

      {/* Search Overlay */}
      <SearchOverlay
        visible={searchOverlayVisible}
        onClose={() => setSearchOverlayVisible(false)}
        topOffset={0}
      />

      {/* Options Menu Modal */}
      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          activeOpacity={1}
          onPress={() => setOptionsMenuVisible(false)}
        >
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-4">
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <Text className="text-lg font-bold text-black dark:text-white mb-4 text-center">
              Tạo mới
            </Text>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3"
              onPress={() => {
                setOptionsMenuVisible(false);
                setNewPostModalVisible(true);
              }}
            >
              <Icon name="edit-3" size={20} color="#4F46E5" style={{ marginRight: 12 }} />
              <Text className="text-black dark:text-white font-medium">
                Đăng bài viết
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              onPress={() => {
                setOptionsMenuVisible(false);
                setUploadCoverModalVisible(true);
              }}
            >
              <Icon name="music" size={20} color="#4F46E5" style={{ marginRight: 12 }} />
              <Text className="text-black dark:text-white font-medium">
                Đăng cover
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 p-3"
              onPress={() => setOptionsMenuVisible(false)}
            >
              <Text className="text-center text-gray-500 dark:text-gray-400 font-medium">
                Hủy
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Upload Cover Modal */}
      <UploadCoverModal
        visible={uploadCoverModalVisible}
        onClose={() => setUploadCoverModalVisible(false)}
        onCoverPosted={handleCoverPosted}
      />
    </SafeAreaView>
  );
};

export default SocialScreen;