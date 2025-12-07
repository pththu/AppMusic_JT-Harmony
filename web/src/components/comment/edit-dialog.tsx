import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea } from "../ui"

const EditDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  formData,
  setFormData,
  handleEditComment,
}) => {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Bình Luận</DialogTitle>
          <DialogDescription>Cập nhật nội dung bình luận.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-content" className="text-right">
              Nội Dung
            </Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fileUrl" className="text-right">
              URL File
            </Label>
            <Input
              id="edit-fileUrl"
              value={formData.fileUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, fileUrl: e.target.value })
              }
              className="col-span-3"
              placeholder="URL của file đính kèm (tùy chọn)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEditComment}>Cập Nhật Bình Luận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog