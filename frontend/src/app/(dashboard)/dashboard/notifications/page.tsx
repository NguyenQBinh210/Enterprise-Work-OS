"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "message", label: "Tin nhắn" },
  { id: "task", label: "Công việc" },
  { id: "project", label: "Dự án" },
];

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const enrichNotifications = async (items: NotificationItem[]) => {
    const actorIds = [...new Set(items.map(item => item.ActorId).filter(Boolean))] as string[];
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
  };

  const loadNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.from("Users").select("Id").eq("Email", user.email).single();
    if (!userData?.Id) {
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
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "message") return notifications.filter(item => item.Type === "PRIVATE_MESSAGE");
    if (activeFilter === "task") return notifications.filter(item => item.Type?.startsWith("TASK_"));
    if (activeFilter === "project") return notifications.filter(item => item.Type === "PROJECT_INVITED");
    return notifications;
  }, [activeFilter, notifications]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(current => current.map(item => item.Id === notificationId ? { ...item, IsRead: true } : item));
    await supabase.from("Notifications").update({ IsRead: true }).eq("Id", notificationId);
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(current => current.filter(item => item.Id !== notificationId));
    await supabase.from("Notifications").delete().eq("Id", notificationId);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Thông báo</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Theo dõi tin nhắn, công việc và cập nhật dự án.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveFilter(item.id)}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeFilter === item.id ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm font-semibold text-slate-400">Đang tải thông báo...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center text-slate-400">
            <Bell className="mb-3 h-10 w-10" />
            <p className="text-sm font-bold">Chưa có thông báo</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const content = (
              <div className={`${notification.IsRead ? "bg-white" : "bg-blue-50/40"} flex gap-4 p-4 transition-colors hover:bg-slate-50`}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-black text-slate-500 ring-1 ring-slate-200">
                  {notification.ActorAvatarUrl ? (
                    <img src={notification.ActorAvatarUrl} alt={notification.ActorName || "Avatar"} className="h-full w-full object-cover" />
                  ) : notification.Type === "PRIVATE_MESSAGE" ? (
                    <MessageSquare className="h-5 w-5" />
                  ) : (
                    (notification.ActorName || notification.Message || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-relaxed text-slate-800">{notification.Message}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {new Date(notification.CreatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteNotification(notification.Id);
                  }}
                  className="h-9 w-9 rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Xóa thông báo"
                >
                  <Trash2 className="mx-auto h-4 w-4" />
                </button>
              </div>
            );

            return notification.Link ? (
              <Link key={notification.Id} href={notification.Link} onClick={() => markAsRead(notification.Id)}>
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
    </div>
  );
}
