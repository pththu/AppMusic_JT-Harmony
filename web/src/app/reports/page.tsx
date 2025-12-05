"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Label,
} from "@/components/ui";
import { fetchPostReports, updatePostReport, type PostReportItem } from "@/services";

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<PostReportItem[]>([]);
  const [sortKey, setSortKey] = useState<"reportedAt" | "status">("reportedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    reporter: true,
    post: true,
    reason: true,
    status: true,
    reportedAt: true,
  });
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

  const sortedReports = (Array.isArray(reports) ? reports : []).slice().sort((a: any, b: any) => {
    if (sortKey === "status") {
      const order: Record<string, number> = {
        pending: 0,
        reviewed: 1,
        resolved: 2,
        dismissed: 3,
      };
      const av = order[a.status] ?? 99;
      const bv = order[b.status] ?? 99;
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    }
    const aTime = new Date((a as any).reportedAt || (a as any).createdAt).getTime();
    const bTime = new Date((b as any).reportedAt || (b as any).createdAt).getTime();
    if (aTime === bTime) return 0;
    const res = aTime > bTime ? 1 : -1;
    return sortDir === "asc" ? res : -res;
  });

  const handleSort = (key: "reportedAt" | "status") => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("desc");
      return key;
    });
  };

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

  const handleExportCsv = () => {
    if (!Array.isArray(sortedReports) || sortedReports.length === 0) return;

    const headers = [
      "id",
      "postId",
      "reporterId",
      "reason",
      "status",
      "reportedAt",
    ];

    const escapeCsv = (value: any) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = sortedReports.map((item: any) => {
      const reporter = item.Reporter;
      const post = item.Post;
      const reportedAt = (item.reportedAt || item.createdAt)
        ? new Date(item.reportedAt || item.createdAt).toISOString()
        : "";
      const cols = [
        item.id,
        post?.id,
        reporter?.id,
        item.reason,
        item.status,
        reportedAt,
      ];
      return cols.map(escapeCsv).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports_${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyQuickFilter = async (preset: string) => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    if (preset === "pending_7_days") {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      setStatusFilter("pending");
      setDateFrom(formatDate(from));
      setDateTo(formatDate(today));
      await loadReports();
    } else if (preset === "resolved_30_days") {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      setStatusFilter("resolved");
      setDateFrom(formatDate(from));
      setDateTo(formatDate(today));
      await loadReports();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Báo Cáo</h1>
          <p className="text-gray-600">
            Quản lý báo cáo của người dùng và kiểm duyệt nội dung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.id}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, id: e.target.checked }))
                    }
                  />
                  <span className="text-sm">ID</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.reporter}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, reporter: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Người báo cáo</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.post}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, post: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Nội dung bài đăng</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.reason}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, reason: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Lý do</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.status}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, status: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Trạng thái</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.reportedAt}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, reportedAt: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Thời gian báo cáo</span>
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={sortedReports.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-sm font-medium mb-1 block">Bộ lọc nhanh</Label>
              <select
                className="px-3 py-2 border rounded-md text-sm"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  applyQuickFilter(value);
                }}
              >
                <option value="">Chọn bộ lọc</option>
                <option value="pending_7_days">Chờ xử lý 7 ngày gần nhất</option>
                <option value="resolved_30_days">Đã giải quyết 30 ngày</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Trạng thái</Label>
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
              <Label className="text-sm font-medium mb-1 block">ID bài đăng</Label>
              <input
                className="px-3 py-2 border rounded-md w-30"
                value={postIdInput}
                onChange={(e) => setPostIdInput(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">ID người báo cáo</Label>
              <input
                className="px-3 py-2 border rounded-md w-30"
                value={reporterIdInput}
                onChange={(e) => setReporterIdInput(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Từ ngày</Label>
              <input
                type="date"
                className="px-3 py-2 border rounded-md"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Đến ngày</Label>
              <input
                type="date"
                className="px-3 py-2 border rounded-md"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={loadReports} disabled={loading}>
                {loading ? "Đang tải..." : "Áp dụng"}
              </Button>
              <Button variant="outline" onClick={resetFilters} disabled={loading}>
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              {visibleCols.id && (
                <TableHead className="w-[80px] text-center">ID</TableHead>
              )}
              {visibleCols.reporter && <TableHead>Người Báo Cáo</TableHead>}
              {visibleCols.post && <TableHead>Nội Dung Bài Đăng</TableHead>}
              {visibleCols.reason && <TableHead>Lý Do</TableHead>}
              {visibleCols.status && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("status")}
                >
                  Trạng Thái
                </TableHead>
              )}
              {visibleCols.reportedAt && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("reportedAt")}
                >
                  Thời Gian Báo Cáo
                </TableHead>
              )}
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody> 
            {sortedReports.map((report, index) => {
              const reporter = (report as any).Reporter;
              const post = (report as any).Post;
              return (
                <TableRow key={report.id}>
                  <TableCell className="text-center text-sm text-gray-500}">{index + 1}</TableCell>
                  {visibleCols.id && (
                    <TableCell className="text-center text-xs text-gray-500">{report.id}</TableCell>
                  )}
                  {visibleCols.reporter && (
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
                          @{reporter?.username} · ID: {reporter?.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  )}
                  {visibleCols.post && (
                    <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {post?.content?.substring(0, 50)}...
                      </p>
                      {post && (
                        <p className="text-xs text-gray-500 mt-0.5">Post ID: {post.id}</p>
                      )}
                    </div>
                  </TableCell>
                  )}
                  {visibleCols.reason && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getReasonIcon(report.reason)}
                        <span className="text-sm">{report.reason}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.status && (
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                  )}
                  {visibleCols.reportedAt && (
                    <TableCell>
                      {format(new Date((report as any).reportedAt || (report as any).createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (post?.id) {
                              router.push(`/posts?postId=${post.id}`);
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Tới Bài Đăng
                        </DropdownMenuItem>
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
