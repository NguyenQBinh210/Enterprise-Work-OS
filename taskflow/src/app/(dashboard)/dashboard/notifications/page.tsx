"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Inbox,
  MailOpen,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppImage } from "@/components/ui/AppImage";

type NotificationItem = {
  Id: string;
  UserId: string;
  TaskId?: string | null;
  Message: string;
  IsRead: boolean;
  CreatedAt: string;
  Type?: string | null;
  Link?: string | null;
  ActorId?: string | null;
  ActorName?: string | null;
  ActorAvatarUrl?: string | null;
};

type NotificationActor = {
  Id: string;
  FullName?: string | null;
};

type NotificationProfile = {
  UserId: string;
  AvatarUrl?: string | null;
};

type FilterId = "all" | "unread" | "message" | "task" | "project";

type FilterConfig = {
  id: FilterId;
  label: string;
  icon: LucideIcon;
};

const filters: FilterConfig[] = [
  { id: "all", label: "Tất cả", icon: Inbox },
  { id: "unread", label: "Chưa đọc", icon: MailOpen },
  { id: "message", label: "Tin nhắn", icon: MessageSquare },
  { id: "task", label: "Công việc", icon: CheckCircle2 },
  { id: "project", label: "Dự án", icon: FolderKanban },
];

function getNotificationIcon(type?: string | null) {
  if (type === "PRIVATE_MESSAGE") return MessageSquare;
  if (type?.startsWith("TASK_")) return CheckCircle2;
  if (type === "PROJECT_INVITED") return FolderKanban;
  return Bell;
}

function getNotificationTone(type?: string | null) {
  if (type === "PRIVATE_MESSAGE") return "bg-sky-50 text-sky-700 ring-sky-100";
  if (type?.startsWith("TASK_")) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (type === "PROJECT_INVITED") return "bg-violet-50 text-violet-700 ring-violet-100";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  if (absMs < 60_000) return "Vừa xong";
  if (absMs < 3_600_000) return formatter.format(Math.round(diffMs / 60_000), "minute");
  if (absMs < 86_400_000) return formatter.format(Math.round(diffMs / 3_600_000), "hour");
  if (absMs < 2_592_000_000) return formatter.format(Math.round(diffMs / 86_400_000), "day");

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const enrichNotifications = useCallback(async (items: NotificationItem[]) => {
    const actorIds = [...new Set(items.map((item) => item.ActorId).filter(Boolean))] as string[];
    if (actorIds.length === 0) return items;

    const [{ data: users }, { data: profiles }] = await Promise.all([
      supabase.from("Users").select("Id, FullName").in("Id", actorIds),
      supabase.from("UserProfiles").select("UserId, AvatarUrl").in("UserId", actorIds),
    ]);

    return items.map((item) => {
      const actor = users?.find((user: NotificationActor) => user.Id === item.ActorId);
      const profile = profiles?.find((profile: NotificationProfile) => profile.UserId === item.ActorId);

      return {
        ...item,
        ActorName: actor?.FullName || null,
        ActorAvatarUrl: profile?.AvatarUrl || null,
      };
    });
  }, [supabase]);

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.from("Users").select("Id").eq("Email", user.email).single();
    if (!userData?.Id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("Notifications")
      .select("*")
      .eq("UserId", userData.Id)
      .order("CreatedAt", { ascending: false });

    setNotifications(await enrichNotifications((data || []) as NotificationItem[]));
    setLoading(false);
  }, [enrichNotifications, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchNotifications]);

  const counts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter((item) => !item.IsRead).length,
    message: notifications.filter((item) => item.Type === "PRIVATE_MESSAGE").length,
    task: notifications.filter((item) => item.Type?.startsWith("TASK_")).length,
    project: notifications.filter((item) => item.Type === "PROJECT_INVITED").length,
  }), [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") return notifications.filter((item) => !item.IsRead);
    if (activeFilter === "message") return notifications.filter((item) => item.Type === "PRIVATE_MESSAGE");
    if (activeFilter === "task") return notifications.filter((item) => item.Type?.startsWith("TASK_"));
    if (activeFilter === "project") return notifications.filter((item) => item.Type === "PROJECT_INVITED");
    return notifications;
  }, [activeFilter, notifications]);

  const markAsRead = async (notificationId: string) => {
    setNotifications((current) => current.map((item) => (
      item.Id === notificationId ? { ...item, IsRead: true } : item
    )));
    await supabase.from("Notifications").update({ IsRead: true }).eq("Id", notificationId);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((item) => !item.IsRead).map((item) => item.Id);
    if (unreadIds.length === 0) return;

    setNotifications((current) => current.map((item) => ({ ...item, IsRead: true })));
    await supabase.from("Notifications").update({ IsRead: true }).in("Id", unreadIds);
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications((current) => current.filter((item) => item.Id !== notificationId));
    await supabase.from("Notifications").delete().eq("Id", notificationId);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-6 text-white md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                <Bell className="h-3.5 w-3.5" />
                Trung tâm thông báo
              </div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Thông báo</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Theo dõi tin nhắn, công việc được giao và cập nhật dự án cần bạn xử lý.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold">{counts.all}</p>
                <p className="text-xs font-medium text-slate-300">Tổng số</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-2xl font-semibold text-blue-100">{counts.unread}</p>
                <p className="text-xs font-medium text-slate-300">Chưa đọc</p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 sm:col-span-1">
                <p className="text-2xl font-semibold text-emerald-100">{counts.task}</p>
                <p className="text-xs font-medium text-slate-300">Công việc</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            {filters.map((item) => {
              const Icon = item.icon;
              const isActive = activeFilter === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveFilter(item.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-blue-200 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={counts.unread === 0}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Check className="h-4 w-4" />
              Đánh dấu đã đọc
            </button>
            <button
              type="button"
              onClick={refreshNotifications}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:text-blue-700"
              aria-label="Tải lại thông báo"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4 p-4 md:p-5">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Không có thông báo phù hợp</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Khi có cập nhật mới từ dự án, công việc hoặc tin nhắn, chúng sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.Type);
              const tone = getNotificationTone(notification.Type);
              const content = (
                <div className={`group flex gap-4 p-4 transition-all duration-200 md:p-5 ${
                  notification.IsRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/45 hover:bg-blue-50"
                }`}>
                  <div className="relative shrink-0">
                    <div className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ring-1 ${tone}`}>
                      {notification.ActorAvatarUrl ? (
                        <AppImage
                          src={notification.ActorAvatarUrl}
                          alt={notification.ActorName || "Avatar"}
                          fill
                          className="h-full w-full"
                          imageClassName="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    {!notification.IsRead && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <p className={`text-sm leading-6 ${notification.IsRead ? "font-medium text-slate-700" : "font-semibold text-slate-950"}`}>
                        {notification.Message}
                      </p>
                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        {formatRelativeTime(notification.CreatedAt)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {notification.ActorName && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {notification.ActorName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-100">
                        <Clock3 className="h-3 w-3" />
                        {new Date(notification.CreatedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      deleteNotification(notification.Id);
                    }}
                    className="h-9 w-9 shrink-0 rounded-xl text-slate-300 opacity-100 transition-all hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Xóa thông báo"
                  >
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                </div>
              );

              return notification.Link ? (
                <Link key={notification.Id} href={notification.Link} onClick={() => markAsRead(notification.Id)} className="block">
                  {content}
                </Link>
              ) : (
                <button key={notification.Id} type="button" onClick={() => markAsRead(notification.Id)} className="block w-full text-left">
                  {content}
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
