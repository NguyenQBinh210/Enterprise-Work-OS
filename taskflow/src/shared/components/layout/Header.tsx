'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, Settings, UserRound } from 'lucide-react';
import LanguageSwitcher from '@/shared/components/ui/LanguageSwitcher';
import { createClient } from '@/shared/lib/supabase/client';
import { AppImage } from '@/shared/components/ui/AppImage';
import { useLanguage } from '@/shared/lib/i18n/LanguageContext';

type HeaderUser = {
    Id: string;
    Email: string;
    FullName: string;
    AvatarUrl?: string | null;
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { t } = useLanguage();
    const supabase = createClient();
    const [user, setUser] = useState<HeaderUser | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    const loadUnreadCount = useCallback(async (userId: string) => {
        const { count } = await supabase
            .from('Notifications')
            .select('*', { count: 'exact', head: true })
            .eq('UserId', userId)
            .eq('IsRead', false);

        setUnreadCount(count || 0);
    }, [supabase]);

    useEffect(() => {
        const loadProfile = async (session: Session | null) => {
            if (!session?.user) {
                setUser(null);
                setUnreadCount(0);
                return;
            }

            const { data: userData } = await supabase.from('Users').select('*').eq('Email', session.user.email).single();
            if (!userData) {
                setUser(null);
                setUnreadCount(0);
                return;
            }

            const { data: profileData } = await supabase.from('UserProfiles').select('AvatarUrl').eq('UserId', userData.Id).maybeSingle();
            setUser({ ...userData, AvatarUrl: profileData?.AvatarUrl });
            await loadUnreadCount(userData.Id);
        };

        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            loadProfile(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            loadProfile(session);
        });

        return () => subscription.unsubscribe();
    }, [loadUnreadCount, supabase]);

    useEffect(() => {
        if (!user?.Id) return;

        const channel = supabase
            .channel(`notifications:${user.Id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Notifications', filter: `UserId=eq.${user.Id}` },
                () => loadUnreadCount(user.Id)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadUnreadCount, supabase, user?.Id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl sm:px-4 md:left-20 md:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    className="rounded-xl p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 active:scale-95 md:hidden"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0 md:hidden">
                    <p className="truncate text-sm font-bold leading-tight text-slate-950">TaskFlow</p>
                    <p className="truncate text-[11px] font-medium text-slate-400">Enterprise Work OS</p>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm shadow-emerald-900/5 sm:inline-flex">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Hệ thống ổn định
                </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                <Link
                    href="/dashboard/notifications"
                    className="group relative rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 active:scale-95"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="flex min-w-0 items-center gap-2 rounded-2xl border border-transparent p-1 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50 active:scale-[0.98] sm:gap-2.5"
                        onClick={() => setIsDropdownOpen((open) => !open)}
                        aria-expanded={isDropdownOpen}
                    >
                        <div className="hidden min-w-0 text-right md:block">
                            <p className="max-w-40 truncate text-sm font-semibold leading-tight text-slate-800">
                                {user ? user.FullName : 'Đang tải...'}
                            </p>
                            <p className="truncate text-[11px] font-medium text-slate-400">
                                {user?.Email || 'Workspace account'}
                            </p>
                        </div>

                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white ring-2 ring-white shadow-sm">
                            {user?.AvatarUrl ? (
                                <AppImage src={user.AvatarUrl} alt="Avatar" fill className="h-full w-full" imageClassName="object-cover" sizes="40px" />
                            ) : (
                                user ? user.FullName.charAt(0).toUpperCase() : '?'
                            )}
                        </div>
                        <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 animate-fade-in">
                            <div className="border-b border-slate-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
                                        {user?.AvatarUrl ? (
                                            <AppImage src={user.AvatarUrl} alt="Avatar" fill className="h-full w-full" imageClassName="object-cover" sizes="44px" />
                                        ) : (
                                            user ? user.FullName.charAt(0).toUpperCase() : '?'
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-950">{user?.FullName || 'Đang tải...'}</p>
                                        <p className="truncate text-xs text-slate-500">{user?.Email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-slate-100 px-2 py-2 sm:hidden">
                                <LanguageSwitcher />
                            </div>

                            <div className="p-2">
                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <UserRound className="h-4 w-4 text-slate-400" />
                                    {t('common.profile')}
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <Settings className="h-4 w-4 text-slate-400" />
                                    {t('common.settings')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {t('common.logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
