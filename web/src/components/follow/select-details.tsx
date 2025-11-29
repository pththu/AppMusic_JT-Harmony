import { Clock, Eye, Filter, TrendingUp, Users, X } from "lucide-react"
import { Badge, Card } from "../ui"
import { vi } from "date-fns/locale"

const SelectDetails = ({
  selectedItem,
  setSelectedItem,
  activeTab,
  timeFilter,
  followersPreview,
  setShowAllFollowersModal,
  setSelectedFollowerDetail,
  format,
}) => {
  return (
    <div className="lg:col-span-1">
      {selectedItem ? (
        <Card className="sticky top-6 animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 rounded-t-xl relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <img
                src={selectedItem.avatarUrl || selectedItem.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
              />
              <h3 className="text-xl font-bold text-gray-900 px-2">
                {activeTab === "artists" ? selectedItem.name : selectedItem.fullName}
              </h3>
              <Badge className={`mt-2 ${activeTab === 'artists' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                #{selectedItem.rank} {activeTab === 'artists' ? 'Top Nghệ Sĩ' : 'Top User'}
              </Badge>

              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Followers</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedItem.followerCount}</p>
                  <p className="text-[10px] text-gray-400 mt-1">trong {timeFilter === '7days' ? '7 ngày' : timeFilter === '30days' ? '30 ngày' : 'giai đoạn này'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Xu Hướng</p>
                  <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" /> High
                  </p>
                  <p className="text-[10px] text-green-600/70 mt-1">Đang tăng trưởng</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" /> Followers gần đây
            </h4>
            <button
              onClick={() => setShowAllFollowersModal(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 rounded"
            >
              Xem tất cả
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
            {followersPreview.length > 0 ? (
              followersPreview.map((record: any) => (
                <div key={record.id} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-100 mb-1">
                  <img
                    src={record.follower?.avatarUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
                    className="w-9 h-9 rounded-full bg-gray-200 object-cover"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{record.follower?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(record.createdAt), "dd MMM, HH:mm", { locale: vi })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFollowerDetail(record.follower)}
                    className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                <Users className="w-8 h-8 text-gray-300 mb-2" />
                Chưa có lượt theo dõi nào trong khoảng thời gian này.
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="h-64 flex flex-col items-center justify-center text-gray-400 p-6 text-center border-dashed border-2 bg-gray-50/30 sticky top-6">
          <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
            <Filter className="w-8 h-8 text-blue-300" />
          </div>
          <p className="font-medium text-gray-500">Chọn một mục để xem chi tiết</p>
          <p className="text-sm text-gray-400 mt-1">Nhấp vào hàng bất kỳ trong bảng bên trái</p>
        </Card>
      )}
    </div>
  )
}

export default SelectDetails;