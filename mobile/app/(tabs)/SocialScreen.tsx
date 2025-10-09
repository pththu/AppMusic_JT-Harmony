// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   FlatList,
//   Image,
//   Keyboard,
//   KeyboardAvoidingView,
//   Linking,
//   Modal,
//   Platform,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useColorScheme,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Icon from "react-native-vector-icons/Feather";

// const PostItem = ({
//   avatarUrl,
//   username,
//   groupName,
//   time,
//   contentText,
//   images,
//   musicLink,
//   likeCount,
//   commentCount,
//   shareCount,
//   isOnline,
//   onPostUpdate, // NHẬN: Hàm callback từ SocialScreen
//   onCommentPress, // New prop to open comment modal
//   onSharePress, // New prop to handle share press
// }) => {
//   const colorScheme = useColorScheme();
//   // STATE: Theo dõi trạng thái đã thích (liked)
//   const [isLiked, setIsLiked] = useState(false);

//   // STATE: Dùng state nội bộ để hiển thị số like (được đồng bộ với prop)
//   const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

//   // Xử lý nút Tim
//   const handleLike = () => {
//     const newLikedStatus = !isLiked;
//     const likeChange = newLikedStatus ? 1 : -1;

//     setIsLiked(newLikedStatus);
//     setCurrentLikeCount((prevCount) => prevCount + likeChange);

//     // Gửi sự kiện cập nhật lên SocialScreen (nếu cần cập nhật state chung)
//     if (onPostUpdate) {
//       onPostUpdate("like", likeChange);
//     }
//   };

//   // Xử lý nút Bình luận
//   const handleComment = () => {
//     if (onPostUpdate) {
//       onPostUpdate("comment", 1);
//     }
//     if (onCommentPress) {
//       onCommentPress();
//     }
//   };

//   // Xử lý nút Chia sẻ
//   const handleShare = () => {
//     if (onPostUpdate) {
//       onPostUpdate("share", 1);
//     }
//     if (onSharePress) {
//       onSharePress();
//     } else {
//       Alert.alert(
//         "Chia sẻ",
//         `Mở Share Sheet để chia sẻ bài đăng của ${username}.`
//       );
//     }
//   };

//   return (
//     <SafeAreaView className="bg-white dark:bg-[#171431] p-3 mb-3 rounded-xl shadow-lg shadow-black/50">
//       {/* Header */}
//       <View className="flex-row items-center mb-1.5">
//         <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full" />
//         <View className="ml-2 flex-col">
//           <View className="flex-row items-center">
//             <Text className="font-bold text-sm text-black dark:text-white">{username}</Text>
//             {groupName ? (
//               <Text className="text-sm text-gray-600 dark:text-gray-300">

//                 {">"} {groupName}
//               </Text>
//             ) : null}
//             {isOnline ? (
//               <View className="w-2 h-2 rounded-full bg-green-400 ml-1.5" />
//             ) : null}
//           </View>
//           <Text className="text-gray-500 dark:text-gray-400 text-xs">{time}</Text>
//         </View>
//       </View>

//       {/* Content Text */}
//       {contentText ? (
//         <Text className="text-sm text-black dark:text-gray-300 mb-2">{contentText}</Text>
//       ) : null}

//       {/* Images */}
//       {images && images.length > 0 ? (
//         <View className="flex-row mb-2">
//           {images.map((img, index) => (
//             <Image
//               key={index}
//               source={{ uri: img }}
//               className="w-30 h-30 rounded-lg mr-2"
//             />
//           ))}
//         </View>
//       ) : null}

//       {/* Music Link */}
//       {musicLink ? (
//         <TouchableOpacity
//           onPress={() => Linking.openURL(musicLink)}
//           className="bg-blue-900/50 p-2 rounded-lg mb-2"
//         >
//           <Text className="text-blue-400 underline">Nghe nhạc tại đây</Text>
//         </TouchableOpacity>
//       ) : null}

//       {/* Interaction Buttons */}
//       <View className={`flex-row justify-between pt-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
//         {/* NÚT LIKE (TIM) */}
//         <TouchableOpacity
//           onPress={handleLike}
//           className="flex-row items-center space-x-1"
//         >
//           <Icon
//             name={isLiked ? "heart" : "heart"} // Cả hai icon đều là 'heart', chỉ khác màu
//             size={20}
//             color={isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")} // Màu đỏ khi liked, xám khi chưa liked
//           />
//           <Text
//             className={`ml-1 ${isLiked ? "text-red-400 font-bold" : (colorScheme === "dark" ? "text-gray-400" : "text-black")}`}
//           >
//             {currentLikeCount}
//           </Text>
//         </TouchableOpacity>

