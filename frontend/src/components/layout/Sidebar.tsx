'use client';

import Link from 'next/link';
// import { Home, Folder, Settings, Box } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Sidebar() {
  const { t } = useLanguage();

  return (
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 shadow-xl z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-400">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>WorkOS</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">

        {/* Section: Overview */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('common.overview')}
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium">{t('common.dashboard')}</span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">{t('common.analytics')}</span>
            </Link>
          </div>
        </div>

        {/* Section: Workspace */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('common.workspace')}
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium">{t('common.projects')}</span>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="font-medium">{t('common.tasks')}</span>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{t('common.calendar')}</span>
            </Link>

            <Link
              href="/dashboard/documents"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{t('common.documents')}</span>
            </Link>
          </div>
        </div>

        {/* Section: Communication */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('common.communication')}
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/messages"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="font-medium">{t('common.messages')}</span>
              <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
            </Link>

            <Link
              href="/dashboard/team"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">{t('common.team')}</span>
            </Link>
          </div>
        </div>

        {/* Section: General */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t('common.general')}
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{t('common.settings')}</span>
            </Link>

            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{t('common.help')}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* User Info / Bottom of Sidebar */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            QB
          </div>
          <div>
            <p className="text-sm font-medium text-white">Quốc Bình</p>
            <p className="text-xs text-slate-400">{t('common.senior_dev')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
