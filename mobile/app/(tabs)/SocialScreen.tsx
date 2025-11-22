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
  Modal,
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
  sharePost,
  fetchPostsForGuest,
} from "../../services/socialApi";
import useAuthStore from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { UploadMultipleFile } from "@/routes/ApiRouter";
import { useNavigate } from "@/hooks/useNavigate";
import PostItem from "../../components/items/PostItem";
import CoverItem from "../../components/items/CoverItem";
import CommentModal from "../../components/modals/CommentModal";
import LikeModal from "../../components/modals/LikeModal";
import UploadCoverModal from "../../components/modals/UploadCoverModal";
import NewPostCreator from "../../components/items/NewPostItem";
import { createNewCover, fetchTopCovers } from "../../services/coverService";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { FindTrackById } from "@/services/musicService";
import { set } from "date-fns";

const SocialScreen = () => {
  const colorScheme = useColorScheme();
  const { navigate } = useNavigate();
  const { info, success, error, warning, confirm } = useCustomAlert();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isGuest = useAuthStore((state) => state.isGuest);

  const [trackItem, setTrackItem] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [filteredPosts, setFilteredPosts] = useState([]);

  // State cho tabs
  const [activeTab, setActiveTab] = useState<"posts" | "covers">("posts");

  // State cho Upload Cover Modal
  const [uploadCoverModalVisible, setUploadCoverModalVisible] = useState(false);
  const [reShareModalVisible, setReShareModalVisible] = useState(false);
  const [reShareTargetPost, setReShareTargetPost] = useState<any | null>(null);
  const [reShareCaption, setReShareCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // console.log("User: ", user);

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
        setTrackItem(response.data);
        return response.data;
      } else {
        setTrackItem(null);
        return null;
      }
    } catch (error) {
      console.log("Lỗi khi tìm bài hát theo ID:", error);
    }
  }

  // Hàm map dữ liệu bài đăng từ API về định dạng local
  // const mapApiPostToLocal = (apiPost) => ({
  //   id: apiPost.id,
  //   userId: apiPost.userId,
  //   User: apiPost.User || {
  //     id: apiPost.userId,
  //     avatarUrl: "",
  //     username: "Anonymous",
  //     fullName: "Anonymous",
  //   },
  //   uploadedAt: apiPost.uploadedAt,
  //   content: apiPost.content,
  //   fileUrl: apiPost.fileUrl,
  //   heartCount: apiPost.heartCount,
  //   commentCount: apiPost.commentCount,
  //   shareCount: apiPost.shareCount,
  //   isLiked: apiPost.isLiked,
  //   songId: apiPost.songId,
  //   avatarUrl: apiPost.User?.avatarUrl || "",
  //   username: apiPost.User?.username || "Anonymous",
  //   fullName: apiPost.User?.fullName || "Anonymous",
  //   groupName: "",
  //   time: formatTime(apiPost.uploadedAt),
  //   contentText: apiPost.content,
  //   images: Array.isArray(apiPost.fileUrl)
  //     ? apiPost.fileUrl
  //     : apiPost.fileUrl
  //       ? [apiPost.fileUrl]
  //       : [],
  //   // Thông tin bài hát hiển thị trong PostItem
  //   musicLink:
  //     apiPost.OriginalSong && apiPost.OriginalSong.name
  //       ? `${apiPost.OriginalSong.name}${Array.isArray(apiPost.OriginalSong.artists) &&
  //         apiPost.OriginalSong.artists.length > 0
  //         ? " - " + apiPost.OriginalSong.artists.map((a) => a.name).join(", ")
  //         : ""
  //       }`
  //       : apiPost.songId
  //         ? `Bài hát: ${trackItem.name} - ${trackItem.artists.map((a) => a.name).join(", ")}`
  //         : "",
  //   isOnline: false,
  //   comments: [],
  //   isCover: apiPost.isCover || false,
  //   originalSongId: apiPost.originalSongId,
  //   OriginalSong: apiPost.OriginalSong,
  //   originalPost: apiPost.OriginalPost,
  // });

  const mapApiPostToLocal = async (apiPost) => { // <-- THÊM ASYNC
    let songNameAndArtists = "";
    let trackData = apiPost.OriginalSong;

    // 1. Ưu tiên dùng OriginalSong (nếu có)
    if (apiPost.OriginalSong && apiPost.OriginalSong.name) {
      const artists = Array.isArray(apiPost.OriginalSong.artists)
        ? apiPost.OriginalSong.artists.map((a) => a.name).join(", ")
        : "";
      songNameAndArtists = `${apiPost.OriginalSong.name}${artists ? " - " + artists : ""}`;
    }
    // 2. Nếu không có OriginalSong nhưng có songId, phải gọi API để lấy
    else if (apiPost.songId) {
      // GỌI HÀM BẤT ĐỒNG BỘ
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
      // Cập nhật musicLink sử dụng kết quả đã xác định
      musicLink: songNameAndArtists,
      isOnline: false,
      comments: [],
      isCover: apiPost.isCover || false,
      originalSongId: apiPost.originalSongId,
      OriginalSong: trackData, // Cập nhật OriginalSong nếu tìm thấy
      originalPost: apiPost.OriginalPost,
    };
  };

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

      // MAP KẾT QUẢ VÀ CẬP NHẬT STATE
      const newPost = mapApiPostToLocal(apiPost);
      setPosts([newPost, ...posts]);

      // RESET INPUTS
      setNewPostText("");
      setSelectedMediaAssets([]);
      setSelectedSongId(null);
      Keyboard.dismiss();
    } catch (err) {
      error("Lỗi Đăng Bài", err.response?.data?.error || "Không thể tạo bài đăng.");
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
      success("Bài viết đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa bài viết:", error);
      error("Lỗi", "Không thể cập nhật bài viết.");
    }
  };

  // Hàm xử lý xóa bài viết
  const handleDeletePost = async (postId: string) => {
    // Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa bài viết này?", [
    //   { text: "Hủy", style: "cancel" },
    //   {
    //     text: "Xóa",
    //     style: "destructive",
    //     onPress: async () => {
    //       try {
    //         const result = await deletePost(postId);
    //         if ("message" in result) {
    //           throw new Error(result.message);
    //         }
    //         // Xóa bài viết khỏi state
    //         setPosts((prevPosts) =>
    //           prevPosts.filter((post) => post.id !== postId)
    //         );
    //         Alert.alert("Thành công", "Bài viết đã được xóa.");
    //       } catch (error) {
    //         console.error("Lỗi khi xóa bài viết:", error);
    //         Alert.alert("Lỗi", "Không thể xóa bài viết.");
    //       }
    //     },
    //   },
    // ]);
    confirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      async () => {
        try {
          const result = await deletePost(postId);
          if ("message" in result) {
            throw new Error(result.message);
          }
          // Xóa bài viết khỏi state
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post.id !== postId)
          );
          success("Bài viết đã được xóa.");
        } catch (error) {
          console.error("Lỗi khi xóa bài viết:", error);
          error("Lỗi", "Không thể xóa bài viết.");
        }
      },
      () => { }
    )
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
            // Tìm và thay thế comment tạm thởi bằng comment chính thức
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
    } catch (err) {
      console.error("Lỗi khi gửi bình luận:", err);
      error("Lỗi", "Gửi bình luận thất bại. Đã hoàn tác.");

      // ROLLBACK nếu API thất bại (Xóa comment tạm thởi khỏi UI)
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
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    // Chuẩn hóa parent/reply khi gọi từ UI có thể truyền commentId = replyId
    let parentComment = post.comments.find((c) => c.id === commentId);
    let targetReplyId = replyId;
    if (isReply) {
      // Nếu không có replyId, coi commentId chính là replyId
      if (!targetReplyId) targetReplyId = commentId;
      // Nếu chưa tìm được parent theo commentId, dò theo danh sách Replies
      if (!parentComment) {
        parentComment = post.comments.find((c) =>
          (c.Replies || []).some((r) => r.id === targetReplyId)
        );
      }
    }
    if (!parentComment) return;

    // Nếu là Reply: cập nhật vào Replies của comment cha
    if (isReply && (targetReplyId || replyId)) {
      const targetReply = (parentComment.Replies || []).find((r) => r.id === (targetReplyId || replyId));
      if (!targetReply) return;

      const prevIsLiked = targetReply.isLiked;
      const prevLikeCount = targetReply.likeCount || 0;
      const newIsLikedOptimistic = !prevIsLiked;
      const likeChangeOptimistic = newIsLikedOptimistic ? 1 : -1;

      // 1. Optimistic update cho Reply
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id !== parentComment.id) return c;
              return {
                ...c,
                Replies: (c.Replies || []).map((r) =>
                  r.id === (targetReplyId || replyId)
                    ? {
                      ...r,
                      isLiked: newIsLikedOptimistic,
                      likeCount: (prevLikeCount || 0) + likeChangeOptimistic,
                    }
                    : r
                ),
              };
            }),
          };
        })
      );

      try {
        const result = await toggleCommentLike(targetReplyId || replyId);
        if ("message" in result) throw new Error(result.message);

        // 2. Cập nhật theo kết quả server
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id !== parentComment.id) return c;
                return {
                  ...c,
                  Replies: (c.Replies || []).map((r) =>
                    r.id === (targetReplyId || replyId)
                      ? { ...r, isLiked: result.isLiked, likeCount: result.likeCount }
                      : r
                  ),
                };
              }),
            };
          })
        );
      } catch (err) {
        console.error("Lỗi khi thích/bỏ thích trả lời:", err);
        error("Lỗi", "Không thể cập nhật trạng thái thích trả lời.");
        // 3. Rollback
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id !== parentComment.id) return c;
                return {
                  ...c,
                  Replies: (c.Replies || []).map((r) =>
                    r.id === (targetReplyId || replyId) ? { ...r, isLiked: prevIsLiked, likeCount: prevLikeCount } : r
                  ),
                };
              }),
            };
          })
        );
      }
      return;
    }

    // Mặc định: xử lý Comment cha như trước
    const prevIsLiked = parentComment.isLiked;
    const prevLikeCount = parentComment.likeCount;
    const newIsLikedOptimistic = !prevIsLiked;
    const likeChangeOptimistic = newIsLikedOptimistic ? 1 : -1;

    // 1. Optimistic Update: Cập nhật UI tạm thởi cho comment cha
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
      const result = await toggleCommentLike(commentId);
      if ("message" in result) {
        throw new Error(result.message);
      }

      // 2. Cập nhật trạng thái chính thức từ Server
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.map((c) => {
                if (c.id === commentId) {
                  return {
                    ...c,
                    isLiked: result.isLiked,
                    likeCount: result.likeCount,
                  };
                }
                return c;
              }),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Lỗi khi thích/bỏ thích bình luận:", err);
      error("Lỗi", "Không thể cập nhật trạng thái thích bình luận.");

      // 3. Rollback nếu thất bại
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
          Alert.alert("Lỗi", result.message || "Không thể chia sẻ bài viết.");
        }
        return;
      }

      const { newPost, originalPost } = result;

      // Thêm bài re-share mới vào đầu danh sách
      const mappedNewPost = mapApiPostToLocal(newPost);
      setPosts((prevPosts) => [mappedNewPost, ...prevPosts]);

      // Cập nhật shareCount cho bài gốc nếu backend trả về
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
    } catch (error) {
      console.error("Lỗi khi chia sẻ bài đăng:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ bài viết.");
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

  // Chức năng Comment Modal
  // Dùng để tải comments khi modal mở
  const loadComments = async (postId) => {
    try {
      const fetchedComments = await fetchCommentsByPostId(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: fetchedComments } : post
        )
      );
      return fetchedComments;
    } catch (e) {
      error("Lỗi", "Không thể tải bình luận cho bài viết này." + e.message);
      return [];
    }
  };

  const loadPosts = useCallback(async () => {
    try {
      let apiPosts;
      if (activeTab === "covers") {
        // Fetch only covers when covers tab is active
        console.log(1)
        apiPosts = await fetchTopCovers();
      } else {
        // Fetch all posts when posts tab is active
        console.log(2)
        if (isGuest) {
          apiPosts = await fetchPostsForGuest();
        } else {
          apiPosts = await fetchPosts();
        }
      }

      if (apiPosts.success === false) {
        error("Lỗi", apiPosts.message || "Không thể tải bài đăng từ server.");
        return;
      }
      // const mappedPosts = apiPosts.map(mapApiPostToLocal);
      const mappedPosts = await Promise.all(
        apiPosts.map(mapApiPostToLocal) // Giả sử apiPosts chứa mảng bài đăng
      );
      setPosts(mappedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      error("Lỗi", "Không thể tải bài đăng từ server.");
    }
  }, [activeTab]);

  // useEffect để tải bài đăng lần đầu
  useEffect(() => {
    setLoading(true);
    loadPosts().finally(() => setLoading(false));
  }, [loadPosts]);

  // useEffect để lọc bài đăng khi searchQuery thay đổi (không cần lọc covers nữa vì đã fetch riêng)
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

  /**
 * Hàm xử lý khi vuốt xuống làm mới
 */
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  }, [loadPosts]);


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
              Khám phá
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setUploadCoverModalVisible(true)}
                className="mr-3"
              >
                <Icon
                  name="plus"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
                <Icon
                  name="search"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredPosts}
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
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setActiveTab("posts")}
                className={`px-3 py-1 rounded-l-lg ${activeTab === "posts"
                  ? "bg-emerald-700"
                  : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${activeTab === "posts"
                    ? "text-white"
                    : "text-black dark:text-white"
                    }`}
                >
                  Bài đăng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("covers")}
                className={`px-3 py-1 rounded-r-lg ${activeTab === "covers"
                  ? "bg-emerald-700"
                  : "bg-gray-200 dark:bg-gray-700"
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${activeTab === "covers"
                    ? "text-white"
                    : "text-black dark:text-white"
                    }`}
                >
                  Covers/Sáng tác
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <View className="mb-4 px-3">
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
                  onDelete={() => handleDeletePost(item.id)}
                  isUserPost={item.userId === user?.id}
                />
              )}
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

      {/* Upload Cover Modal */}
      <UploadCoverModal
        visible={uploadCoverModalVisible}
        onClose={() => setUploadCoverModalVisible(false)}
        onCoverPosted={onRefresh}
      />
    </SafeAreaView>
  );
};

export default SocialScreen;
