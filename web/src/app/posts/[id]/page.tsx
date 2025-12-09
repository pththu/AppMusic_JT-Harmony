"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Heart, MessageSquare, Share } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { getPostAdmin, getPostLikesAdmin, type AdminPost, type PostLikeUser } from "@/services";
import { fetchAllComments, type AdminComment } from "@/services/commentService";

interface LikeItem {
  id: number;
  userId: number;
  postId: number;
  likedAt: string;
  User?: PostLikeUser;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);

  const [post, setPost] = useState<AdminPost | null>(null);
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(postId)) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postRes, likesRes, commentsRes] = await Promise.all([
          getPostAdmin(postId),
          getPostLikesAdmin(postId, {}),
          fetchAllComments({ postId }),
        ]);

        if (cancelled) return;

        setPost(postRes);

        const normalizedLikes: LikeItem[] = Array.isArray(likesRes)
          ? (likesRes as any[]).map((item: any, idx) => ({
              id: item.id ?? idx,
              userId: item.userId ?? item.User?.id,
              postId: postId,
              likedAt: item.likedAt || item.liked_at || new Date().toISOString(),
              User: item.User,
            }))
          : [];
        setLikes(normalizedLikes);

        setComments(Array.isArray(commentsRes) ? commentsRes : []);
      } catch (e: any) {
        console.error("Failed to load post detail:", e);
        if (!cancelled) {
          setError("Không tải được dữ liệu bài đăng.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (isNaN(postId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ID bài đăng không hợp lệ.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải dữ liệu bài đăng...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{error || "Bài đăng không tồn tại."}</p>
      </div>
    );
  }

  const author = post.User;
  const likeCount = post.likeCount ?? post.heartCount ?? likes.length;
  const commentCount = post.commentCount ?? comments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi Tiết Bài Đăng
          </h1>
          <p className="text-gray-600">ID: {post.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {author?.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <span className="text-lg font-medium text-gray-600">
                {author?.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-gray-900">
                {author?.fullName || author?.username || `User #${post.userId}`}
              </span>
              <span className="text-sm text-gray-500">@{author?.username}</span>
              <Badge variant={post.isCover ? "secondary" : "default"}>
                {post.isCover ? "Cover" : "Gốc"}
              </Badge>
            </div>
            <p className="text-gray-900 mb-4">{post.content}</p>
            {Array.isArray(post.fileUrl) && post.fileUrl.length > 0 && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={post.fileUrl[0]} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ thẻ audio.
                </audio>
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </div>
              <span>
                {post.createdAt
                  ? format(new Date(post.createdAt), "MMM dd, yyyy 'at' HH:mm")
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Likes Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Likes ({likes.length})
        </h2>
        <div className="space-y-4">
          {likes.map((like) => {
              const likeUser = like.User;
              return (
                <div key={like.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {likeUser?.avatarUrl ? (
                      <img
                        src={likeUser.avatarUrl}
                        alt={likeUser.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {likeUser?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-gray-900">
                      {likeUser?.fullName || likeUser?.username || `User #${like.userId}`}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      @{likeUser?.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(like.likedAt), "MMM dd, yyyy 'at' HH:mm")}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Shares Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Shares ({post.shareCount})
        </h2>
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Share className="h-4 w-4" />
            <span>Đã được chia sẻ {post.shareCount} lần</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Bình Luận ({comments.length})
          </h2>
          <div className="space-y-4">
            {comments.map((comment) => {
              const c: any = comment as any;
              const author = c.User as { avatarUrl?: string; username?: string; fullName?: string } | undefined;
              return (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {author?.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {author?.username?.charAt(0).toUpperCase() || `U${comment.userId}`}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {author?.fullName || author?.username || `User #${comment.userId}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(comment.createdAt),
                          "MMM dd, yyyy 'at' HH:mm"
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
