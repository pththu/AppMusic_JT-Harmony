"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useEffect, useState } from "react";
import { fetchSummary, fetchTimeseries, fetchPostsCoverBreakdown, fetchReportsStatusBreakdown, fetchTopPosts, fetchTopUsers, type SummaryRes, type Granularity } from "@/services/metricsAdminApi";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { format, subDays } from "date-fns";
import { FileText, MessageCircle, Heart, Flag, MessageSquare, Mail } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryRes | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [tsPosts, setTsPosts] = useState<Array<{ date: string; count: number }>>([]);
  const [tsComments, setTsComments] = useState<Array<{ date: string; count: number }>>([]);
  const [tsLikes, setTsLikes] = useState<Array<{ date: string; count: number }>>([]);
  const [tsMessages, setTsMessages] = useState<Array<{ date: string; count: number }>>([]);
  const [tsConvs, setTsConvs] = useState<Array<{ date: string; count: number }>>([]);
  const [coverBreakdown, setCoverBreakdown] = useState<Array<{ isCover: boolean; count: number }>>([]);
  const [reportsBreakdown, setReportsBreakdown] = useState<Array<{ status: string; count: number }>>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  // Header filters
  const [dateFrom, setDateFrom] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [loadingAll, setLoadingAll] = useState(false);

  const getIconStyles = (title: string) => {
    switch (title) {
      case "Bài Đăng":
        return { text: "text-green-600", bg: "bg-green-50" };
      case "Bình Luận":
        return { text: "text-blue-600", bg: "bg-blue-50" };
      case "Thích":
        return { text: "text-pink-600", bg: "bg-pink-50" };
      case "Báo Cáo":
        return { text: "text-red-600", bg: "bg-red-50" };
      case "Cuộc Trò Chuyện":
        return { text: "text-teal-600", bg: "bg-teal-50" };
      case "Tin Nhắn":
        return { text: "text-orange-600", bg: "bg-orange-50" };
      default:
        return { text: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  const loadAll = async () => {
    setLoadingAll(true);
    try {
      const params = { dateFrom, dateTo, granularity } as any;
      const [sum, p, c, l, m, cv, cb, rb, tp, tu] = await Promise.all([
        fetchSummary({ dateFrom, dateTo }),
        fetchTimeseries('posts', params),
        fetchTimeseries('comments', params),
        fetchTimeseries('likes', params),
        fetchTimeseries('messages', params),
        fetchTimeseries('conversations', params),
        fetchPostsCoverBreakdown({ dateFrom, dateTo }),
        fetchReportsStatusBreakdown({ dateFrom, dateTo }),
        fetchTopPosts({ by: 'likes', dateFrom, dateTo, limit: 5 }),
        fetchTopUsers({ by: 'posts', dateFrom, dateTo, limit: 5 }),
      ]);
      setSummary(sum);
      setTsPosts(p.data || []);
      setTsComments(c.data || []);
      setTsLikes(l.data || []);
      setTsMessages(m.data || []);
      setTsConvs(cv.data || []);
      setCoverBreakdown(cb || []);
      setReportsBreakdown(rb || []);
      setTopPosts(tp || []);
      setTopUsers(tu || []);
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển</h1>
        <p className="text-gray-600">
          Chào mừng đến với Bảng Điều Khiển Admin JT-Harmony
        </p>
      </div>

      {/* Header Filters */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-sm font-medium">Từ ngày</label>
          <input type="date" className="px-3 py-2 border rounded-md" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Đến ngày</label>
          <input type="date" className="px-3 py-2 border rounded-md" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Độ chi tiết</label>
          <select className="px-3 py-2 border rounded-md" value={granularity} onChange={(e)=>setGranularity(e.target.value as Granularity)}>
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        <button className="px-4 py-2 rounded-md bg-black text-white" onClick={loadAll} disabled={loadingAll}>{loadingAll ? 'Đang tải...' : 'Áp dụng'}</button>
      </div>

      {/* Real Metrics Stat Cards (7 ngày gần nhất) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
        {[
          { title: "Bài Đăng", icon: FileText, value: summary?.posts ?? "-" },
          { title: "Bình Luận", icon: MessageCircle, value: summary?.comments ?? "-" },
          { title: "Thích", icon: Heart, value: summary?.likes ?? "-" },
          { title: "Báo Cáo", icon: Flag, value: summary?.reports ?? "-" },
          { title: "Cuộc Trò Chuyện", icon: MessageSquare, value: summary?.conversations ?? "-" },
          { title: "Tin Nhắn", icon: Mail, value: summary?.messages ?? "-" },
        ].map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              {s.icon ? (
                <div className={`p-2 rounded-md ${getIconStyles(s.title).bg}`}>
                  <s.icon className={`h-4 w-4 ${getIconStyles(s.title).text}`} />
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              {!summary && (
                <div className="text-xs text-gray-500">Đang tải...</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeseries charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {[{title:'Posts', data: tsPosts}, {title:'Comments', data: tsComments}, {title:'Likes', data: tsLikes}, {title:'Messages', data: tsMessages}, {title:'Conversations', data: tsConvs}].map(({title, data}) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title} theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAll ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">Đang tải...</div>
              ) : data.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">Không có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts: Cover vs Original</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAll ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">Đang tải...</div>
            ) : coverBreakdown.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={coverBreakdown.map(d=>({ name: d.isCover ? 'Cover' : 'Original', value: d.count }))} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {coverBreakdown.map((_, i) => (
                      <Cell key={i} fill={["#34d399","#60a5fa"][i % 2]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports: Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAll ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">Đang tải...</div>
            ) : reportsBreakdown.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={reportsBreakdown.map(d=>({ name: d.status, value: Number(d.count) }))} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                    {reportsBreakdown.map((_, i) => (
                      <Cell key={i} fill={["#f87171","#f59e0b","#10b981","#6366f1"][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAll ? (
              <div className="py-10 text-center text-gray-500">Đang tải...</div>
            ) : topPosts.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Bài đăng</th>
                      <th className="py-2 pr-4">Tác giả</th>
                      <th className="py-2 pr-4">Lượt thích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((p:any) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 pr-4 max-w-[360px] truncate">{p.content || p.title || '(không có nội dung)'}</td>
                        <td className="py-2 pr-4">{p.User?.fullName || p.User?.username || p.userId}</td>
                        <td className="py-2 pr-4">{p.heartCount ?? p.likeCount ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAll ? (
              <div className="py-10 text-center text-gray-500">Đang tải...</div>
            ) : topUsers.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Người dùng</th>
                      <th className="py-2 pr-4">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((u:any) => (
                      <tr key={u.userId} className="border-t">
                        <td className="py-2 pr-4">{u.User?.fullName || u.User?.username || u.userId}</td>
                        <td className="py-2 pr-4">{u.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
