"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { format, isAfter, startOfDay, endOfDay, subDays, set } from "date-fns";
import { se, vi } from "date-fns/locale";
import {
  Search,
  Plus,
  ArrowUpDown,
  UserCheck,
  UserX,
  Lock,
  Users,
  LogIn,
  Filter,
  XCircle,
  Calendar as CalendarIcon,
  MoreVertical,
  Trash2,
  ShieldAlert,
  Unlock,
  Eye,
  X,
  Upload,
  Check,
  AlertCircle,
  Trash,
  Trash2Icon
} from "lucide-react";

// import { useRoleData } from "@/hooks/useRoleData";
import { Badge, Button, DropdownAction, Input } from "@/components/ui";
import StatCard from "@/components/user/stat-card";
import { COLORS, ITEMS_PER_PAGE, ONLINE_THRESHOLD_DAYS, SortDirection, SortKey, User } from "@/constants";
import ChartDay from "@/components/user/chart-day";
import ChartStatus from "@/components/user/chart-status";
import NotificationPane from "@/components/user/notification-pane";
import { useUserStore } from "@/store";
import { BannedUser, CreateUser, DeleteUser, DeleteUsers, UnlockUser } from "@/services";
import toast from "react-hot-toast";
import FollowerModal from "@/components/follow/follower-detail-modal";
import CreateUserModal from "@/components/user/add-user-modal";
import { useRoleData } from "@/hooks/useRoleData";

