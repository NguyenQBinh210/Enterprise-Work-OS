import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export const COLUMNS = [
  {
    id: "TODO",
    title: "Cần làm",
    icon: Circle,
    accent: "bg-slate-400",
    surface: "bg-slate-50",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    iconBg: "bg-white text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    description: "Chưa bắt đầu",
  },
  {
    id: "IN_PROGRESS",
    title: "Đang tiến hành",
    icon: Loader2,
    accent: "bg-blue-500",
    surface: "bg-blue-50/60",
    badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    iconBg: "bg-white text-blue-600 ring-1 ring-blue-200",
    dot: "bg-blue-500",
    description: "Đang thực thi",
  },
  {
    id: "DONE",
    title: "Hoàn thành",
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    surface: "bg-emerald-50/60",
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    iconBg: "bg-white text-emerald-600 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    description: "Đã xong",
  },
] as const;
