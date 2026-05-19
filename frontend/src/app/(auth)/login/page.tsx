"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/actions/admin.actions";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase
        .from("Users")
        .select("Id, IsDisabled")
        .eq("Email", email)
        .single();

      if (userData?.IsDisabled) {
        await supabase.auth.signOut();
        setError("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        setLoading(false);
        return;
      }

      if (userData) {
        logActivity(userData.Id, "Đăng nhập hệ thống", "Truy cập từ trình duyệt").catch((logError) => {
          console.error("Không thể ghi nhật ký đăng nhập:", logError);
        });
      }
    } catch (err) {
      console.error("Lỗi kiểm tra trạng thái tài khoản:", err);
    }

    router.replace("/dashboard/projects");
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wider mb-2">
          <Shield size={14} />
          Hệ thống bảo mật cao
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 lg:text-5xl">
          {t("auth.welcome_back")}
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          {t("auth.enter_credentials")}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="p-4 text-sm font-bold text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 animate-slide-up flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="group relative">
            <Input
              label={t("auth.email")}
              type="email"
              placeholder="admin@work.os"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-11 h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
            />
            <Mail className="absolute left-4 top-[46px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          </div>

          <div className="group relative">
            <Input
              label={t("auth.password")}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 h-14 rounded-2xl border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
            />
            <Lock className="absolute left-4 top-[46px] text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" />
              <Check size={14} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-slate-600 font-bold group-hover:text-indigo-600 transition-colors">{t("auth.remember_me")}</span>
          </label>
          <Link href="#" className="text-indigo-600 hover:text-indigo-700 font-black tracking-tight">
            {t("auth.forgot_password")}
          </Link>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </div>
            ) : (
              <>
                <span>{t("auth.sign_in")}</span>
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center text-slate-500 font-bold">
        {t("auth.no_account")}{" "}
        <Link href="/register" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors underline underline-offset-4 decoration-2 decoration-indigo-100 hover:decoration-indigo-600">
          {t("auth.sign_up")}
        </Link>
      </div>
    </div>
  );
}

function Check({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
