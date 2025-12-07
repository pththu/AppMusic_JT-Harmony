import React from "react";
import {
  Calendar,
  Mail,
  UserIcon,
  Shield,
  Music,
  Fingerprint,
  Activity,
  X
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- Inline Modal Component để tránh lỗi import ---
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-xl shadow-xl w-full relative max-h-[90vh] overflow-y-auto flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const FollowerModal = ({
  selectedFollowerDetail,
  setSelectedFollowerDetail,
}) => {
  // Helper: Dịch giới tính
  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  // Helper: Style cho Status
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
      locked: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      banned: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    };
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      locked: "Đã khóa",
      banned: "Bị cấm"
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Helper: Format Date an toàn
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return format(new Date(dateString), "dd MMM, yyyy HH:mm", { locale: vi });
    } catch (e) {
      return "Ngày không hợp lệ";
    }
  };

  return (
    <Modal
      isOpen={!!selectedFollowerDetail}
      onClose={() => setSelectedFollowerDetail(null)}
      title="Hồ Sơ Người Dùng"
      className="max-w-lg" // Tăng độ rộng để chứa nhiều thông tin hơn
    >
      {selectedFollowerDetail && (
        <div className="p-6 space-y-6">

          {/* --- HEADER: Avatar, Tên, Trạng thái --- */}
          <div className="flex flex-col items-center text-center relative">
            <div className="relative">
              <img
                src={selectedFollowerDetail.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
                alt={selectedFollowerDetail.username}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
              />
              <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                {/* Icon nhỏ hiển thị loại tài khoản chính */}
                {selectedFollowerDetail.accountType?.includes('google') ? (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-red-500">G</div>
                ) : selectedFollowerDetail.accountType?.includes('facebook') ? (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">f</div>
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><UserIcon size={12} /></div>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-3">{selectedFollowerDetail.fullName}</h2>
            <p className="text-gray-500 font-medium">@{selectedFollowerDetail.username}</p>

            <div className="mt-2 flex gap-2 items-center">
              {getStatusBadge(selectedFollowerDetail.status)}
              <span className="text-xs text-gray-400">ID: {selectedFollowerDetail.id}</span>
            </div>

            {selectedFollowerDetail.bio && (
              <p className="mt-3 text-sm text-gray-600 italic px-4">
                "{selectedFollowerDetail.bio}"
              </p>
            )}
          </div>

          <div className="border-t border-gray-100"></div>

          {/* --- INFO GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Email */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-sm text-gray-900 truncate" title={selectedFollowerDetail.email}>
                  {selectedFollowerDetail.email}
                </p>
              </div>
            </div>

            {/* Giới tính */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <UserIcon className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Giới tính</p>
                <p className="text-sm text-gray-900">
                  {getGenderLabel(selectedFollowerDetail.gender)}
                </p>
              </div>
            </div>

            {/* Loại tài khoản */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <Fingerprint className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Đăng nhập qua</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedFollowerDetail.accountType?.map((type: string, idx: number) => (
                    <span key={idx} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vai trò */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <Shield className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Vai trò</p>
                <p className="text-sm text-gray-900">
                  {selectedFollowerDetail.roleId === 1 ? 'Admin' : 'User'} <span className="text-gray-400 text-xs">(ID: {selectedFollowerDetail.roleId})</span>
                </p>
              </div>
            </div>

            {/* Ngày tham gia */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <Calendar className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Ngày tham gia</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedFollowerDetail.createdAt)}
                </p>
              </div>
            </div>

            {/* Đăng nhập cuối */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <Activity className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Hoạt động gần nhất</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedFollowerDetail.lastLogin)}
                </p>
              </div>
            </div>
          </div>

          {/* --- GENRES --- */}
          {selectedFollowerDetail.favoritesGenres && selectedFollowerDetail.favoritesGenres.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Music className="w-4 h-4 text-blue-500" /> Sở thích âm nhạc
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFollowerDetail.favoritesGenres.map((genre: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- FOOTER --- */}
          <div className="mt-6 flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => setSelectedFollowerDetail(null)}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FollowerModal;