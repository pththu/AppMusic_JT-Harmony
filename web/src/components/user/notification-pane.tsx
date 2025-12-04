import { Bell, MoreHorizontal } from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui";
import { vi } from "date-fns/locale";

const NotificationPane = ({
  recentNewUsers,
  format,
}) => {
  return (
    <Card className="md:col-span-12 lg:col-span-4 shadow-sm border-l-4 border-l-orange-400 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-500" />
            Thành Viên Mới
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
            {recentNewUsers.length} mới
          </Badge>
        </div>
        <CardDescription>Người dùng đăng ký trong 7 ngày qua</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {recentNewUsers.length > 0 ? (
            recentNewUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">{user.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate w-[120px]">{user.fullName || user.username}</p>
                    <p className="text-xs text-gray-500">{format(new Date(user.createdAt), "dd/MM", { locale: vi })}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Chưa có thành viên mới nào trong tuần này.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationPane;