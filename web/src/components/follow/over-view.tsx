import { Music, Trophy, Users } from "lucide-react"
import { Card } from "../ui"

const OverView = ({ totalArtistFollows, totalUserFollows, mostPopularArtist, mostPopularUser, timeFilter }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500">Tổng Follow Artist</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalArtistFollows}</h3>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded mt-2 inline-block">Toàn thời gian</span>
        </div>
        <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
          <Music className="w-6 h-6" />
        </div>
      </Card>

      <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500">Tổng Follow User</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalUserFollows}</h3>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">Toàn thời gian</span>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <Users className="w-6 h-6" />
        </div>
      </Card>

      <Card className="p-5 flex items-start justify-between relative overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative z-10">
          <p className="text-sm font-medium text-gray-500">Artist Hot Nhất ({timeFilter})</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[150px]">{mostPopularArtist?.name || "N/A"}</h3>
          <p className="text-xs text-gray-500 mt-1">{mostPopularArtist?.followerCount || 0} lượt theo dõi mới</p>
        </div>
        <div className="p-3 bg-amber-100 rounded-lg text-amber-600 relative z-10">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-full opacity-50" />
      </Card>

      <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <p className="text-sm font-medium text-gray-500">User Hot Nhất ({timeFilter})</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{mostPopularUser?.fullName || "N/A"}</h3>
          <p className="text-xs text-gray-500 mt-1">{mostPopularUser?.followerCount || 0} lượt theo dõi mới</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
          <Users className="w-6 h-6" />
        </div>
      </Card>
    </div>
  )
}

export default OverView;