import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthCheck } from "./auth-check";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JT-Harmony Admin",
  description: "Admin dashboard for AppMusic",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter?.className} suppressHydrationWarning={true}>
        <AuthCheck>{children}</AuthCheck>
        <Toaster
          position="top-right" // ✅ Yêu cầu 2: Hiện ra ở góc trên bên phải
          reverseOrder={false}  // ✅ Yêu cầu 4: Đảm bảo toast mới (sau) nằm dưới toast cũ (trên)
        />
      </body>
    </html>
  );
}
