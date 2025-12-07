import { useMusicStore, useUserStore } from "@/store";
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea } from "../ui"

const AddDialog = ({
  formData,
  setFormData,
  handleAddPost,
}) => {
  const { users } = useUserStore();
  const { tracks } = useMusicStore();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Thêm Bài Đăng Mới</DialogTitle>
        <DialogDescription>
          Thêm bài đăng mới vào hệ thống.
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
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="col-span-3"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="userId" className="text-right">
            Người Dùng
          </Label>
          <select
            id="userId"
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
          <Label htmlFor="fileUrl" className="text-right">
            URL File
          </Label>
          <Input
            id="fileUrl"
            value={formData.fileUrl}
            onChange={(e) =>
              setFormData({ ...formData, fileUrl: e.target.value })
            }
            className="col-span-3"
            placeholder="https://example.com/file.mp3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="songId" className="text-right">
            Bài Hát
          </Label>
          <select
            id="songId"
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
          <Label htmlFor="isCover" className="text-right">
            Loại
          </Label>
          <select
            id="isCover"
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
            <Label htmlFor="originalSongId" className="text-right">
              Bài Gốc
            </Label>
            <select
              id="originalSongId"
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
        <Button onClick={handleAddPost}>Thêm Bài Đăng</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default AddDialog