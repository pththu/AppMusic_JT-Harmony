"use client";

import { useState } from "react";
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
} from "@/components/ui";
import {
  mockPostReports,
  mockUsers,
  mockPosts,
  getUserById,
  getPostById,
  type PostReport,
} from "@/lib/mock-data";

export default function ReportsPage() {
  const [reports, setReports] = useState<PostReport[]>(mockPostReports);
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleResolveReport = (reportId: number) => {
    setReports(
      reports.map((report) =>
        report.id === reportId
          ? { ...report, status: "resolved" as const }
          : report
      )
    );
  };

  const handleDismissReport = (reportId: number) => {
    setReports(
      reports.map((report) =>
        report.id === reportId
          ? { ...report, status: "dismissed" as const }
          : report
      )
    );
  };

  const handleViewReport = (report: PostReport) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: PostReport["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Báo Cáo</h1>
        <p className="text-gray-600">
          Quản lý báo cáo của người dùng và kiểm duyệt nội dung
        </p>
      </div>

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
            {reports.map((report) => {
              const reporter = getUserById(report.reporterId);
              const post = getPostById(report.postId);
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
                        {post?.content.substring(0, 50)}...
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
                    {format(new Date(report.reportedAt), "MMM dd, yyyy")}
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
                    const reporter = getUserById(selectedReport.reporterId);
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {reporter?.avatarUrl ? (
                            <img
                              src={reporter.avatarUrl}
                              alt={reporter.username}
                              className="w-10 h-10 rounded-full"
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
                    const post = getPostById(selectedReport.postId);
                    const postAuthor = post ? getUserById(post.userId) : null;
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
                                {postAuthor?.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {postAuthor?.fullName || postAuthor?.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(post.createdAt), "MMM dd, yyyy")}
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
