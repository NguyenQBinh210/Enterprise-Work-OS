"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  CheckSquare,
  ChevronRight,
  Folder,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/shared/lib/i18n/LanguageContext";
import { createClient } from "@/shared/lib/supabase/client";
import { AppImage } from "@/shared/components/ui/AppImage";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

type SidebarUser = {
  Id: string;
  Email: string;
  FullName: string;
  SystemRole?: string | null;
  AvatarUrl?: string | null;
};

type NavLinkOptions = {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  badge?: string;
};

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async (session: Session | null) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: userData } = await supabase
        .from("Users")
        .select("*")
        .eq("Email", session.user.email)
        .single();
      if (!userData) {
        setUser(null);
        return;
      }

      const { data: profileData } = await supabase
        .from("UserProfiles")
        .select("AvatarUrl")
        .eq("UserId", userData.Id)
        .maybeSingle();
      setUser({ ...userData, AvatarUrl: profileData?.AvatarUrl });
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        loadProfile(session);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        loadProfile(session);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const role = user?.SystemRole?.toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER" || isAdmin;

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavLink = ({
    href,
    icon: Icon,
    children,
    badge,
  }: NavLinkOptions) => {
    const isActive = isRouteActive(href);

    return (
      <Link
        href={href}
        onClick={() => setIsOpen?.(false)}
        className={`group/link relative flex h-11 items-center justify-between rounded-xl px-3 transition-all duration-200 ease-out ${
          isActive
            ? "bg-blue-600 text-white shadow-[0_12px_28px_-16px_rgba(37,99,235,0.9)]"
            : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-white/15 text-white"
                : "text-slate-400 group-hover/link:bg-white/6 group-hover/link:text-blue-200"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 translate-x-0 truncate text-[13px] font-semibold opacity-100 transition-all duration-300 md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
            {children}
          </span>
        </div>

        {badge && (
          <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-slate-950 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
            {badge}
          </span>
        )}

        {isActive && (
          <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.75)] transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside
        className={`group fixed left-0 top-0 z-50 flex h-screen w-[min(86vw,320px)] flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-white shadow-2xl transition-[width,transform] duration-300 ease-out md:w-20 md:translate-x-0 md:hover:w-72 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0),rgba(30,64,175,0.08))]" />

        <div className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4 md:h-22 md:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/35 transition-transform duration-300 group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 whitespace-nowrap opacity-100 transition-all duration-300 md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
              <p className="truncate text-xl font-bold tracking-tight text-white">
                TaskFlow
              </p>
              <p className="truncate text-[11px] font-semibold text-blue-200/80">
                Enterprise Work OS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen?.(false)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5 md:px-4 md:py-6">
          <div>
            <h4 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
              {t("common.workspace")}
            </h4>
            <div className="space-y-1.5">
              {renderNavLink({
                href: "/dashboard",
                icon: LayoutDashboard,
                children: t("common.dashboard"),
              })}
              {renderNavLink({
                href: "/dashboard/my-tasks",
                icon: CheckSquare,
                children: t("common.tasks"),
              })}
              {renderNavLink({
                href: "/dashboard/projects",
                icon: Folder,
                children: t("common.projects"),
              })}
              {renderNavLink({
                href: "/dashboard/notifications",
                icon: Bell,
                children: t("common.notifications"),
                badge: "3",
              })}
              {renderNavLink({
                href: "/dashboard/messages",
                icon: MessageSquare,
                children: t("common.messages"),
              })}
            </div>
          </div>

          {isManager && (
            <div>
              <h4 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/70 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                {t("common.administration")}
              </h4>
              <div className="space-y-1.5">
                {renderNavLink({
                  href: "/dashboard/analytics",
                  icon: BarChart3,
                  children: t("common.statistics"),
                })}
                {renderNavLink({
                  href: "/dashboard/settings",
                  icon: Settings,
                  children: t("common.system_settings"),
                })}
              </div>
            </div>
          )}

          {isAdmin && (
            <div>
              <h4 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300/70 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                {t("common.system")}
              </h4>
              <div className="space-y-1.5">
                {renderNavLink({
                  href: "/dashboard/admin",
                  icon: Users,
                  children: t("common.user_management"),
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="relative z-10 shrink-0 border-t border-white/10 p-3 md:p-4">
          <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/4 p-2 transition-colors duration-200 hover:bg-white/[0.07]">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                {user?.AvatarUrl ? (
                  <AppImage
                    src={user.AvatarUrl}
                    alt="Avatar"
                    fill
                    className="h-full w-full"
                    imageClassName="object-cover"
                    sizes="40px"
                  />
                ) : user ? (
                  user.FullName.charAt(0).toUpperCase()
                ) : (
                  "?"
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400" />
            </div>

            <div className="min-w-0 flex-1 whitespace-nowrap opacity-100 transition-all duration-300 md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
              <p className="truncate text-sm font-semibold text-white">
                {user ? user.FullName : "..."}
              </p>
              <span
                className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  isAdmin
                    ? "bg-violet-400/15 text-violet-200"
                    : isManager
                      ? "bg-blue-400/15 text-blue-200"
                      : "bg-slate-700 text-slate-300"
                }`}
              >
                {role || "USER"}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
              <Link
                href="/dashboard/profile"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-200"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      <LogoutConfirmDialog
        open={isLogoutOpen}
        loading={isLoggingOut}
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
