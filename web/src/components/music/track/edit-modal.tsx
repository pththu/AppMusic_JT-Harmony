import { Button, Modal } from "@/components/ui"

const EditModal = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
}) => {
  return (
    <Modal
      isOpen={isEditDialogOpen}
      onClose={() => setIsEditDialogOpen(false)}
      title="Chỉnh sửa bài hát"
      description="Cập nhật thông tin metadata cho bài hát này."
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={() => setIsEditDialogOpen(false)}>Lưu Thay Đổi</Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-sm text-gray-500 italic">Form chỉnh sửa sẽ được đặt tại đây (Tên, Nghệ sĩ, Album...)</p>
      </div>
    </Modal>
  )
}

export default EditModal;