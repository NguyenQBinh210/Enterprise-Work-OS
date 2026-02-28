'use client';

import Link from 'next/link';
import { MOCK_PROJECTS } from '@/lib/mock';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardPage() {
  const { t, locale } = useLanguage();

  const stats = [
    { label: t('dashboard.total_projects'), value: '12', trend: `+2 ${t('dashboard.this_month')}`, trendUp: true },
    { label: t('dashboard.active_tasks'), value: '64', trend: `-5 ${t('dashboard.this_week')}`, trendUp: false },
    { label: t('dashboard.team_members'), value: '8', trend: `+1 ${t('dashboard.new_member')}`, trendUp: true },
    { label: t('dashboard.completion_rate'), value: '94%', trend: '+2.5%', trendUp: true },
  ];

  const statusMap: Record<string, string> = {
    'In Progress': t('projects.in_progress'),
    'Planning': t('projects.planning'),
    'Completed': t('projects.completed'),
    'On Hold': t('projects.on_hold'),
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
        <p className="text-slate-500 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-slate-500">
              {stat.label}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {stat.value}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
              >
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('dashboard.recent_projects')}
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            {t('dashboard.view_all_projects')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group block bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg
                  ${project.status === "Completed"
                      ? "bg-emerald-500"
                      : project.status === "In Progress"
                        ? "bg-blue-500"
                        : project.status === "Planning"
                          ? "bg-purple-500"
                          : "bg-slate-500"
                    }`}
                >
                  {project.name.charAt(0)}
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                  ${project.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : project.status === "In Progress"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : project.status === "Planning"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-slate-50 text-slate-700 border-slate-100"
                    }`}
                >
                  {statusMap[project.status] || project.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                {project.name}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">{t('common.progress')}</span>
                  <span className="text-slate-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${project.progress === 100
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                      }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex -space-x-2 overflow-hidden">
                  {project.team.map((avatar, i) => (
                    <img
                      key={i}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                      src={avatar}
                      alt="Team member"
                    />
                  ))}
                  {project.team.length > 3 && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-medium text-slate-500">
                      +2
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {new Date(project.dueDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* New Project Card */}
          <button className="group flex flex-col items-center justify-center h-full min-h-[250px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 p-6">
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 group-hover:shadow-md transition-all duration-200 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="font-semibold text-slate-600 group-hover:text-blue-600">
              {t('dashboard.create_new_project')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