//         {/* NÚT BÌNH LUẬN */}
//         <TouchableOpacity
//           onPress={handleComment}
//           className="flex-row items-center space-x-1"
//         >
//           <Icon name="message-circle" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//           <Text className={`ml-1 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>{commentCount}</Text>
//         </TouchableOpacity>

//         {/* NÚT CHIA SẺ */}
//         <TouchableOpacity
//           onPress={handleShare}
//           className="flex-row items-center space-x-1"
//         >
//           <Icon name="share-2" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//           <Text className={`ml-1 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>{shareCount}</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const CommentModal = ({
//   visible,
//   onClose,
//   comments,
//   onAddComment,
//   onCommentLike,
//   postId,
// }) => {
//   const colorScheme = useColorScheme();
//   const [newComment, setNewComment] = useState("");
//   const [replyTo, setReplyTo] = useState(null); // Lưu comment đang trả lời
//   const [quote, setQuote] = useState(null); // Lưu comment đang trích dẫn
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const [expandedReplies, setExpandedReplies] = useState({}); // theo dõi comment cha đang mở rộng replies

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       "keyboardDidShow",
//       () => {
//         setKeyboardVisible(true);
//       }
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       "keyboardDidHide",
//       () => {
//         setKeyboardVisible(false);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   const handleAddComment = () => {
//     if (newComment.trim()) {
//       // Gửi comment chỉ với text
//       onAddComment(newComment);
//       setNewComment("");
//       setReplyTo(null);
//       setQuote(null);
//     }
//   };

//   // Hàm xử lý khi nhấn trả lời comment
//   const handleReply = (comment) => {
//     setReplyTo(comment);
//     setQuote(null);
//   };

//   // Hàm xử lý khi nhấn trích dẫn comment
//   const handleQuote = (comment) => {
//     setQuote(comment);
//     setReplyTo(null);
//   };

//   // Hàm hủy trả lời hoặc trích dẫn
//   const cancelReplyOrQuote = () => {
//     setReplyTo(null);
//     setQuote(null);
//   };

