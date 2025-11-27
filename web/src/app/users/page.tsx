"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { format, isAfter, subDays } from "date-fns";
import { fi, vi } from "date-fns/locale";
import {
  MoreHorizontal,
  Search,
  Plus,
  ArrowUpDown,
  UserCheck,
  UserX,
  Lock,
  Users,
  Eye,
  Edit,
  Trash2,
  Calendar,
  LogIn,
  ShieldPlus,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { mockUsers, mockRoles, getRoleById, type User } from "@/lib/mock-data";
import { useUserData } from "../../../hooks/useUserData";

// Định nghĩa kiểu cho sắp xếp
type SortKey = keyof User | 'roleName' | 'fullNameDisplay' | null;
type SortDirection = 'asc' | 'desc';

// Hằng số phân trang
const ITEMS_PER_PAGE = 10;
const ONLINE_THRESHOLD_DAYS = 7;
// TỔNG SỐ NÚT TRÊN THANH PHÂN TRANG (TRƯỚC + SỐ/DẤU + SAU) = 7
// => Số lượng mục ở giữa tối đa là 5
const MAX_CENTER_ITEMS = 5;

/**
 * Component hiển thị một thẻ thống kê
 */
const StatCard = ({ title, value, icon: Icon, iconClass }: { title: string, value: number, icon: React.ElementType, iconClass: string }) => (
  <Card className="flex-1 min-w-[150px] shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${iconClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

/**
 * Hàm tính toán các mục phân trang ở giữa (tối đa 5 mục)
// Nếu tổng số trang ít hơn hoặc bằng 5, hiển thị tất cả.
 */
const getPaginationItems = (currentPage: number, totalPages: number): (number | '...')[] => {
  const MAX_ITEMS = 5;

  if (totalPages <= MAX_ITEMS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  pages.add(currentPage);   // thêm 3 nút trung tâm
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


export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: null,
    direction: 'asc',
  });

  const { users, setUsers } = useUserData();

  const imageDefault = '';

  // --- Logic Thống kê (Statistics Logic) ---
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    let activeUsers = 0;
    let lockedUsers = 0;
    let inactiveUsers = 0;
    let onlineUsers = 0;
    const sevenDaysAgo = subDays(new Date(), ONLINE_THRESHOLD_DAYS);

    users.forEach(user => {
      switch (user.status) {
        case 'active':
          activeUsers++;
          break;
        case 'inactive':
          inactiveUsers++;
          break;
        case 'banned':
        case 'locked':
          lockedUsers++;
          break;
      }

      if (
        user.status === 'active' &&
        user.lastLogin &&
        isAfter(new Date(user.lastLogin), sevenDaysAgo)
      ) {
        onlineUsers++;
      }
    });

    return {
      totalUsers,
      activeUsers,
      lockedUsers,
      inactiveUsers,
      onlineUsers,
    };
  }, [users]);

  // Hàm tiện ích để lấy Badge trạng thái
  const getStatusBadge = (status: User["status"]) => {
    const variants: Record<User["status"], string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      banned: "bg-red-100 text-red-800",
      locked: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={variants[status]}>
        {status === "active"
          ? "Hoạt Động"
          : status === "inactive"
            ? "Không Hoạt Động"
            : status === "banned"
              ? "Bị Cấm"
              : "Đã Khóa"}
      </Badge>
    );
  };

  // --- Logic Lọc (Filtering Logic) ---
  const filteredUsers = useMemo(() => {
    return users?.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesRole =
        roleFilter === "all" || user.roleId?.toString() === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    }) || [];
  }, [users, searchTerm, statusFilter, roleFilter]);

  // --- Logic Sắp xếp (Sorting Logic) ---
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...filteredUsers];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'fullNameDisplay':
            aValue = a.fullName || a.username;
            bValue = b.fullName || b.username;
            break;
          case 'roleName':
            aValue = getRoleById(Number(a.roleId))?.name || 'Unknown';
            bValue = getRoleById(Number(b.roleId))?.name || 'Unknown';
            break;
          case 'createdAt':
          case 'lastLogin':
            aValue = new Date(a[sortConfig.key] || 0).getTime();
            bValue = new Date(b[sortConfig.key] || 0).getTime();
            break;
          default:
            aValue = a[sortConfig.key as keyof User];
            bValue = b[sortConfig.key as keyof User];
            break;
        }

        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;


        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // --- Logic Phân trang (Pagination Logic) ---
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getHeaderClassName = (key: SortKey) => {
    return sortConfig.key === key ? 'font-bold' : '';
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return (
      <ArrowUpDown
        className={`ml-2 h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
      />
    );
  };

  // Hàm xử lý xóa người dùng
  const handleDeleteUser = (userId: number | undefined) => {
    if (userId) {
      setUsers(users.filter((user) => user.id && user.id !== userId));
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản người dùng và quyền hạn
          </p>
        </div>
      </div>

      {/* --- Thống kê Người Dùng (Statistics) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Tổng Số Người Dùng"
          value={userStats.totalUsers}
          icon={Users}
          iconClass="text-blue-500"
        />
        <StatCard
          title="Hoạt Động"
          value={userStats.activeUsers}
          icon={UserCheck}
          iconClass="text-green-500"
        />
        <StatCard
          title="Đã Khóa/Cấm"
          value={userStats.lockedUsers}
          icon={Lock}
          iconClass="text-red-500"
        />
        <StatCard
          title="Không Hoạt Động"
          value={userStats.inactiveUsers}
          icon={UserX}
          iconClass="text-yellow-500"
        />
        <StatCard
          title="Truy cập trong vòng 7 ngày"
          value={userStats.onlineUsers}
          icon={LogIn}
          iconClass="text-indigo-500"
        />
      </div>

      {/* --- Filters --- */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="active">Hoạt Động</SelectItem>
            <SelectItem value="inactive">Không Hoạt Động</SelectItem>
            <SelectItem value="banned">Bị Cấm</SelectItem>
            <SelectItem value="locked">Đã Khóa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Vai Trò</SelectItem>
            {mockRoles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Users Table --- */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className={`cursor-pointer ${getHeaderClassName('fullNameDisplay')}`}
                onClick={() => requestSort('fullNameDisplay')}
              >
                <div className="flex items-center">
                  Người Dùng {getSortIcon('fullNameDisplay')}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead
                className={`cursor-pointer ${getHeaderClassName('roleName')}`}
                onClick={() => requestSort('roleName')}
              >
                <div className="flex items-center">
                  Vai Trò {getSortIcon('roleName')}
                </div>
              </TableHead>
              <TableHead
                className={`cursor-pointer ${getHeaderClassName('status')}`}
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Trạng Thái {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead
                className={`cursor-pointer ${getHeaderClassName('lastLogin')}`}
                onClick={() => requestSort('lastLogin')}
              >
                <div className="flex items-center">
                  Đăng Nhập Cuối {getSortIcon('lastLogin')}
                </div>
              </TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id!}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRoleById(Number(user.roleId))?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), "dd MMM, yyyy", { locale: vi })
                      : "Chưa Từng"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShieldPlus className="mr-2 h-4 w-4" />
                          Bổ nhiệm làm quản trị viên
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị {paginatedUsers.length}/{filteredUsers.length} người
          dùng (Trang {currentPage}/{totalPages})
        </div>
        <div className="flex space-x-2">
          {/* Nút Trước: Quay về trang 1 */}
          <Button
            variant="outline"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          {getPaginationItems(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                key={item}
                variant={currentPage === item ? "default" : "outline"}
                onClick={() => handlePageChange(item)}
              >
                {item}
              </Button>
            )
          ))}

          {/* Nút Sau: Đi tới trang cuối cùng */}
          <Button
            variant="outline"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}