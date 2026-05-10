'use client';

import { useState, useEffect } from 'react';
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
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async (session: any) => {
      if (session?.user) {
        const { data: userData } = await supabase.from('Users').select('*').eq('Email', session.user.email).single();
        if (userData) {
          const { data: profileData } = await supabase.from('UserProfiles').select('AvatarUrl').eq('UserId', userData.Id).single();
          setUser({ ...userData, AvatarUrl: profileData?.AvatarUrl });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => loadProfile(session), 500);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const role = user?.SystemRole?.toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER" || isAdmin;

  const NavLink = ({ href, icon: Icon, children, badge }: any) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center justify-between px-3 py-3 rounded-2xl transition-all relative group/link ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)]' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover/link:text-indigo-400'}`} />
          </div>
          <span className="font-bold text-[13px] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden tracking-wide">
            {children}
          </span>
        </div>
        {badge && (
          <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-[#020617] opacity-0 group-hover:opacity-100 transition-all duration-300">
            {badge}
          </span>
        )}
        {isActive && (
          <div className="absolute left-[-12px] w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)] opacity-0 group-hover:opacity-100"></div>
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

      <aside className={`group w-20 hover:w-72 bg-[#020617] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-900 shadow-2xl z-50 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden`}>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Logo Section */}
        <div className="h-24 flex items-center px-5 border-b border-slate-900/50 shrink-0 overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(79,70,229,0.6)] shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TaskFlow</span>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">Enterprise</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto scrollbar-hide relative z-10">

          {/* KHÔNG GIAN LÀM VIỆC */}
          <div>
            <h4 className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {t('common.workspace')}
            </h4>
            <div className="space-y-1.5">
              <NavLink href="/dashboard" icon={LayoutDashboard}>{t('common.dashboard')}</NavLink>
              <NavLink href="/dashboard/my-tasks" icon={CheckSquare}>{t('common.tasks')}</NavLink>
              <NavLink href="/dashboard/projects" icon={Folder}>{t('common.projects')}</NavLink>
              <NavLink href="/dashboard/notifications" icon={Bell} badge="3">{t('common.notifications')}</NavLink>
              <NavLink href="/dashboard/messages" icon={MessageSquare}>{t('common.messages')}</NavLink>
            </div>
          </div>

          {/* ADMINISTRATION */}
          {isManager && (
            <div>
              <h4 className="px-3 mb-4 text-[10px] font-black text-indigo-500/70 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('common.administration')}
              </h4>
              <div className="space-y-1.5">
                <NavLink href="/dashboard/statistics" icon={BarChart3}>{t('common.statistics')}</NavLink>
                <NavLink href="/dashboard/settings" icon={Settings}>{t('common.system_settings')}</NavLink>
              </div>
            </div>
          )}

          {/* SYSTEM */}
          {isAdmin && (
            <div>
              <h4 className="px-3 mb-4 text-[10px] font-black text-purple-500/70 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('common.system')}
              </h4>
              <div className="space-y-1.5">
                <NavLink href="/dashboard/admin" icon={Users}>{t('common.user_management')}</NavLink>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 bg-slate-900/30 border-t border-slate-900 shrink-0 relative z-10">
          <div className="flex items-center gap-4 p-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md overflow-hidden group/footer">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white overflow-hidden shadow-lg">
                {user?.AvatarUrl ? (
                  <img src={user.AvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user ? user.FullName.charAt(0).toUpperCase() : '?'
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#020617] rounded-full shadow-sm"></div>
            </div>
            <div className="min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user ? user.FullName : '...'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  isAdmin ? 'bg-purple-500/20 text-purple-400' : 
                  isManager ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  {role || 'USER'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 duration-300 shrink-0">
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