//   // Hàm toggle mở rộng replies
//   const toggleExpandedReplies = (commentId) => {
//     setExpandedReplies((prev) => ({
//       ...prev,
//       [commentId]: !prev[commentId],
//     }));
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <KeyboardAvoidingView
//         style={{
//           flex: 1,
//           justifyContent: "flex-end",
//           backgroundColor: "rgba(0,0,0,0.5)",
//         }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
//       >
//         <View
//           className={`rounded-t-xl p-4 ${isKeyboardVisible ? "h-1/2" : "h-3/4"} ${colorScheme === "dark" ? "bg-[#171431]" : "bg-white"}`}
//         >
//           <View className="flex-row justify-between items-center mb-4">
//             <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>Bình luận</Text>
//             <TouchableOpacity onPress={onClose}>
//               <Icon name="x" size={24} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             data={comments}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => {
//               const isExpanded = expandedReplies[item.id];
//               const visibleReplies = isExpanded
//                 ? item.replies
//                 : item.replies.slice(0, 3);
//               return (
//                 <View className="mb-3">
//                   {/* Comment cha */}
//                   <View className="flex-row items-center mb-1">
//                     <Image
//                       source={{
//                         uri: "https://randomuser.me/api/portraits/men/3.jpg",
//                       }}
//                       className="w-6 h-6 rounded-full mr-2"
//                     />
//                     <Text className={`font-bold text-sm ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
//                       {item.username}
//                     </Text>
//                     <Text className={`text-xs ml-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
//                       {item.time}
//                     </Text>
//                   </View>
//                   {/* Hiển thị trích dẫn nếu có */}
//                   {item.quote ? (
//                     <View className={`rounded p-2 mb-1 ml-8 border-l-4 border-blue-500 ${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
//                       <Text className={`italic text-sm ${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                         {item.quote.text}
//                       </Text>
//                       <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                         - {item.quote.username}
//                       </Text>
//                     </View>
//                   ) : null}
//                   <Text className={`text-sm ml-8 ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
//                     {item.text}
//                   </Text>
//                   {/* Nút trả lời và trích dẫn */}
//                   <View className="flex-row ml-8 mt-1">
//                     <TouchableOpacity
//                       onPress={() =>
//                         onCommentLike(postId, item.id, false, null)
//                       }
//                       className="flex-row items-center space-x-1"
//                     >
//                       <Icon
//                         name={item.isLiked ? "heart" : "heart"}
//                         size={16}
//                         color={item.isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")}
//                       />
//                       <Text
//                         className={`text-xs ${item.isLiked ? "text-red-400" : (colorScheme === "dark" ? "text-gray-200" : "text-gray-800")}`}
//                       >
//                         {item.likeCount}
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleReply(item)}
//                       className="flex-row items-center px-2"
//                     >
//                       <Icon name="corner-up-left" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//                       <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trả lời</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleQuote(item)}
//                       className="flex-row items-center space-x-1"
//                     >
//                       <Icon name="repeat" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//                       <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trích dẫn</Text>
//                     </TouchableOpacity>
//                   </View>
//                   {/* Hiển thị replies */}
//                   {visibleReplies.map((reply) => (
//                     <View key={reply.id} className="ml-12 mt-2">
//                       <View className="flex-row items-center mb-1">
//                         <Image
//                           source={{
//                             uri: "https://randomuser.me/api/portraits/men/3.jpg",
//                           }}
//                           className="w-5 h-5 rounded-full mr-2"
//                         />
//                         <Text className={`font-bold text-xs ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
//                           {reply.username}
//                         </Text>
//                         <Text className={`text-xs ml-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
//                           {reply.time}
//                         </Text>
//                       </View>
//                       <Text className={`text-sm ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
//                         {reply.text}
//                       </Text>
//                       {/* Nút like và trả lời cho reply */}
//                       <View className="flex-row mt-1">
//                         <TouchableOpacity
//                           onPress={() =>
//                             onCommentLike(postId, item.id, true, reply.id)
//                           }
//                           className="flex-row items-center space-x-1"
//                         >
//                           <Icon
//                             name={reply.isLiked ? "heart" : "heart"}
//                             size={14}
//                             color={reply.isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")}
//                           />
//                           <Text
//                             className={`text-xs ${reply.isLiked ? "text-red-400" : (colorScheme === "dark" ? "text-gray-400" : "text-gray-600")}`}
//                           >
//                             {reply.likeCount}
//                           </Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleReply(reply)}
//                           className="flex-row items-center px-2"
//                         >
//                           <Icon
//                             name="corner-up-left"
//                             size={14}
//                             color={colorScheme === "dark" ? "#9ca3af" : "#000000"}
//                           />
//                           <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trả lời</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleQuote(item)}
//                           className="flex-row items-end space-x-1"
//                         >
//                           <Icon name="repeat" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
//                           <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
//                             Trích dẫn
//                           </Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   ))}
//                   {/* Nút xem thêm replies */}
//                   {item.replies.length > 3 && (
//                     <TouchableOpacity
//                       onPress={() => toggleExpandedReplies(item.id)}
//                       className="ml-12 mt-1"
//                     >
//                       <Text className="text-blue-400 text-xs">
//                         {isExpanded
//                           ? "Ẩn các trả lời"
//                           : `Xem ${item.replies.length - 3} trả lời khác`}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               );
//             }}
//             showsVerticalScrollIndicator={false}
//           />
//           {/* Hiển thị thông tin trả lời hoặc trích dẫn ở trên thanh nhập */}
//           {(replyTo || quote) && (
//             <View className={`rounded p-2 mb-2 flex-row justify-between items-center ${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
//               <Text
//                 className={`italic text-sm flex-1 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"}`}
//                 numberOfLines={1}
//               >
//                 {replyTo
//                   ? `Trả lời: ${replyTo.text}`
//                   : `Trích dẫn: ${quote.text}`}
//               </Text>
//               <TouchableOpacity onPress={cancelReplyOrQuote}>
//                 <Icon name="x" size={20} color="#ef4444" />
//               </TouchableOpacity>
//             </View>
//           )}
//           <View className={`flex-row items-center py-12 px-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
//             <TextInput
//               placeholder="Viết bình luận..."
//               placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
//               value={newComment}
//               onChangeText={setNewComment}
//               className={`flex-1 border rounded-full px-4 py-2 text-base ${colorScheme === "dark" ? "border-gray-600 bg-[#0E0C1F] text-white" : "border-gray-700 bg-white text-black"}`}
//               multiline
//             />
//             <TouchableOpacity
//               onPress={handleAddComment}
//               className="ml-2 bg-green-600 px-4 py-2 rounded-full"
//             >
//               <Text className="text-white font-bold">Gửi</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// const SocialScreen = () => {
//   const colorScheme = useColorScheme();
//   const [posts, setPosts] = useState([
//     {
//       id: "1",
//       avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
//       username: "bancuanhalong",
//       groupName: "Cats of Threads",
//       time: "3 giờ",
//       contentText:
//         "=))))))))))) kiếp nạn mèo ở phòng trọ tự mắc vào thì tự gỡ nha",
//       images: ["https://i.imgur.com/1.jpg", "https://i.imgur.com/2.jpg"],
//       musicLink: "",
//       likeCount: 202,
//       commentCount: 2,
//       shareCount: 16,
//       isOnline: true,
//       comments: [
//         {
//           id: "c1",
//           username: "user1",
//           text: "Haha cute!",
//           time: "2 giờ",
//           replies: [],
//           likeCount: 5,
//           isLiked: false,
//         },
//         {
//           id: "c2",
//           username: "user2",
//           text: "Poor cat!",
//           time: "1 giờ",
//           replies: [],
//           likeCount: 3,
//           isLiked: false,
//         },
//       ],
//     },
//     {
//       id: "2",
//       avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg",
//       username: "eduardosotoj862",
//       groupName: "#design",
//       time: "7 giờ",
//       contentText:
//         "Bảng màu thiên nhiên các designer tham khảo nha\nCre: Designer Vietnam",
//       images: ["https://i.imgur.com/3.jpg", "https://i.imgur.com/4.jpg"],
//       musicLink: "",
//       likeCount: 150,
//       commentCount: 10,
//       shareCount: 5,
//       isOnline: false,
//       comments: [
//         {
//           id: "c3",
//           username: "designer1",
//           text: "Great colors!",
//           time: "6 giờ",
//           likeCount: 12,
//           isLiked: false,
//           replies: [
//             {
//               id: "c3r1",
//               username: "userA",
//               text: "Agree!",
//               time: "5 giờ",
//               likeCount: 2,
//               isLiked: false,
//             },
//             {
//               id: "c3r2",
//               username: "userB",
//               text: "Nice palette",
//               time: "4 giờ",
//               likeCount: 1,
//               isLiked: false,
//             },
//             {
//               id: "c3r3",
//               username: "userC",
//               text: "Love it",
//               time: "3 giờ",
//               likeCount: 0,
//               isLiked: false,
//             },
//             {
//               id: "c3r4",
//               username: "userD",
//               text: "Thanks for sharing",
//               time: "2 giờ",
//               likeCount: 3,
//               isLiked: false,
//             },
//           ],
//         },
//         {
//           id: "c4",
//           username: "designer2",
//           text: "Thanks for sharing",
//           time: "5 giờ",
//           likeCount: 8,
//           isLiked: false,
//           replies: [],
//         },
//         {
//           id: "c5",
//           username: "designer3",
//           text: "Very useful",
//           time: "4 giờ",
//           likeCount: 4,
//           isLiked: false,
//           replies: [],
//         },
//       ],
//     },
//   ]);

