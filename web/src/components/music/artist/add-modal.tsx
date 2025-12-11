import { Button, Input, Label, Modal } from "@/components/ui";
import { useMusicStore } from "@/store";

const AddArtistModal = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  formData,
  setFormData,
  handleAddArtist,
  selectedGenreId,
}) => {

  const { genres } = useMusicStore();

  const handleGenreChange = (genreName, isChecked, id) => {
    let updatedGenres = [...formData.genres]; // Sao chép mảng hiện tại

    if (isChecked) {
      if (!updatedGenres.includes(genreName)) {
        updatedGenres.push(genreName);
        selectedGenreId.push(id);
      }
    } else {
      updatedGenres = updatedGenres.filter(g => g !== genreName);
    }

    // Cập nhật state formData với mảng thể loại mới
    setFormData({ ...formData, genres: updatedGenres });
  };

  return (
    <Modal
      isOpen={isAddDialogOpen}
      onClose={() => setIsAddDialogOpen(false)}
      title="Thêm Nghệ Sĩ Mới"
      description="Điền thông tin nghệ sĩ vào form bên dưới."
    >
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <Label>Tên Nghệ Sĩ <span className="text-red-500">*</span></Label>
          <Input
            value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Sơn Tùng M-TP"
          />
        </div>
        <div className="space-y-2">
          <Label>Spotify ID (Tùy chọn)</Label>
          <Input
            value={formData.spotifyId}
            onChange={(e: any) => setFormData({ ...formData, spotifyId: e.target.value })}
            placeholder="Nhập ID Spotify..."
          />
        </div>
        <div className="space-y-2">
          <Label>Hình Ảnh URL</Label>
          <Input
            value={formData.imageUrl}
            onChange={(e: any) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label>Thể loại</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-3 rounded-md">
            {genres.map((genre: any) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`genre-${genre.id}`}
                  checked={formData.genres.includes(genre.name)}
                  onChange={(e) => handleGenreChange(genre.name, e.target.checked, genre.id)}
                />
                <label
                  htmlFor={`genre-${genre.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {genre.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Số lượng Share (Giả lập)</Label>
          <Input
            type="number"
            value={formData.shareCount}
            onChange={(e: any) => setFormData({ ...formData, shareCount: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleAddArtist} disabled={!formData.name}>Thêm Mới</Button>
        </div>
      </div>
    </Modal>
  )
}

export default AddArtistModal;