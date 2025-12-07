import { usePostStore, useUserStore } from "@/store";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "../ui";

const AddDialog = ({
  formData,
  setFormData,
  handleAddComment,
}) => {

  const { users } = useUserStore();
  const { posts } = usePostStore();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Thêm Bình Luận Mới</DialogTitle>
        <DialogDescription>
          Thêm bình luận mới vào hệ thống.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">
            Nội Dung
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="col-span-3"
            rows={3}
          />
        </div>
        {/* ... (Giữ nguyên các Select Post, Parent, User như cũ) ... */}
        {/* Để tiết kiệm không gian, tôi giữ nguyên logic form thêm mới vì nó không ảnh hưởng tới yêu cầu thay đổi Filter/Pagination */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="postId" className="text-right">
            Bài Đăng
          </Label>
          <Select
            value={formData.postId.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, postId: parseInt(value) })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id.toString()}>
                  {post.content.substring(0, 50)} ...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="userId" className="text-right">User</Label>
          <Select
            value={formData.userId.toString()}
            onValueChange={(value) => setFormData({ ...formData, userId: parseInt(value) })}
          >
            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>{user.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleAddComment}>Thêm Bình Luận</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default AddDialog;