//   const [newPostText, setNewPostText] = useState("");
//   const [newPostMusicLink, setNewPostMusicLink] = useState("");
//   const [commentModalVisible, setCommentModalVisible] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);

//   const addPost = () => {
//     if (newPostText.trim() === "" && newPostMusicLink.trim() === "") return;
//     const newPost = {
//       id: Date.now().toString(),
//       avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
//       username: "duytuan.24",
//       groupName: "",
//       time: "Vừa xong",
//       contentText: newPostText,
//       images: [],
//       musicLink: newPostMusicLink,
//       likeCount: 0,
//       commentCount: 0,
//       shareCount: 0,
//       isOnline: true,
//       comments: [],
//     };
//     setPosts([newPost, ...posts]);
//     setNewPostText("");
//     setNewPostMusicLink("");
//   };

//   // HÀM CẬP NHẬT POSTS: Được gọi từ PostItem
//   const updatePost = (id, type, value) => {
//     setPosts((prevPosts) =>
//       prevPosts.map((post) => {
//         if (post.id === id) {
//           if (type === "like") {
//             // Logic cập nhật like count trong state gốc
//             return { ...post, likeCount: post.likeCount + value };
//           } else if (type === "comment") {
//             return { ...post, commentCount: post.commentCount + value };
//           } else if (type === "share") {
//             return { ...post, shareCount: post.shareCount + value };
//           }
//         }
//         return post;
//       })
//     );
//   };

