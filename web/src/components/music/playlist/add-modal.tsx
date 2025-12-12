"use client";

import { Button, Input, Label, Modal } from "@/components/ui";
import SelectNative from "../track/select-native";
import { useUserStore } from "@/store";
import SearchableUserSelect from "./search-user-select";
import { useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

const AddModal = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  newPlaylistData,
  setNewPlaylistData,
  handleAddPlaylist
}) => {

  const { users } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Tạo URL preview
      const previewUrl = URL.createObjectURL(file);
      
      setNewPlaylistData((prev: any) => ({
        ...prev,
        image: file,       // File gốc để gửi lên server
        imagePreview: previewUrl // URL để hiển thị
      }));
    }
  };

  // Xử lý khi submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang
    handleAddPlaylist();
  };

  // Xử lý xóa ảnh đã chọn (nếu cần)
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn click lan ra cha (mở file dialog)
    setNewPlaylistData((prev: any) => ({
        ...prev,
        image: null,
        imagePreview: null
    }));
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      isOpen={isAddDialogOpen}
      onClose={() => setIsAddDialogOpen(false)}
      title="Thêm Danh Sách Phát Mới"
      description="Tạo một playlist mới vào hệ thống."
    >
      {/* Bọc nội dung trong thẻ form */}
      <form onSubmit={handleSubmit} className="space-y-4 py-2 p-6">
        
        {/* Phần Upload Ảnh */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-blue-500 transition-colors bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            {newPlaylistData.imagePreview ? (
              <>
                <Image
                  src={newPlaylistData.imagePreview}
                  width={500}
                  height={500}
                  alt="Playlist Cover"
                  className="w-full h-full object-cover"
                />
                {/* Nút xóa ảnh khi hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500">
                <Upload className="w-8 h-8 mb-1" />
                <span className="text-[10px]">Upload Ảnh</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Nhấn để tải ảnh bìa (JPG, PNG)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {/* Tên Playlist */}
        <div className="space-y-2">
          <Label>Tên Playlist <span className="text-red-500">*</span></Label>
          <Input
            required
            placeholder="Nhập tên danh sách phát..."
            value={newPlaylistData.name}
            onChange={(e: any) => setNewPlaylistData({ ...newPlaylistData, name: e.target.value })}
          />
        </div>

        {/* Hàng chọn User và Chế độ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Người sở hữu <span className="text-red-500">*</span></Label>
            <SearchableUserSelect
              users={users}
              value={newPlaylistData.userId}
              onChange={(val: any) => setNewPlaylistData({ ...newPlaylistData, userId: val })}
              placeholder="Nhập tên để tìm kiếm..."
            />
          </div>
          <div className="space-y-2">
            <Label>Chế độ</Label>
            <SelectNative
              value={newPlaylistData.isPublic ? 'true' : 'false'}
              onChange={(val: any) => setNewPlaylistData({ ...newPlaylistData, isPublic: val === 'true' })}
              options={[
                { value: 'true', label: 'Công Khai' },
                { value: 'false', label: 'Riêng Tư' }
              ]}
              placeholder="Chọn chế độ"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <Label>Mô tả (Tùy chọn)</Label>
          <textarea
            className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 min-h-[80px]"
            placeholder="Mô tả nội dung playlist..."
            value={newPlaylistData.description}
            onChange={(e) => setNewPlaylistData({ ...newPlaylistData, description: e.target.value })}
          />
        </div>

        {/* Actions Footer */}
        <div className="flex flex-1 justify-end py-2 gap-2 border-t pt-4 mt-4">
          <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
            Hủy Bỏ
          </Button>
          <Button type="submit">
            Tạo Mới
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddModal;