import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui"

const PreviewDialog = ({
  isPreviewOpen,
  setIsPreviewOpen,
  previewPost,
}) => {
  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Bài Đăng</DialogTitle>
          <DialogDescription>Xem nhanh nội dung bài đăng.</DialogDescription>
        </DialogHeader>
        {previewPost && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">ID: {previewPost.id}</p>
              <p className="text-base text-gray-900 whitespace-pre-wrap">
                {previewPost.content}
              </p>
            </div>
            {previewPost.fileUrl && (
              <div className="text-sm text-green-700 break-all">
                File: {previewPost.fileUrl}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PreviewDialog;