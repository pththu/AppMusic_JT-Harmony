
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

const GENRES = [
  { id: "3", name: "POP", color: "#4facfe", colorEnd: "#e0c3fc", icon: "heart" },
  { id: "4", name: "K-POP", color: "#e8198b", colorEnd: "#f794a4", icon: "people" },
  { id: "6", name: "V-POP", color: "#ff0844", colorEnd: "#f9d423", icon: "star" },
  { id: "2", name: "C-POP", color: "#f5576c", colorEnd: "#fee140", icon: "snow" },
  { id: "5", name: "J-POP", color: "#e8198b", colorEnd: "#efefef", icon: "disc" },
  { id: "7", name: "RAP", color: "#c71d6f", colorEnd: "#96deda", icon: "mic" },
  { id: "12", name: "ROCK", color: "#e8198b", colorEnd: "#FFBD71", icon: "mic" },
  { id: "8", name: "HIP-HOP", color: "#2b5876", colorEnd: "#dad4ec", icon: "headset" },
  { id: "9", name: "DANCE", color: "#009efd", colorEnd: "#38f9d7", icon: "body" },
  { id: "10", name: "INDIE", color: "#a18cd1", colorEnd: "#FBC2EB", icon: "leaf" },
  { id: "1", name: "TAMIL", color: "#eacda3", colorEnd: "#94B447", icon: "musical-notes" },
  { id: "11", name: "JAZZ", color: "#FF7A7B", colorEnd: "#FFBD71", icon: "musical-note" },
];


export {
  COLORS,
  ITEMS_PER_PAGE,
  ONLINE_THRESHOLD_DAYS,
  GENRES,
};

export type {
  SortKey,
  SortDirection,
  User,
};