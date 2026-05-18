'use client';

import { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadProfile = async (session: Session | null) => {
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

        // 1. Tải lần đầu
        supabase.auth.getSession().then(({ data: { session } }) => {
            loadProfile(session);
        });

        // 2. Tự động lắng nghe mỗi khi Đăng nhập / Đăng xuất
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Đợi 1 chút xíu (500ms) để đề phòng lúc Đăng ký, hàm insert Users chạy chưa xong
            setTimeout(() => loadProfile(session), 500);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Click outside to close dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-0 md:left-20 z-40 px-3 sm:px-4 md:px-6 flex items-center justify-between">
            {/* Left Side Actions (Hamburger Menu) */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <button 
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="md:hidden min-w-0">
                    <p className="text-sm font-semibold leading-tight text-slate-900 truncate">TaskFlow</p>
                    <p className="text-[11px] font-medium uppercase text-slate-400 truncate">Enterprise</p>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                <button className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>
                <div className="relative" ref={dropdownRef}>
                    <div 
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer rounded-xl p-1 hover:bg-slate-100 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className="max-w-36 truncate text-sm font-medium text-slate-700 hidden md:block">
                            {user ? user.FullName : 'Đang tải...'}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
                            {user?.AvatarUrl ? (
                                <img src={user.AvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user ? user.FullName.charAt(0).toUpperCase() : '?'
                            )}
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user?.FullName}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.Email}</p>
                            </div>
                            <div className="sm:hidden px-3 py-2 border-b border-slate-100">
                                <LanguageSwitcher />
                            </div>
                            <Link 
                                href="/dashboard/profile"
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                {t('common.profile')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                {t('common.logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
