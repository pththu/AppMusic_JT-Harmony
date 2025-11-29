import { ArrowRight, Eye, Music, Search } from "lucide-react";
import { Card } from "../ui";

const LeaderboardList = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  topArtists,
  topUsers,
  visibleCount,
  selectedItem,
  setSelectedItem,
  setVisibleCount,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white sticky top-0 z-10 gap-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("artists")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "artists"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Top Nghệ Sĩ
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "users"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Top Người Dùng
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm kiếm ${activeTab === 'artists' ? 'nghệ sĩ' : 'người dùng'}...`}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                <th className="px-6 py-4 font-semibold w-16 text-center">Hạng</th>
                <th className="px-6 py-4 font-semibold">{activeTab === "artists" ? "Nghệ Sĩ" : "Người Dùng"}</th>
                <th className="px-6 py-4 font-semibold text-right">Lượt Theo Dõi</th>
                <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Mức Độ</th>
                <th className="px-6 py-4 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(activeTab === "artists" ? topArtists : topUsers).slice(0, visibleCount).map((item) => {
                const maxCount = activeTab === "artists" ? (topArtists[0]?.followerCount || 1) : (topUsers[0]?.followerCount || 1);
                const percentage = Math.round(((item as any).followerCount / maxCount) * 100);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50/80 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-6 py-4 text-center">
                      {item.rank === 1 && <span className="text-xl drop-shadow-sm">🥇</span>}
                      {item.rank === 2 && <span className="text-xl drop-shadow-sm">🥈</span>}
                      {item.rank === 3 && <span className="text-xl drop-shadow-sm">🥉</span>}
                      {item.rank > 3 && <span className="text-sm font-bold text-gray-400">#{item.rank}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden group-hover:shadow-lg transition-shadow">
                            <img
                              src={item.avatarUrl || item.imageUrl || 'https://res.cloudinary.com/chaamz03/image/upload/v1763270755/kltn/JT_Harmony_aoi1iv.png'}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                            />
                          </div>
                          {activeTab === "artists" && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                              <Music className="w-2 h-2" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {activeTab === "artists" ? item.name : item.fullName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {activeTab === "artists" ? `ID: ${item.spotifyId.slice(0, 10).concat('...')}` : `@${item.username}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900">{(item as any).followerCount}</span>
                    </td>
                    <td className="px-6 py-4 text-right w-32 hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${activeTab === 'artists' ? 'bg-pink-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                        className={`p-2 rounded-full hover:shadow-sm transition-all ${selectedItem?.id === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(activeTab === "artists" ? topArtists : topUsers).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Không tìm thấy kết quả nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(activeTab === "artists" ? topArtists : topUsers).length > visibleCount && (
          <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <button
              onClick={() => setVisibleCount(20)}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Xem top 20 kết quả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LeaderboardList;