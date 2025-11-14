import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthCheck } from "./auth-check";

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
      <body className={inter.className}>
        <AuthCheck>{children}</AuthCheck>
      </body>
    </html>
  );
}
