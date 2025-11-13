"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Music } from "lucide-react";
import { apiClient } from "@/lib/api";
import { authStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        return;
      }

      if (response.data && (response.data as any).success) {
        const payload = response.data as any;
        const user = payload.user ?? payload.data?.user ?? null;
        const accessToken = payload.accessToken ?? payload.access_token ?? payload.token;
        const refreshToken = payload.refreshToken ?? payload.refresh_token ?? null;

        // Lưu vào auth store
        authStore.getState().login(user, "local", accessToken, refreshToken);

        // Chuyển hướng đến dashboard
        // Đảm bảo persist đã ghi trước khi điều hướng
        await new Promise((r) => setTimeout(r, 0));
        router.replace("/dashboard");
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Music className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Đăng nhập vào JT-Harmony Admin
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Sử dụng tài khoản admin để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@appmusic.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* <div className="text-center">
          <p className="text-sm text-gray-600">
            Quên mật khẩu? Liên hệ quản trị viên hệ thống.
          </p>
        </div> */}
      </div>
    </div>
  );
}
