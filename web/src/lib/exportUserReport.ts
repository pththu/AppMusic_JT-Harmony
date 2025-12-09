import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Font Vietnamese support (sử dụng font system)
const addVietnameseFont = (doc: jsPDF) => {
  // jsPDF mặc định hỗ trợ UTF-8, nhưng font cần phải embed
  // Để đơn giản, ta dùng font mặc định với encoding UTF-8
  doc.setFont('helvetica');
};

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  onlineUsers: number;
}

interface User {
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  roleId?: number;
  status: 'active' | 'inactive' | 'banned' | 'locked';
  lastLogin?: string;
  createdAt: string;
}

interface ExportData {
  userStats: UserStats;
  users: User[];
  roles: Array<{ id: number; name: string }>;
  chartDayElement?: HTMLElement | null;
  chartStatusElement?: HTMLElement | null;
}

export async function exportUserReport(data: ExportData) {
  const { userStats, users, roles, chartDayElement, chartStatusElement } = data;

  // Khởi tạo PDF - A4 size
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  addVietnameseFont(doc);

  // ============ HEADER ============
  // Logo placeholder (có thể thay bằng logo thật)
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(15, 15, 10, 10, 'F');

  // Title
  doc.setFontSize(24);
  doc.setTextColor(17, 24, 39); // Gray-900
  doc.text('BÁO CÁO QUẢN LÝ NGƯỜI DÙNG', pageWidth / 2, 25, { align: 'center' });

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); // Gray-500
  const reportDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });
  doc.text(`Ngày xuất báo cáo: ${reportDate}`, pageWidth / 2, 32, { align: 'center' });

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(15, 38, pageWidth - 15, 38);

  currentY = 45;

  // ============ SECTION 1: TỔNG QUAN ============
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text('1. TỔNG QUAN HỆ THỐNG', 15, currentY);
  currentY += 8;

  // Stats table
  const statsData = [
    ['Tổng số người dùng', userStats.totalUsers.toString()],
    ['Người dùng hoạt động', userStats.activeUsers.toString()],
    ['Người dùng không hoạt động', userStats.inactiveUsers.toString()],
    ['Tài khoản bị khóa/cấm', `${userStats.lockedUsers + userStats.bannedUsers}`],
    ['Truy cập trong 7 ngày qua', userStats.onlineUsers.toString()],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Chỉ số', 'Giá trị']],
    body: statsData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 15, right: 15 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ============ SECTION 2: PHÂN BỐ TRẠNG THÁI ============
  doc.setFontSize(14);
  doc.text('2. PHÂN BỐ TRẠNG THÁI TÀI KHOẢN', 15, currentY);
  currentY += 8;

  const statusData = [
    ['Hoạt động', userStats.activeUsers.toString(), `${((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}%`],
    ['Không hoạt động', userStats.inactiveUsers.toString(), `${((userStats.inactiveUsers / userStats.totalUsers) * 100).toFixed(1)}%`],
    ['Đã khóa', userStats.lockedUsers.toString(), `${((userStats.lockedUsers / userStats.totalUsers) * 100).toFixed(1)}%`],
    ['Bị cấm', userStats.bannedUsers.toString(), `${((userStats.bannedUsers / userStats.totalUsers) * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Trạng thái', 'Số lượng', 'Tỷ lệ']],
    body: statusData,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ============ SECTION 3: BIỂU ĐỒ (nếu có) ============
  if (chartDayElement || chartStatusElement) {
    // Add new page for charts
    doc.addPage();
    currentY = 20;

    doc.setFontSize(14);
    doc.text('3. BIỂU ĐỒ THỐNG KÊ', 15, currentY);
    currentY += 10;

    try {
      // Chart 1: Access Trend
      if (chartDayElement) {
        const canvas1 = await html2canvas(chartDayElement, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff',
        } as any);

        const imgData1 = canvas1.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas1.height * imgWidth) / canvas1.width;

        doc.addImage(imgData1, 'PNG', 15, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      }

      // Chart 2: Status Distribution
      if (chartStatusElement && currentY + 80 < pageHeight) {
        const canvas2 = await html2canvas(chartStatusElement, {
          scale: 2,
          logging: false,
          backgroundColor: '#ffffff',
        } as any);

        const imgData2 = canvas2.toDataURL('image/png');
        const imgWidth = 80;
        const imgHeight = (canvas2.height * imgWidth) / canvas2.width;

        // Center the pie chart
        const xPos = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData2, 'PNG', xPos, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      }
    } catch (error) {
      console.error('Error capturing charts:', error);
    }
  }

  // ============ SECTION 4: DANH SÁCH NGƯỜI DÙNG ============
  doc.addPage();
  currentY = 20;

  doc.setFontSize(14);
  doc.text('4. DANH SÁCH NGƯỜI DÙNG CHI TIẾT', 15, currentY);
  currentY += 8;

  // Prepare user data
  const getRoleName = (roleId?: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'N/A';
  };

  const getStatusText = (status: User['status']) => {
    const map = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      banned: 'Bị cấm',
      locked: 'Đã khóa',
    };
    return map[status];
  };

  // Limit to first 50 users for PDF (avoid huge files)
  const limitedUsers = users.slice(0, 50);

  const userData = limitedUsers.map((user, index) => [
    (index + 1).toString(),
    user.fullName || user.username,
    user.email || 'N/A',
    getRoleName(user.roleId),
    getStatusText(user.status),
    user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy', { locale: vi }) : 'Chưa từng',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['STT', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Đăng nhập cuối']],
    body: userData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25, halign: 'center' },
    },
  });

  if (users.length > 50) {
    currentY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Lưu ý: Chỉ hiển thị 50/${users.length} người dùng đầu tiên`, 15, currentY);
  }

  // ============ FOOTER - All pages ============
  const totalPages = doc.internal.pages.length - 1; // -1 vì page đầu là dummy

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Báo cáo được tạo tự động bởi Hệ thống Quản lý | Trang ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ============ SAVE PDF ============
  const fileName = `BaoCao_NguoiDung_${format(new Date(), 'ddMMyyyy_HHmmss')}.pdf`;
  doc.save(fileName);
}

// Hook để sử dụng trong component
export function useExportReport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = async (data: ExportData) => {
    setIsExporting(true);
    try {
      await exportUserReport(data);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportReport, isExporting };
}

import { useState } from 'react';