const getPaginationItems = (currentPage: number, totalPages: number): (number | '...')[] => {
  const MAX_ITEMS = 5;

  if (totalPages <= MAX_ITEMS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  pages.add(currentPage);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const finalItems: (number | '...')[] = [];

  if (sortedPages[0] > 1) {
    finalItems.push('...');
  }
  for (const element of sortedPages) {
    finalItems.push(element);
  }
  if (sortedPages[sortedPages.length - 1] < totalPages) {
    finalItems.push('...');
  }

  return finalItems;
};

export default function UsersPage() {
  const [selectedFollowerDetail, setSelectedFollowerDetail] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showBtnDelete, setShowBtnDelete] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // State cho bộ lọc ngày
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const { users, setUsers } = useUserStore();
  const { roles } = useRoleData();

  // --- Logic Thống kê & Biểu đồ ---
  const { userStats, accessTrendData, statusDistributionData, recentNewUsers } = useMemo(() => {
    const totalUsers = users.length;
    let activeUsers = 0, lockedUsers = 0, inactiveUsers = 0, onlineUsers = 0, bannedUsers = 0;
    const sevenDaysAgo = subDays(new Date(), ONLINE_THRESHOLD_DAYS);

    const trendMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      trendMap.set(format(date, "dd/MM"), 0);
    }

    const recentJoiners: User[] = [];

    users.forEach((user: User) => {
      switch (user.status) {
        case 'active': activeUsers++; break;
        case 'inactive': inactiveUsers++; break;
        case 'banned': bannedUsers++; break;
        case 'locked': lockedUsers++; break;
      }

      if (user.status === 'active' && user.lastLogin && isAfter(new Date(user.lastLogin), sevenDaysAgo)) {
        onlineUsers++;
        const loginDate = format(new Date(user.lastLogin), "dd/MM");
        if (trendMap.has(loginDate)) {
          trendMap.set(loginDate, (trendMap.get(loginDate) || 0) + 1);
        }
        if (isAfter(new Date(user.createdAt), sevenDaysAgo)) {
          recentJoiners.push(user);
        }
      }
    });

    const accessTrendData = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    const statusDistributionData = [
      { name: "Hoạt động", value: activeUsers, color: COLORS.active },
      { name: "Không hoạt động", value: inactiveUsers, color: COLORS.inactive },
      { name: "Đã khóa", value: lockedUsers, color: COLORS.locked },
      { name: "Bị cấm", value: bannedUsers, color: COLORS.banned },
    ].filter(item => item.value > 0);

    recentJoiners.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      userStats: { totalUsers, activeUsers, lockedUsers, inactiveUsers, bannedUsers, onlineUsers },
      accessTrendData,
      statusDistributionData,
      recentNewUsers: recentJoiners
    };
  }, [users]);

  const getRoleById = (id) => roles.find((r) => r.id === id);

  // --- Logic Lọc & Sắp xếp ---
  const processedUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm || statusFilter !== "all" || roleFilter !== "all" || dateFilter.start || dateFilter.end) {
      result = result.filter((user: User) => {
        const matchesSearch = !searchTerm ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesRole = roleFilter === "all" || user.roleId?.toString() === roleFilter;

        // Logic lọc ngày tạo (createdAt)
        let matchesDate = true;
        if (dateFilter.start || dateFilter.end) {
          const createdDate = new Date(user.createdAt);
          if (dateFilter.start && createdDate < startOfDay(new Date(dateFilter.start))) {
            matchesDate = false;
          }
          if (dateFilter.end && createdDate > endOfDay(new Date(dateFilter.end))) {
            matchesDate = false;
          }
        }

        return matchesSearch && matchesStatus && matchesRole && matchesDate;
      });
    }

    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        let aValue: any = a[sortConfig.key as keyof User];
        let bValue: any = b[sortConfig.key as keyof User];

        if (sortConfig.key === 'roleName') {
          aValue = getRoleById(Number(a.roleId))?.name || '';
          bValue = getRoleById(Number(b.roleId))?.name || '';
        } else if (sortConfig.key === 'fullNameDisplay') {
          aValue = a.fullName || a.username;
          bValue = b.fullName || b.username;
        } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastLogin') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, searchTerm, statusFilter, roleFilter, dateFilter, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, roleFilter, dateFilter]);

  const requestSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;
    setUsers(users.filter((user: any) => user.id && user.id !== userId));
    const responss = await DeleteUser(userId);
    if (currentPage > 1 && paginatedUsers.length === 1) {
      setCurrentPage(currentPage - 1);
    }

    if (responss.success) {
      toast.success("Xóa người dùng thành công.");
    } else {
      toast.error("Lỗi khi xóa người dùng: " + (responss as any).message);
    }
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const validateData = (formData) => {
    const isExistingUsername = users.some((user) => user.username.toLowerCase() === formData.username.toLowerCase());
    const isExistingEmail = users.some((user) => user.email?.toLowerCase() === formData.email.toLowerCase());

    if (isExistingUsername) {
      toast.error("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
      return false;
    }

    if (isExistingEmail) {
      toast.error("Email đã tồn tại. Vui lòng sử dụng email khác.");
      return false;
    }
    return true;
  }

  const handleCreateUserSubmit = async (formData) => {
    if (!validateData(formData)) {
      return;
    }
    const newUser = {
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      roleId: formData.roleId,
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      gender: formData.gender,
      favoritesGenres: formData.favoritesGenres,
      accountType: formData.accountType,
      avatarUrl: formData.avatarPreview,
    };

    setUsers([{
      id: users.length > 0 ? Math.max(...users.map(u => Number(u.id))) + 1 : 1,
      ...newUser,
    }, ...users]);
    setIsCreateModalOpen(false);
    toast.success("Thêm người dùng thành công!");
    const response = await CreateUser(newUser);
    if (!response.success) {
      toast.error("Đã có lỗi khi lưu vào server: " + response.message);
      setUsers(users.filter((user) => user.username !== newUser.username));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setDateFilter({ start: "", end: "" });
  };

  const handlePermission = async (action: string, userId: string) => {
    if (!userId) return;
    if (action === 'ban') {
      setUsers(users.map((user: any) => user.id === userId ? { ...user, status: 'banned' } : user));
      const response = await BannedUser(userId);
      if (response.success) {
        toast.success("Cấm người dùng thành công.");
      } else {
        toast.error("Lỗi khi cấm người dùng: " + (response as any).message);
      }
    } else if (action === 'unlock') {
      setUsers(users.map((user: any) => user.id === userId ? { ...user, status: 'active' } : user));
      const response = await UnlockUser(userId);
      if (response.success) {
        toast.success("Mở khóa người dùng thành công.");
      } else {
        toast.error("Lỗi khi mở khóa người dùng: " + (response as any).message);
      }
    }
  }

  const getStatusBadge = (status: User["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
      inactive: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
      banned: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
      locked: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
    };
    const labels = { active: "Hoạt Động", inactive: "Không Hoạt Động", banned: "Bị Cấm", locked: "Đã Khóa" };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const handleClick = (e) => {
    console.log(e.target.checked)
    console.log(selectedUserIds)
    if (e.target.id === "selectAll") {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = e.target.checked;
      });
      if (e.target.checked) {
        setShowBtnDelete(true);
        const allUserIds = users.map((user: any) => user.id);
        setSelectedUserIds(allUserIds);
      } else {
        setShowBtnDelete(false);
        setSelectedUserIds([]);
      }
    } else {
      if (e.target.checked) {
        setSelectedUserIds((prev) => [...prev, e.target.id]);
        setShowBtnDelete(true);
      } else {
        if (selectedUserIds.length - 1 === 0) {
          setShowBtnDelete(false);
        }
        setSelectedUserIds((prev) => prev.filter((id) => id !== e.target.id));
      }
    }
  }

  const handleDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const response = await DeleteUsers(selectedUserIds);
    if (response.success) {
      toast.success(`Đã xóa ${selectedUserIds.length} người dùng.`);
      const newUsers = users.filter((user) => !selectedUserIds.includes(String(user.id)));
      setUsers(newUsers);
      setSelectedUserIds([]);
      setShowBtnDelete(false);
    } else {
      toast.error("Lỗi khi xóa người dùng: " + response.message);
    }
  }

  return (
    <div className="space-y-6 pb-10 bg-gray-50/50 min-h-screen p-6 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê thông tin người dùng</h1>
          <p className="text-gray-600">Thống kê, phân tích và theo dõi hoạt động người dùng</p>
        </div>
      </div>

      {/* --- Section 1: Quick Stats Cards --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Tổng Số Người Dùng" value={userStats.totalUsers} icon={Users} iconClass="text-blue-500" />
        <StatCard title="Hoạt Động" value={userStats.activeUsers} icon={UserCheck} iconClass="text-green-500" />
        <StatCard title="Đã Khóa/Cấm" value={userStats.lockedUsers} icon={Lock} iconClass="text-red-500" />
        <StatCard title="Không Hoạt Động" value={userStats.inactiveUsers} icon={UserX} iconClass="text-yellow-500" />
        <StatCard title="Truy cập (7 ngày)" value={userStats.onlineUsers} icon={LogIn} iconClass="text-indigo-500" />
      </div>

      {/* --- Section 2: Charts & Notifications --- */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Chart 1: Truy cập (7 ngày) */}
        <ChartDay accessTrendData={accessTrendData} />

        {/* Chart 2: Chất lượng người dùng (Status) */}
        <ChartStatus
          statusDistributionData={statusDistributionData}
          userStats={userStats}
        />

        {/* Notification Panel: Người dùng mới */}
        <NotificationPane
          recentNewUsers={recentNewUsers}
          format={format}
        />
      </div>
      {/* --- Section 3: Action Toolbar & Filters (Nút thêm mới nằm ở đây) --- */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
        {/* Hàng 1: Tìm kiếm & Nút Thêm Mới */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-row gap-4">
            <Button
              onClick={handleCreateUser}
              className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm người dùng
            </Button>
            {showBtnDelete && <Button
              onClick={() => handleDeleteUsers()}
              className="w-full md:w-auto bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center justify-center gap-2"
            >
              <Trash2Icon className="w-4 h-4" /> Xóa người dùng
            </Button>}
          </div>
        </div>

        {/* Hàng 2: Các bộ lọc chi tiết */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500 mr-2">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc:
          </div>

          {/* Bộ lọc ngày: Từ ngày */}
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <input
              type="date"
              placeholder="Từ ngày"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-600 cursor-pointer"
            />
          </div>

          <span className="text-gray-400">-</span>

          {/* Bộ lọc ngày: Đến ngày */}
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-600 cursor-pointer"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="banned">Bị Cấm</option>
            <option value="locked">Đã Khóa</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map((role: any) => (
              <option key={role.id} value={role.id.toString()}>{role.name}</option>
            ))}
          </select>

          {(statusFilter !== 'all' || roleFilter !== 'all' || dateFilter.start || dateFilter.end || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" /> Xóa lọc
            </Button>
          )}
        </div>
      </div>

      {/* --- Section 4: Table --- */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700">
                <div className="flex items-center">
                  <input type="checkbox" id="selectAll" name="selectAll" onChange={(e) => handleClick(e)} className="h-4 w-4 border-gray-300 rounded" />
                </div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700">
                <div className="flex items-center">STT</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => requestSort('fullNameDisplay')}>
                <div className="flex items-center">Người Dùng {sortConfig.key === 'fullNameDisplay' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div>
              </th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => requestSort('roleName')}>
                <div className="flex items-center">Vai Trò {sortConfig.key === 'roleName' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => requestSort('status')}>
                <div className="flex items-center">Trạng Thái {sortConfig.key === 'status' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => requestSort('createdAt')}>
                <div className="flex items-center">Ngày Tạo {sortConfig.key === 'createdAt' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div>
              </th>
              <th className="px-4 py-3 w-[70px]">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" id={user.id} name={user.id} onChange={(e) => handleClick(e)} className="h-4 w-4 border-gray-300 rounded" />
                  </td>
                  <td className="px-4 py-3">{index + 1 || "N/A"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName || user.username}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.email || "N/A"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-normal bg-white text-gray-700 border-gray-300">
                      {getRoleById(Number(user.roleId))?.name || "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-3">
                    {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownAction
                      user={user}
                      onDelete={handleDeleteUser}
                      onPermission={handlePermission}
                      setSelectedFollowerDetail={setSelectedFollowerDetail}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-900">Không tìm thấy người dùng</p>
                    <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    <Button variant="link" onClick={handleResetFilters} className="mt-2 text-blue-600">Xóa bộ lọc</Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500">
          Hiển thị <strong>{paginatedUsers.length}</strong>/<strong>{processedUsers.length}</strong> người dùng (Trang {currentPage}/{totalPages || 1})
        </div>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Trước</Button>
          {getPaginationItems(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`e-${index}`} className="px-2 py-1 text-gray-500 text-sm flex items-center">...</span>
            ) : (
              <Button
                key={item}
                variant={currentPage === item ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(item as number)}
                className={currentPage === item ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
              >
                {item}
              </Button>
            )
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}>Sau</Button>
        </div>
      </div>

      <FollowerModal
        selectedFollowerDetail={selectedFollowerDetail}
        setSelectedFollowerDetail={setSelectedFollowerDetail}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUserSubmit}
        roles={roles}
      />
    </div>
  );
}