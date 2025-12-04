import { Calendar, TrendingUp } from "lucide-react"

const HeaderSection = ({ timeFilter, setTimeFilter }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thống Kê Theo Dõi</h1>
        <p className="text-gray-500 mt-1">Tổng quan về xu hướng quan tâm của người dùng trên hệ thống</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white border border-gray-200 rounded-lg flex items-center p-1 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer py-1 pl-2 pr-8"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="6months">6 tháng qua</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors">
          <TrendingUp className="w-4 h-4" /> Xuất Báo Cáo
        </button>
      </div>
    </div>
  )
}

export default HeaderSection;