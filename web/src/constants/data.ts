
type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  status: "active" | "inactive" | "banned" | "locked";
  createdAt: string;
  lastLogin: string | null;
  avatarUrl?: string;
};

type SortKey = keyof any | 'roleName' | 'fullNameDisplay' | null;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;
const ONLINE_THRESHOLD_DAYS = 7;

const COLORS = {
  active: "#22c55e",
  inactive: "#eab308",
  banned: "#ef4444",
  locked: "#64748b"
};

export {
  COLORS,
  ITEMS_PER_PAGE,
  ONLINE_THRESHOLD_DAYS,
};

export type {
  SortKey,
  SortDirection,
  User,
};