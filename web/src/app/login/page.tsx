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
import { Loader2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { Login } from "@/services/authApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = { email, password };
      console.log('payload: ', payload)
      const response = await Login(payload);
      console.log('response', response)

      if (!response.success) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        return;
      }

      if (response.success) {
        const user = response.user;

        login(user, "local", user.accessToken, user.refreshToken);

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
    <div className="h-screen flex flex-row items-center justify-center bg-[#a7f29b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="items-start">
        <img src="/logo.png" alt="JT-Harmony Logo" className="h-[50%] w-[90%]" />
      </div>
      <div className="max-w-lg w-full mb-2 mr-20">
        <div className="w-full bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <CardHeader>
            <h1 className="text-center text-4xl font-bold text-black mb-6">
              Đăng nhập
            </h1>
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
        </div>
        {/* <div className="text-center">
          <p className="text-sm text-gray-600">
            Quên mật khẩu? Liên hệ quản trị viên hệ thống.
          </p>
        </div> */}
      </div>
    </div >
  );
}