//   const openCommentModal = (postId) => {
//     setSelectedPostId(postId);
//     setCommentModalVisible(true);
//   };

//   const closeCommentModal = () => {
//     setCommentModalVisible(false);
//     setSelectedPostId(null);
//   };

//   const addComment = (text) => {
//     if (selectedPostId) {
//       const newComment = {
//         id: Date.now().toString(),
//         username: "duytuan.24",
//         text,
//         time: "Vừa xong",
//         replies: [],
//         likeCount: 0,
//         isLiked: false,
//       };
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post.id === selectedPostId
//             ? { ...post, comments: [...post.comments, newComment] }
//             : post
//         )
//       );
//     }
//   };

//   const updateCommentLike = (postId, commentId, isReply, replyId) => {
//     setPosts((prevPosts) =>
//       prevPosts.map((post) => {
//         if (post.id === postId) {
//           return {
//             ...post,
//             comments: post.comments.map((comment) => {
//               if (comment.id === commentId) {
//                 if (isReply) {
//                   return {
//                     ...comment,
//                     replies: comment.replies.map((reply) => {
//                       if (reply.id === replyId) {
//                         const newLiked = !reply.isLiked;
//                         return {
//                           ...reply,
//                           isLiked: newLiked,
//                           likeCount: reply.likeCount + (newLiked ? 1 : -1),
//                         };
//                       }
//                       return reply;
//                     }),
//                   };
//                 } else {
//                   const newLiked = !comment.isLiked;
//                   return {
//                     ...comment,
//                     isLiked: newLiked,
//                     likeCount: comment.likeCount + (newLiked ? 1 : -1),
//                   };
//                 }
//               }
//               return comment;
//             }),
//           };
//         }
//         return post;
//       })
//     );
//   };

//   const handleShare = () => {
//     Alert.alert("Chia sẻ", "Chức năng chia sẻ sẽ được triển khai sau.");
//   };

//   return (
//     <View className="flex-1 bg-gray-100 dark:bg-[#0E0C1F] px-3 pt-10">
//       {/* Input đăng bài mới */}
//       <View className="flex-row items-center mb-2">
//         <Image
//           source={{ uri: "https://randomuser.me/api/portraits/men/3.jpg" }}
//           className="w-10 h-10 rounded-full mr-2"
//         />
//         <TextInput
//           placeholder="Có gì mới?"
//           placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
//           value={newPostText}
//           onChangeText={setNewPostText}
//           className={`flex-1 border rounded-full px-4 py-2 text-base ${
//             colorScheme === "dark"
//               ? "border-gray-600 bg-[#171431] text-white"
//               : "border-gray-700 bg-white text-black"
//           }`}
//           multiline
//         />
//         <TouchableOpacity
//           onPress={addPost}
//           className="ml-2 bg-green-600 px-4 py-2 rounded-full"
//         >
//           <Text className={`${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Đăng</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Icons thêm ảnh, GIF, văn bản, ... */}
//       <View className="flex-row justify-start mb-3 pl-12">
//         <TouchableOpacity className="mr-4">
//           <Icon name="image" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
//         </TouchableOpacity>
//         <TouchableOpacity className="mr-4">
//           <Icon name="file-text" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
//         </TouchableOpacity>
//         <TouchableOpacity className="mr-4">
//           <Icon name="more-horizontal" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
//         </TouchableOpacity>
//       </View>

//       {/* Danh sách bài đăng */}
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <PostItem
//             {...item}
//             // TRUYỀN HÀM CẬP NHẬT
//             onPostUpdate={(type, value) => updatePost(item.id, type, value)}
//             onCommentPress={() => openCommentModal(item.id)}
//             onSharePress={handleShare}
//           />
//         )}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Comment Modal */}
//       <CommentModal
//         visible={commentModalVisible}
//         onClose={closeCommentModal}
//         comments={
//           posts.find((post) => post.id === selectedPostId)?.comments || []
//         }
//         onAddComment={addComment}
//         onCommentLike={updateCommentLike}
//         postId={selectedPostId}
//       />
//     </View>
//   );
// };

