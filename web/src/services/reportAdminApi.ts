import axiosClient from "@/lib/axiosClient";

export interface PostReportItem {
  id: number;
  postId: number;
  reporterId: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reportedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export interface ReportFilters {
  status?: PostReportItem["status"];
  postId?: number;
  reporterId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchPostReports(params?: ReportFilters) {
  const res = await axiosClient.get('/posts/reports', { params });
  return res.data as PostReportItem[];
}

export async function updatePostReport(id: number, payload: { status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'; adminNotes?: string }) {
  const res = await axiosClient.put(`/posts/reports/${id}`, payload);
  return res.data as PostReportItem;
}
