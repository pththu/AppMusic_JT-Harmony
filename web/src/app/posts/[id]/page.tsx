"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Heart, MessageSquare, Play, Share } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import {
  mockPosts,
  mockUsers,
  mockTracks,
  mockLikes,
  getUserById,
  getCommentsByPostId,
  type Post,
} from "@/lib/mock-data";

export default function PostDetailPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);

  const post = mockPosts.find((p) => p.id === postId);
  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Bài đăng không tồn tại.</p>
      </div>
    );
  }

  const author = getUserById(post.userId);
  const comments = getCommentsByPostId(post.id);
  const track = post.songId
    ? mockTracks.find((t) => t.id === post.songId)
    : null;

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
                {author?.fullName || author?.username}
              </span>
              <span className="text-sm text-gray-500">@{author?.username}</span>
              <Badge variant={post.isCover ? "secondary" : "default"}>
                {post.isCover ? "Cover" : "Gốc"}
              </Badge>
            </div>
            <p className="text-gray-900 mb-4">{post.content}</p>
            {post.fileUrl && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={post.fileUrl} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ thẻ audio.
                </audio>
              </div>
            )}
            {track && (
              <div className="flex items-center space-x-2 mb-4">
                <Play className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Bài hát: {track.title}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{post.heartCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </div>
              <span>
                {format(new Date(post.createdAt), "MMM dd, yyyy 'at' HH:mm")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Likes Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Likes ({mockLikes.filter((like) => like.postId === post.id).length})
        </h2>
        <div className="space-y-4">
          {mockLikes
            .filter((like) => like.postId === post.id)
            .map((like) => {
              const likeUser = getUserById(like.userId);
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
                        {likeUser?.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-gray-900">
                      {likeUser?.fullName || likeUser?.username}
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
              const commentAuthor = getUserById(comment.userId);
              return (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {commentAuthor?.avatarUrl ? (
                      <img
                        src={commentAuthor.avatarUrl}
                        alt={commentAuthor.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {commentAuthor?.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {commentAuthor?.fullName || commentAuthor?.username}
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
