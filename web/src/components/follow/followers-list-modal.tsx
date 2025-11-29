import { Clock, Trash2 } from "lucide-react";
import { vi } from "date-fns/locale";
import { Modal } from "../ui";

const FollowersListModal = ({
  showAllFollowersModal,
  setShowAllFollowersModal,
  selectedItem,
  followersList,
  setSelectedFollowerDetail,
  handleDeleteFollow,
  activeTab,
  format,
}) => {
  return (
    <Modal
      isOpen={showAllFollowersModal}
      onClose={() => setShowAllFollowersModal(false)}
      title={`Danh sách người theo dõi (${selectedItem?.followerCount || 0})`}
      className="max-w-2xl h-[600px]"
    >
      <div className="divide-y divide-gray-100">
        {followersList.map((record: any) => (
          <div key={record.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={record.follower?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
                className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{record.follower?.fullName}</p>
                <p className="text-xs text-gray-500">@{record.follower?.username}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Đã theo dõi: {format(new Date(record.createdAt), "dd MMM yyyy 'lúc' HH:mm", { locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <button
                onClick={() => setSelectedFollowerDetail(record.follower)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                Chi tiết
              </button>
              <button
                onClick={() => handleDeleteFollow(record.id, activeTab === "artists" ? "artist" : "user")}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa lượt theo dõi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {followersList.length === 0 && (
          <div className="p-12 text-center text-gray-500">Không có dữ liệu.</div>
        )}
      </div>
    </Modal>
  )
}

export default FollowersListModal;