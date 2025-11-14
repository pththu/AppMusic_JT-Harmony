"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { fetchPostReports, updatePostReport, type PostReportItem } from "@/services/reportAdminApi";

export default function ReportsPage() {
  const [reports, setReports] = useState<PostReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<PostReportItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | PostReportItem["status"]>("all");
  const [postIdInput, setPostIdInput] = useState<string>("");
  const [reporterIdInput, setReporterIdInput] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleResolveReport = async (reportId: number) => {
    const updated = await updatePostReport(reportId, { status: "resolved" });
    setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
  };

  const resetFilters = async () => {
    setStatusFilter('all');
    setPostIdInput('');
    setReporterIdInput('');
    setDateFrom('');
    setDateTo('');
    await loadReports();
  };

  const handleDismissReport = async (reportId: number) => {
    const updated = await updatePostReport(reportId, { status: "dismissed" });
    setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
  };

  const handleViewReport = (report: PostReportItem) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: PostReportItem["status"]) => {
    const variants: Record<PostReportItem["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={variants[status]}>
        {status === "pending"
          ? "Chờ Xử Lý"
          : status === "resolved"
            ? "Đã Giải Quyết"
            : "Đã Bỏ Qua"}
      </Badge>
    );
  };

  const getReasonIcon = (reason: string) => {
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (postIdInput) params.postId = parseInt(postIdInput, 10);
      if (reporterIdInput) params.reporterId = parseInt(reporterIdInput, 10);
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const data = await fetchPostReports(params);
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load post reports:', e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Báo Cáo</h1>
        <p className="text-gray-600">
          Quản lý báo cáo của người dùng và kiểm duyệt nội dung
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="reviewed">Đã xem</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="dismissed">Đã bỏ qua</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">ID bài đăng</label>
              <input className="px-3 py-2 border rounded-md w-40" value={postIdInput} onChange={(e)=>setPostIdInput(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">ID người báo cáo</label>
              <input className="px-3 py-2 border rounded-md w-40" value={reporterIdInput} onChange={(e)=>setReporterIdInput(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Từ ngày</label>
              <input type="date" className="px-3 py-2 border rounded-md" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Đến ngày</label>
              <input type="date" className="px-3 py-2 border rounded-md" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={loadReports} disabled={loading}>{loading ? 'Đang tải...' : 'Áp dụng'}</Button>
              <Button variant="outline" onClick={resetFilters} disabled={loading}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người Báo Cáo</TableHead>
              <TableHead>Nội Dung Bài Đăng</TableHead>
              <TableHead>Lý Do</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Thời Gian Báo Cáo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(reports) && reports.map((report) => {
              const reporter = (report as any).Reporter;
              const post = (report as any).Post;
              return (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {reporter?.avatarUrl ? (
                          <img
                            src={reporter.avatarUrl}
                            alt={reporter.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {reporter?.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {reporter?.fullName || reporter?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{reporter?.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {post?.content?.substring(0, 50)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getReasonIcon(report.reason)}
                      <span className="text-sm">{report.reason}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {format(new Date((report as any).reportedAt || (report as any).createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        {report.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleResolveReport(report.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Giải Quyết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDismissReport(report.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                              Bỏ Qua
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Báo Cáo</DialogTitle>
            <DialogDescription>
              Xem thông tin báo cáo và thực hiện hành động
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Trạng Thái
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Thời Gian Báo Cáo
                    </label>
                    <div className="mt-1 text-sm text-gray-600">
                      {format(
                        new Date(selectedReport.reportedAt),
                        "MMM dd, yyyy 'lúc' HH:mm"
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Lý Do
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    {getReasonIcon(selectedReport.reason)}
                    <span className="text-sm text-gray-900">
                      {selectedReport.reason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Người Báo Cáo
                </h4>
                <div className="border rounded p-3 bg-white">
                  {(() => {
                    const reporter = (selectedReport as any).Reporter;
                    return reporter ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {reporter.avatarUrl ? (
                            <img
                              src={reporter.avatarUrl}
                              alt={reporter.username}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {reporter.username?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {reporter.fullName || reporter.username}
                          </div>
                          <div className="text-sm text-gray-500">@{reporter.username}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Không có thông tin người báo cáo</p>
                    );
                  })()}
                </div>
              </div>

              {/* Reported Post */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Bài Đăng Bị Báo Cáo
                </h4>
                <div className="border rounded p-3 bg-white">
                  {(() => {
                    const post = (selectedReport as any).Post;
                    const postAuthor = post ? (post as any).User : null;
                    return post ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {postAuthor?.avatarUrl ? (
                              <img
                                src={postAuthor.avatarUrl}
                                alt={postAuthor.username}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">
                                {postAuthor?.username?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {postAuthor?.fullName || postAuthor?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.createdAt ? format(new Date(post.createdAt), "MMM dd, yyyy") : ""}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-900">{post.content}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Không tìm thấy bài đăng</p>
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              {selectedReport.status === "pending" && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleResolveReport(selectedReport.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Giải Quyết Báo Cáo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDismissReport(selectedReport.id);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Bỏ Qua Báo Cáo
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
