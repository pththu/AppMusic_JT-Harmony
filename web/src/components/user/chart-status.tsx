import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const ChartStatus = ({
  statusDistributionData,
  userStats,
}) => {
  return (
    <Card className="md:col-span-4 lg:col-span-3 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="mr-2 h-5 w-5 text-green-600" />
          Chất Lượng
        </CardTitle>
        <CardDescription>Phân bố trạng thái tài khoản</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
            <div className="text-xl font-bold text-gray-900">{userStats.totalUsers}</div>
            <div className="text-xs text-gray-500">Users</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChartStatus;