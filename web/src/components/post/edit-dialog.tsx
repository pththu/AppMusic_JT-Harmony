import { Dialog } from "@radix-ui/react-dialog"
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea } from "../ui"
import { useMusicStore, useUserStore } from "@/store"

const EditDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  formData,
  setFormData,
  handleEditPost,
}) => {

  const { users } = useUserStore();
  const { tracks } = useMusicStore();

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Bài Đăng</DialogTitle>
          <DialogDescription>Cập nhật thông tin bài đăng.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-content" className="text-right">
              Nội Dung
            </Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="col-span-3"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-userId" className="text-right">
              Người Dùng
            </Label>
            <select
              id="edit-userId"
              value={formData.userId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userId: parseInt(e.target.value),
                })
              }
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fileUrl" className="text-right">
              URL File
            </Label>
            <Input
              id="edit-fileUrl"
              value={formData.fileUrl}
              onChange={(e) =>
                setFormData({ ...formData, fileUrl: e.target.value })
              }
              className="col-span-3"
              placeholder="https://example.com/file.mp3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-songId" className="text-right">
              Bài Hát
            </Label>
            <select
              id="edit-songId"
              value={formData.songId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  songId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Không chọn</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name + ' - ' + track?.artists.map((a) => a.name).join(', ')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-isCover" className="text-right">
              Loại
            </Label>
            <select
              id="edit-isCover"
              value={formData.isCover ? "cover" : "original"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isCover: e.target.value === "cover",
                })
              }
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="original">Gốc</option>
              <option value="cover">Cover</option>
            </select>
          </div>
          {formData.isCover && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-originalSongId" className="text-right">
                Bài Gốc
              </Label>
              <select
                id="edit-originalSongId"
                value={formData.originalSongId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalSongId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Không chọn</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name + ' - ' + track?.artists.map((a) => a.name).join(', ')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleEditPost}>Cập Nhật Bài Đăng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog