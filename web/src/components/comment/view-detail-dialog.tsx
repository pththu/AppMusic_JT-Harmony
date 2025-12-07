import { usePostStore, useUserStore } from "@/store";
import { Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui";

const ViewDetailDialog = ({
  isViewDialogOpen,
  setIsViewDialogOpen,
  selectedComment,
  getCommentType,
  format,
}) => {

  const { users } = useUserStore();
  const { comments } = usePostStore();

  return (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi Tiết Bình Luận</DialogTitle>
          <DialogDescription>
            Xem thông tin bình luận và các phản hồi
          </DialogDescription>
        </DialogHeader>
        {selectedComment && (
          <div className="space-y-4">
            {/* Comment Info */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {(() => {
                    const author = users.find(u => u.id === selectedComment.userId);
                    return author?.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {author?.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {users.find(u => u.id === selectedComment.userId)?.fullName || "Unknown"}
                    </span>
                    <Badge variant="outline">
                      {getCommentType(selectedComment)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(
                      new Date(selectedComment.commentedAt),
                      "dd/MM/yyyy 'lúc' HH:mm"
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-900 mb-2">{selectedComment.content}</p>
              {selectedComment.fileUrl && (
                <div className="text-sm text-green-600">
                  File đính kèm: {selectedComment.fileUrl}
                </div>
              )}
            </div>

            {/* Replies */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Phản Hồi (
                {
                  comments.filter((c) => c.parentId === selectedComment.id)
                    .length
                }
                )
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {comments
                  .filter((c) => c.parentId === selectedComment.id)
                  .map((reply: any) => {
                    const replyAuthor = users.find(u => u.id === reply.userId);
                    return (
                      <div
                        key={reply.id}
                        className="border rounded p-3 bg-white ml-6"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            {replyAuthor?.avatarUrl ? (
                              <img
                                src={replyAuthor.avatarUrl}
                                alt={replyAuthor.username}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-600">
                                {replyAuthor?.username?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {replyAuthor?.fullName || replyAuthor?.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(
                              new Date(reply.commentedAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {reply.content}
                        </p>
                        {reply.fileUrl && (
                          <p className="text-xs text-green-600 mt-1">
                            File: {reply.fileUrl}
                          </p>
                        )}
                      </div>
                    );
                  })}
                {comments.filter((c) => c.parentId === selectedComment.id)
                  .length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Chưa có phản hồi nào
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewDetailDialog;