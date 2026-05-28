'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Folder, 
  CheckSquare,
  Bell, 
  BarChart3, 
  Settings, 
  Users,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useLanguage } from '@/shared/lib/i18n/LanguageContext';
import { createClient } from '@/shared/lib/supabase/client';
import { AppImage } from '@/shared/components/ui/AppImage';
import { usePathname, useRouter } from 'next/navigation';

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

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SidebarUser | null>(null);

  useEffect(() => {
    const loadProfile = async (session: Session | null) => {
      if (session?.user) {
        const { data: userData } = await supabase.from('Users').select('*').eq('Email', session.user.email).single();
        if (userData) {
          const { data: profileData } = await supabase.from('UserProfiles').select('AvatarUrl').eq('UserId', userData.Id).maybeSingle();
          setUser({ ...userData, AvatarUrl: profileData?.AvatarUrl });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      loadProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      loadProfile(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const role = user?.SystemRole?.toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER" || isAdmin;

  const renderNavLink = ({ href, icon: Icon, children, badge }: NavLinkOptions) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setIsOpen?.(false)}
        className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all relative group/link ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)]' 
            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover/link:text-indigo-400'}`} />
          </div>
          <span className="font-semibold text-[13px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
            {children}
          </span>
        </div>
        {badge && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#020617] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
            {badge}
          </span>
        )}
        {isActive && (
          <div className="absolute left-[-12px] w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)] opacity-100 md:opacity-0 md:group-hover:opacity-100"></div>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-md transition-opacity"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      <aside className={`group w-[min(86vw,320px)] md:w-20 md:hover:w-72 bg-[#020617] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-900 shadow-2xl z-50 transform transition-all duration-300 md:duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden`}>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Logo Section */}
        <div className="h-20 md:h-24 flex items-center justify-between px-4 md:px-5 border-b border-slate-900/50 shrink-0 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(79,70,229,0.6)] shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TaskFlow</span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase mt-0.5">Enterprise</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen?.(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-5 md:py-8 px-3 md:px-4 space-y-6 md:space-y-8 overflow-y-auto scrollbar-hide relative z-10">

          {/* KHÔNG GIAN LÀM VIỆC */}
          <div>
            <h4 className="px-3 mb-3 md:mb-4 text-[10px] font-semibold text-slate-500 uppercase opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {t('common.workspace')}
            </h4>
            <div className="space-y-1.5">
              {renderNavLink({ href: "/dashboard", icon: LayoutDashboard, children: t('common.dashboard') })}
              {renderNavLink({ href: "/dashboard/my-tasks", icon: CheckSquare, children: t('common.tasks') })}
              {renderNavLink({ href: "/dashboard/projects", icon: Folder, children: t('common.projects') })}
              {renderNavLink({ href: "/dashboard/notifications", icon: Bell, children: t('common.notifications'), badge: "3" })}
              {renderNavLink({ href: "/dashboard/messages", icon: MessageSquare, children: t('common.messages') })}
            </div>
          </div>

          {/* ADMINISTRATION */}
          {isManager && (
            <div>
              <h4 className="px-3 mb-3 md:mb-4 text-[10px] font-semibold text-indigo-400 uppercase opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('common.administration')}
              </h4>
              <div className="space-y-1.5">
                {renderNavLink({ href: "/dashboard/analytics", icon: BarChart3, children: t('common.statistics') })}
                {renderNavLink({ href: "/dashboard/settings", icon: Settings, children: t('common.system_settings') })}
              </div>
            </div>
          )}

          {/* SYSTEM */}
          {isAdmin && (
            <div>
              <h4 className="px-3 mb-3 md:mb-4 text-[10px] font-semibold text-purple-400 uppercase opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('common.system')}
              </h4>
              <div className="space-y-1.5">
                {renderNavLink({ href: "/dashboard/admin", icon: Users, children: t('common.user_management') })}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 md:p-4 bg-slate-900/30 border-t border-slate-900 shrink-0 relative z-10">
          <div className="flex items-center gap-3 md:gap-4 p-2 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md overflow-hidden group/footer">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white overflow-hidden shadow-lg">
                {user?.AvatarUrl ? (
                  <AppImage src={user.AvatarUrl} alt="Avatar" fill className="w-full h-full" imageClassName="object-cover" sizes="40px" />
                ) : (
                  user ? user.FullName.charAt(0).toUpperCase() : '?'
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-sm"></div>
            </div>
            <div className="min-w-0 flex-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user ? user.FullName : '...'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase ${
                  isAdmin ? 'bg-purple-500/20 text-purple-400' : 
                  isManager ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  {role || 'USER'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 shrink-0">
              <Link href="/dashboard/profile" className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all">
                <Settings className="w-4 h-4" />
              </Link>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
