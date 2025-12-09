"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { format, isAfter, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Search,
  Plus,
  ArrowUpDown,
  UserCheck,
  UserX,
  Lock,
  Users,
  LogIn,
  TrendingUp,
} from "lucide-react";
import { useRoleData } from "@/hooks/useRoleData";
import { Badge, Button, DropdownAction, Input } from "@/components/ui";
import StatCard from "@/components/user/stat-card";
import { COLORS, ITEMS_PER_PAGE, ONLINE_THRESHOLD_DAYS, SortDirection, SortKey, User } from "@/constants";
import ChartDay from "@/components/user/chart-day";
import ChartStatus from "@/components/user/chart-status";
import NotificationPane from "@/components/user/notification-pane";
import { useFollowStore, useUserStore } from "@/store";

const getPaginationItems = (currentPage: number, totalPages: number): (number | '...')[] => {
  const MAX_ITEMS = 5;

  if (totalPages <= MAX_ITEMS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  pages.add(currentPage);   // thêm 3 nút trung tâm
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b); // Sắp xếp
  const finalItems = [];

  if (sortedPages[0] > 1) {
    finalItems.push('...');
  }
  for (const element of sortedPages) {
    const pageNumber = element;
    finalItems.push(pageNumber);
  }
  if (sortedPages[sortedPages.length - 1] < totalPages) {
    finalItems.push('...');
  }

  return Array.from(finalItems);
};

// --- 4. MAIN PAGE COMPONENT ---

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: null,
    direction: 'asc',
  });

  const users = useUserStore((state) => state.users);
  const setUsers = useUserStore((state) => state.setUsers);
  const { roles, setRoles } = useRoleData();

  // --- Logic Thống kê & Biểu đồ ---
  const { userStats, accessTrendData, statusDistributionData, recentNewUsers } = useMemo(() => {
    const totalUsers = users.length;
    let activeUsers = 0, lockedUsers = 0, inactiveUsers = 0, onlineUsers = 0, bannedUsers = 0;
    const sevenDaysAgo = subDays(new Date(), ONLINE_THRESHOLD_DAYS);

    const trendMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      trendMap.set(format(date, "dd/MM"), 0);
    }

    const recentJoiners = [];

    users.forEach(user => {
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

  const getRoleById = (id: number) => roles.find((r) => r.id === id);
  // --- Logic Lọc & Sắp xếp ---
  const processedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm || statusFilter !== "all" || roleFilter !== "all") {
      result = result.filter((user) => {
        const matchesSearch = !searchTerm ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesRole = roleFilter === "all" || user.roleId?.toString() === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
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
  }, [users, searchTerm, statusFilter, roleFilter, sortConfig]);

  const totalPages = Math.ceil(processedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, roleFilter]);

  const requestSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteUser = (userId: number | undefined) => {
    if (userId) setUsers(users.filter((user) => user.id && user.id !== userId));
  };

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

  return (
    <div className="space-y-6 pb-10 bg-gray-50/50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản, phân quyền và theo dõi hoạt động</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors">
          <TrendingUp className="w-4 h-4" /> Xuất Báo Cáo
        </button>
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

      {/* --- Section 3: Filters & Table --- */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full sm:w-[180px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
            <option value="banned">Bị Cấm</option>
            <option value="locked">Đã Khóa</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 w-full sm:w-[180px] rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id.toString()}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
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
              <th className="px-4 py-3 cursor-pointer hover:text-gray-700" onClick={() => requestSort('lastLogin')}>
                <div className="flex items-center">Đăng Nhập Cuối {sortConfig.key === 'lastLogin' && <ArrowUpDown className="ml-2 h-4 w-4" />}</div>
              </th>
              <th className="px-4 py-3 w-[70px]">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
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
                    {user.lastLogin ? format(new Date(user.lastLogin), "dd MMM, yyyy", { locale: vi }) : "Chưa Từng"}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownAction user={user} onDelete={handleDeleteUser} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-10 h-10 text-gray-300 mb-2" />
                    <p>Không tìm thấy người dùng nào phù hợp.</p>
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
    </div>
  );
}