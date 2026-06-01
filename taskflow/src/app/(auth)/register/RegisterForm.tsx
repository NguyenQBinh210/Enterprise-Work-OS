"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAccount } from "./register.supabase";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await registerAccount({ firstName, lastName, email, password });

    if (!result.success) {
      setError(result.error ?? "Không thể tạo tài khoản. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/dashboard/projects");
    }, 1500);
  };

  return (
    <div className="space-y-7 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Tạo tài khoản mới
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          Thiết lập tài khoản để tham gia workspace và theo dõi công việc cùng đội nhóm.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 delay-100 animate-slide-up">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 delay-100 animate-slide-up">
            Tạo tài khoản thành công. Đang chuyển hướng...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Họ"
            placeholder="Nguyễn"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={loading || success}
          />
          <Input
            label="Tên"
            placeholder="Văn A"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || success}
          minLength={6}
        />

        <div className="text-sm leading-6 text-slate-500">
          Bằng việc tạo tài khoản, bạn đồng ý với{" "}
          <Link href="#" className="font-semibold text-slate-800 hover:text-blue-700">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link href="#" className="font-semibold text-slate-800 hover:text-blue-700">
            Chính sách bảo mật
          </Link>.
        </div>

        <Button type="submit" className="h-11 w-full" disabled={loading || success}>
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-blue-700">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
