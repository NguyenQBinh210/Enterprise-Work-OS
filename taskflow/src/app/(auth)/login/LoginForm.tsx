"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginWithEmailPassword } from "./login.supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginWithEmailPassword(email, password);
    if (!result.success) {
      setError(result.error ?? "Không thể đăng nhập. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard/projects");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <ShieldCheck size={14} />
          Không gian làm việc bảo mật
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Chào mừng trở lại
        </h1>
        <p className="text-sm leading-6 text-slate-500 sm:text-base">
          Đăng nhập để tiếp tục quản lý dự án và công việc của nhóm.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700 animate-slide-up">
            <div className="h-2 w-2 rounded-full bg-rose-600" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="group relative">
            <Input
              label="Email"
              type="email"
              placeholder="admin@work.os"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 pl-10"
            />
            <Mail className="absolute left-3 top-[40px] text-slate-400 transition-colors group-focus-within:text-blue-600" size={18} />
          </div>

          <div className="group relative">
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pl-10"
            />
            <Lock className="absolute left-3 top-[40px] text-slate-400 transition-colors group-focus-within:text-blue-600" size={18} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2 group">
            <div className="relative flex items-center">
              <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-slate-900 checked:bg-slate-900" />
              <Check size={12} className="pointer-events-none absolute left-0.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </div>
            <span className="font-medium text-slate-600 transition-colors group-hover:text-slate-900">Ghi nhớ đăng nhập</span>
          </label>
          <Link href="#" className="font-semibold text-blue-700 hover:text-blue-800">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Đang xác thực...</span>
            </div>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm font-medium text-slate-500">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-blue-700">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
