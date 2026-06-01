'use client';

import { BarChart3, CheckCircle2, Clock3, FolderKanban, MessageSquare, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden bg-slate-50 lg:grid-cols-[minmax(560px,0.95fr)_minmax(440px,0.8fr)]">
      <div className="hidden border-r border-slate-200 bg-[linear-gradient(135deg,#07111f_0%,#0f172a_52%,#15345f_100%)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-950/40">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight">TaskFlow</p>
            <p className="text-xs font-medium text-blue-100/80">Enterprise Work OS</p>
          </div>
        </div>

        <div className="max-w-xl space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
              <ShieldCheck className="h-3.5 w-3.5" />
              Không gian làm việc bảo mật cho đội nhóm
            </span>
            <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Quản lý dự án rõ ràng, không rối thông tin.
            </h1>
            <p className="max-w-md text-base leading-7 text-blue-50/70">
              Theo dõi ai đang phụ trách việc gì, nhiệm vụ nào sắp trễ hạn và nhóm cần xử lý gì tiếp theo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-4 shadow-2xl shadow-black/25">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-sm font-semibold text-white">Sprint vận hành</p>
                <p className="text-xs text-blue-50/55">Cập nhật hôm nay</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                82% đúng hạn
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Việc mở", value: "24", icon: Clock3 },
                { label: "Hoàn tất", value: "18", icon: CheckCircle2 },
                { label: "Tin nhắn", value: "9", icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
                    <Icon className="mb-3 h-4 w-4 text-blue-100/65" />
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-blue-50/45">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              {["Duyệt luồng nhiệm vụ", "Chốt phạm vi phát hành", "Rà soát lỗi đăng nhập"].map((task, index) => (
                <div key={task} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-300" />
                    <span className="text-sm text-slate-300">{task}</span>
                  </div>
                  <span className="text-xs text-blue-50/45">{index + 1}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-blue-50/45">
          <span>TaskFlow</span>
          <span className="inline-flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Built for daily operations
          </span>
        </div>
      </div>

      <div className="flex min-w-0 w-full items-center justify-start overflow-hidden px-5 py-8 sm:justify-center sm:px-8 lg:bg-white">
        <div className="auth-form-shell min-w-0 animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