// export default SocialScreen;
// mobile/src/SocialScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from "react"; 
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator, // Thêm ActivityIndicator cho trạng thái Loading
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
// Import các hàm API và Interface đã tạo
import {
  fetchPosts,
  createNewPost,
  togglePostLike,
  fetchCommentsByPostId,
  createNewComment,
  Post, 
  Comment,
} from "@/services/socialApi"; // Đảm bảo đường dẫn này đúng

// --- GIAO DIỆN MẪU: Cần đảm bảo PostItem nhận đúng Props mới từ API ---
const PostItem = ({
  // Dữ liệu từ API
  id,
  User, // Thông tin người dùng (từ Eager Loading)
  content: contentText, // Đổi tên content thành contentText
  fileUrl: musicLink, // Đổi tên fileUrl thành musicLink
  heartCount: likeCount, // Đổi tên heartCount thành likeCount
  shareCount,
  uploadedAt: time, // Đổi tên uploadedAt thành time
  // Dữ liệu bổ sung
  commentCount: initialCommentCount,
  onPostUpdate, 
  onCommentPress, 
  onSharePress, 
}) => {
  const colorScheme = useColorScheme();
  const [isLiked, setIsLiked] = useState(false); // TODO: Lấy trạng thái liked của user hiện tại
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [currentCommentCount, setCurrentCommentCount] = useState(initialCommentCount);


  // Xử lý nút Tim (Tích hợp API)
  const handleLike = async () => {
    try {
        await togglePostLike(id); // Gọi API like
        const newLikedStatus = !isLiked;
        const likeChange = newLikedStatus ? 1 : -1;
        
        setIsLiked(newLikedStatus);
        setCurrentLikeCount(prev => prev + likeChange);

        // Báo cho màn hình cha biết đã cập nhật (có thể không cần nếu UI tự cập nhật)
        onPostUpdate("like", likeChange); 
    } catch (error) {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái thích.");
    }
  };

  // Hàm mở comment modal
  const handleCommentPress = () => {
    onCommentPress(); // Gọi hàm từ SocialScreen để mở modal
  };

  return (
    <View className="bg-white dark:bg-[#171431] p-4 rounded-xl mb-4 shadow-md">
      {/* Header (Thông tin User) */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Image
            source={{ uri: User.avatarUrl || 'https://default-avatar.com/default.jpg' }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className={`font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
              {User.username}
            </Text>
            <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {new Date(time).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <Icon name="more-horizontal" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
      </View>

      {/* Content */}
      {contentText && (
        <Text className={`text-base mb-3 ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
          {contentText}
        </Text>
      )}
      {/* TODO: Xử lý hiển thị nhạc/ảnh dựa trên musicLink (fileUrl) */}
      {musicLink && (
          <View className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Text className="text-sm font-semibold text-blue-500">Music Link:</Text>
              <Text className="text-xs dark:text-gray-300" numberOfLines={1}>{musicLink}</Text>
          </View>
      )}

      {/* Actions (Like, Comment, Share) */}
      <View className="flex-row justify-around items-center border-t border-b border-gray-200 dark:border-gray-700 pt-3 mt-2">
        {/* Like */}
        <TouchableOpacity onPress={handleLike} className="flex-row items-center p-2">
          <Icon name="heart" size={20} color={isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")} />
          <Text className={`ml-1 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
            {currentLikeCount} Thích
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity onPress={handleCommentPress} className="flex-row items-center p-2">
          <Icon name="message-circle" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
          <Text className={`ml-1 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
            {currentCommentCount} Bình luận
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity onPress={onSharePress} className="flex-row items-center p-2">
          <Icon name="share-2" size={20} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
          <Text className={`ml-1 text-sm ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
            {shareCount} Chia sẻ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- COMMENT MODAL COMPONENT (Đã tích hợp API) ---

const CommentItem = ({ comment, onReply, onQuote, onLike }) => {
    const colorScheme = useColorScheme();
    const [isLiked, setIsLiked] = useState(false); // Tạm thời
    const [likeCount, setLikeCount] = useState(0); // Tạm thời

    // Logic để render comment, reply, quote, ...
    return (
        <View className="mb-3">
            {/* Comment cha */}
            <View className="flex-row items-center mb-1">
                <Image
                    source={{ uri: comment.User.avatarUrl || 'https://default-avatar.com/default.jpg' }}
                    className="w-6 h-6 rounded-full mr-2"
                />
                <Text className={`font-bold text-sm ${colorScheme === "dark" ? "text-white" : "text-black"}`}>
                    {comment.User.username}
                </Text>
                <Text className={`text-xs ml-2 ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>
                    {new Date(comment.commentedAt).toLocaleTimeString()}
                </Text>
            </View>
            <Text className={`text-sm ml-8 ${colorScheme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                {comment.content}
            </Text>
            {/* Nút trả lời và like */}
            <View className="flex-row ml-8 mt-1">
                <TouchableOpacity
                    onPress={() => onLike(comment.id)} // TODO: GỌI API LIKE COMMENT
                    className="flex-row items-center space-x-1"
                >
                    <Icon
                        name={isLiked ? "heart" : "heart"}
                        size={16}
                        color={isLiked ? "#ef4444" : (colorScheme === "dark" ? "#9ca3af" : "#000000")}
                    />
                    <Text
                        className={`text-xs ${isLiked ? "text-red-400" : (colorScheme === "dark" ? "text-gray-200" : "text-gray-800")}`}
                    >
                        {likeCount}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onReply(comment)}
                    className="flex-row items-center px-2"
                >
                    <Icon name="corner-up-left" size={16} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
                    <Text className={`text-xs ${colorScheme === "dark" ? "text-gray-400" : "text-black"}`}>Trả lời</Text>
                </TouchableOpacity>
            </View>
            {/* TODO: Logic hiển thị Replies nếu có */}
        </View>
    );
}

const CommentModal = ({
  visible,
  onClose,
  onAddComment,
  postId,
}) => {
  const colorScheme = useColorScheme();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // HÀM FETCH BÌNH LUẬN
  const loadComments = useCallback(async () => {
    if (!postId) return;
    setIsLoadingComments(true);
    try {
      const data = await fetchCommentsByPostId(postId);
      setComments(data); 
    } catch (error) {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId, loadComments]);


  // HÀM THÊM COMMENT MỚI (GỌI API)
  const handleAddComment = async () => {
    if (newComment.trim() && postId) {
      try {
        const parentId = replyTo ? replyTo.id : null;
        
        // GỌI API TẠO COMMENT
        const createdComment = await createNewComment(postId, newComment.trim(), parentId);
        
        // Cập nhật state UI
        setComments((prev) => [...prev, createdComment]);

        // Cập nhật số lượng comment trong Post (gọi callback từ SocialScreen)
        if (onAddComment) {
          onAddComment(createdComment); 
        }

        setNewComment("");
        setReplyTo(null);
        Keyboard.dismiss();

      } catch (error) {
        // Lỗi đã được Alert bên trong socialApi.ts
      }
    }
  };
  
  // Xử lý reply
  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
  };
  const cancelReply = () => {
    setReplyTo(null);
  };

  // TODO: Xử lý Like Comment
  const handleLikeComment = (commentId: string) => {
      Alert.alert("Tính năng", `Thích bình luận ${commentId}. Cần triển khai API.`);
  }

  // ... (Giữ nguyên Keyboard listeners)
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  // ... (Kết thúc giữ nguyên)


  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-bold ${colorScheme === "dark" ? "text-white" : "text-black"}`}>Bình luận</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colorScheme === "dark" ? "#9ca3af" : "#000000"} />
            </TouchableOpacity>
          </View>
          
          {/* LIST COMMENTS */}
          {isLoadingComments ? (
            <ActivityIndicator size="large" color={colorScheme === "dark" ? "#fff" : "#000"} className="mt-10" />
          ) : (
            <FlatList
                data={comments} 
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CommentItem 
                        comment={item} 
                        onReply={handleReply} 
                        onQuote={() => {}} 
                        onLike={handleLikeComment} 
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
          )}

          {/* INPUT AREA */}
          {replyTo && (
            <View className={`rounded p-2 mb-2 flex-row justify-between items-center ${colorScheme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
              <Text
                className={`italic text-sm flex-1 ${colorScheme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                numberOfLines={1}
              >
                {`Trả lời: ${replyTo.content}`} 
              </Text>
              <TouchableOpacity onPress={cancelReply}>
                <Icon name="x" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          <View className={`flex-row items-center py-2 px-2 border-t ${colorScheme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
            <TextInput
              placeholder="Viết bình luận..."
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
              value={newComment}
              onChangeText={setNewComment}
              className={`flex-1 border rounded-full px-4 py-2 text-base ${colorScheme === "dark" ? "border-gray-600 bg-[#0E0C1F] text-white" : "border-gray-700 bg-white text-black"}`}
              multiline
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={newComment.trim() === ""}
              className={`ml-2 px-4 py-2 rounded-full ${newComment.trim() ? "bg-green-600" : "bg-gray-500"}`}
            >
              <Text className="text-white font-bold">Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


const SocialScreen = () => {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState<Post[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [newPostText, setNewPostText] = useState("");
  const [newPostMusicLink, setNewPostMusicLink] = useState("");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // HÀM TẢI BÀI ĐĂNG (FEED)
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      setPosts([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // HÀM TẠO BÀI ĐĂNG MỚI (GỌI API)
  const addPost = async () => {
    if (newPostText.trim() === "" && newPostMusicLink.trim() === "") return;
    
    try {
      const newPost = await createNewPost(newPostText.trim(), newPostMusicLink.trim());

      setPosts([newPost, ...posts]);
      setNewPostText("");
      setNewPostMusicLink("");
      Keyboard.dismiss();
      
    } catch (error) {
       // Lỗi đã được Alert bên trong socialApi.ts
    }
  };

  // HÀM CẬP NHẬT POSTS: Cập nhật count sau khi Like/Share thành công
  const updatePost = (id: string, type: 'like' | 'comment' | 'share', value: number) => {
    setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === id) {
            if (type === 'like') return { ...post, heartCount: post.heartCount + value };
            if (type === 'comment') return { ...post, commentCount: post.commentCount + value };
            if (type === 'share') return { ...post, shareCount: post.shareCount + value };
          }
          return post;
        })
    );
  };
  
  // HÀM XỬ LÝ KHI CÓ COMMENT MỚI TỪ MODAL (Đã gọi API và thành công)
  const handleCommentAdded = (newComment: Comment) => {
    // Tăng commentCount của Post tương ứng
    if (selectedPostId) {
        updatePost(selectedPostId, 'comment', 1);
    }
  }

  const openCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
  };

  const handleShare = () => {
    Alert.alert("Chia sẻ", "Chức năng chia sẻ sẽ được triển khai sau.");
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-[#0E0C1F] px-3 pt-10">
      {/* Input đăng bài mới */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/3.jpg" }} // Thay bằng Avatar người dùng hiện tại
          className="w-10 h-10 rounded-full mr-2"
        />
        <TextInput
          placeholder="Có gì mới?"
          placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#777"}
          value={newPostText}
          onChangeText={setNewPostText}
          className={`flex-1 border rounded-full px-4 py-2 text-base ${
            colorScheme === "dark"
              ? "border-gray-600 bg-[#171431] text-white"
              : "border-gray-700 bg-white text-black"
          }`}
          multiline
        />
        <TouchableOpacity
          onPress={addPost} 
          disabled={newPostText.trim() === "" && newPostMusicLink.trim() === ""}
          className={`ml-2 px-4 py-2 rounded-full ${newPostText.trim() || newPostMusicLink.trim() ? "bg-green-600" : "bg-gray-500"}`}
        >
          <Text className="text-white font-bold">Đăng</Text>
        </TouchableOpacity>
      </View>

      {/* Icons thêm ảnh, GIF, văn bản, ... (Cần thêm logic để gán vào newPostMusicLink/newPostText) */}
      <View className="flex-row justify-start mb-3 pl-12">
        <TouchableOpacity className="mr-4">
          <Icon name="image" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
        </TouchableOpacity>
        <TouchableOpacity className="mr-4">
          <Icon name="file-text" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
        </TouchableOpacity>
        <TouchableOpacity className="mr-4">
          <Icon name="more-horizontal" size={24} color={colorScheme === 'dark' ? '#a1a1aa' : '#000000'} />
        </TouchableOpacity>
      </View>

      {/* Danh sách bài đăng */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colorScheme === "dark" ? "#fff" : "#000"} className="mt-10" />
      ) : (
        <FlatList
          data={posts} 
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostItem
              {...item}
              onPostUpdate={(type, value) => updatePost(item.id, type, value)}
              onCommentPress={() => openCommentModal(item.id.toString())}
              onSharePress={handleShare}
            />
          )}
          showsVerticalScrollIndicator={false}
          onRefresh={loadPosts}
          refreshing={isLoading}
        />
      )}
      
      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={closeCommentModal}
        onAddComment={handleCommentAdded}
        postId={selectedPostId}
      />
    </View>
  );
};

export default SocialScreen;