import { Calendar, Mail, MapPin, UserIcon } from "lucide-react";
import { vi } from "date-fns/locale";
import { Modal } from "../ui";

const FollowerModal = ({
  selectedFollowerDetail,
  setSelectedFollowerDetail,
  format,
}) => {
  return (
    <Modal
      isOpen={!!selectedFollowerDetail}
      onClose={() => setSelectedFollowerDetail(null)}
      title="Thông tin người dùng"
      className="max-w-md"
    >
      {selectedFollowerDetail && (
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <img
              src={selectedFollowerDetail.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
              className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-md mb-3 object-cover"
            />
            <h2 className="text-xl font-bold text-gray-900">{selectedFollowerDetail.fullName}</h2>
            <p className="text-gray-500 font-medium">@{selectedFollowerDetail.username}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-sm text-gray-900 break-all">{selectedFollowerDetail.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Giới tính</p>
                <p className="text-sm text-gray-900">
                  {selectedFollowerDetail.gender === 'Male' ? 'Nam' : selectedFollowerDetail.gender === 'Female' ? 'Nữ' : 'Khác'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Khu vực</p>
                <p className="text-sm text-gray-900">{selectedFollowerDetail.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Ngày tham gia</p>
                <p className="text-sm text-gray-900">
                  {selectedFollowerDetail.joinDate
                    ? format(new Date(selectedFollowerDetail.joinDate), "dd MMM yyyy", { locale: vi })
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setSelectedFollowerDetail(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default FollowerModal;