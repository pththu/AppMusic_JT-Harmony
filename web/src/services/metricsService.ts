import axiosClient from "@/lib/axiosClient";

export type Granularity = "day" | "week" | "month";

export interface SummaryRes {
  posts: number;
  comments: number;
  likes: number;
  reports: number;
  conversations: number;
  messages: number;
  range: { start: string; end: string };
}

export interface TimeseriesPoint { date: string; count: number }

// Lấy số liệu tổng quan trong khoảng ngày (bao gồm ngày kết thúc)
// Tham số:
// - dateFrom: ngày bắt đầu (yyyy-MM-dd, hoặc dd/MM/yyyy/MM/DD/YYYY)
// - dateTo: ngày kết thúc (bao gồm ngày này)
export async function fetchSummary(params?: { dateFrom?: string; dateTo?: string }) {
  try {
    const res = await axiosClient.get("/admin/metrics/summary", { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// Lấy chuỗi thời gian (timeseries) cho 1 loại dữ liệu
// kind: 'posts' | 'comments' | 'likes' | 'messages' | 'conversations'
// Tham số:
// - dateFrom/dateTo: khoảng ngày lọc (Đến ngày được tính bao gồm)
// - granularity: mức gộp theo 'day' | 'week' | 'month'
export async function fetchTimeseries(kind: "posts" | "comments" | "likes" | "messages" | "conversations", params?: { dateFrom?: string; dateTo?: string; granularity?: Granularity }) {
  try {
    const res = await axiosClient.get(`/admin/metrics/timeseries/${kind}`, { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// Lấy breakdown số lượng báo cáo theo trạng thái
// Tham số: dateFrom/dateTo để lọc trong khoảng ngày
export async function fetchReportsStatusBreakdown(params?: { dateFrom?: string; dateTo?: string }) {
  try {
    const res = await axiosClient.get("/admin/metrics/reports/status-breakdown", { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// Lấy breakdown bài đăng có cover vs bài đăng gốc trong khoảng ngày
export async function fetchPostsCoverBreakdown(params?: { dateFrom?: string; dateTo?: string }) {
  try {
    const res = await axiosClient.get("/admin/metrics/posts/cover-breakdown", { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// Lấy danh sách Top Posts
// Tham số:
// - by: xếp theo 'likes' hoặc 'comments'
// - limit: giới hạn số lượng trả về
// - dateFrom/dateTo: lọc theo khoảng ngày
export async function fetchTopPosts(params?: { by?: "likes" | "comments"; limit?: number; dateFrom?: string; dateTo?: string }) {
  try {
    const res = await axiosClient.get("/admin/metrics/top/posts", { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// Lấy danh sách Top Users
// Tham số:
// - by: xếp theo 'posts' hoặc 'comments'
// - limit: giới hạn số lượng trả về
// - dateFrom/dateTo: lọc theo khoảng ngày
export async function fetchTopUsers(params?: { by?: "posts" | "comments"; limit?: number; dateFrom?: string; dateTo?: string }) {
  try {
    const res = await axiosClient.get("/admin/metrics/top/users", { params });
    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const GetDataAnalyticsSearch = async (payload) => {
  try {
    const response = await axiosClient.post(`/admin/metrics/behavior/search`, {
      histories: payload
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}
