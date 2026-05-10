import Link from 'next/link';
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

// Gradient palettes for project cards - each project gets a unique look
const CARD_GRADIENTS = [
  { from: "from-violet-500", to: "to-indigo-600", bg: "from-violet-50 to-indigo-50", ring: "ring-violet-100", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  { from: "from-blue-500", to: "to-cyan-500", bg: "from-blue-50 to-cyan-50", ring: "ring-blue-100", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  { from: "from-emerald-500", to: "to-teal-500", bg: "from-emerald-50 to-teal-50", ring: "ring-emerald-100", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  { from: "from-orange-500", to: "to-pink-500", bg: "from-orange-50 to-pink-50", ring: "ring-orange-100", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  { from: "from-rose-500", to: "to-purple-600", bg: "from-rose-50 to-purple-50", ring: "ring-rose-100", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
  { from: "from-amber-500", to: "to-orange-500", bg: "from-amber-50 to-orange-50", ring: "ring-amber-100", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
];

function getGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

function getInitials(name: string) {
  return name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "P";
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export default async function ProjectListPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  let currentUser = null;
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (authUser) {
    const { data: userData } = await supabase
      .from("Users").select("Id, FullName, SystemRole").eq("Email", authUser.email).single();
    if (userData) currentUser = userData;
  }

  const role = currentUser?.SystemRole?.toUpperCase();
  const canCreateProject = role === "ADMIN" || role === "MANAGER";

  let projects: any[] = [];
  let taskCounts: Record<string, number> = {};
  let memberCounts: Record<string, number> = {};

  if (role === "ADMIN") {
    const { data } = await supabase.from("Groups").select("*").order("CreatedAt", { ascending: false });
    if (data) projects = data;
  } else if (currentUser) {
    const { data: membersData } = await supabase
      .from("GroupMembers").select("GroupId, Groups(*)").eq("UserId", currentUser.Id);
    if (membersData) projects = membersData.map((m: any) => m.Groups).filter(Boolean);
  }

  // Fetch task counts and member counts for each project
  if (projects.length > 0) {
    const ids = projects.map((p: any) => p.Id);

    const { data: taskData } = await supabase
      .from("Tasks").select("GroupId").in("GroupId", ids).eq("IsDeleted", false);
    if (taskData) {
      taskData.forEach((t: any) => { taskCounts[t.GroupId] = (taskCounts[t.GroupId] || 0) + 1; });
    }

    const { data: memberData } = await supabase
      .from("GroupMembers").select("GroupId").in("GroupId", ids);
    if (memberData) {
      memberData.forEach((m: any) => { memberCounts[m.GroupId] = (memberCounts[m.GroupId] || 0) + 1; });
    }
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dự án của tôi</h1>
          </div>
          <p className="text-sm text-slate-500 ml-3.5">
            {projects.length > 0
              ? `${projects.length} dự án đang hoạt động`
              : "Quản lý và theo dõi tiến độ các dự án bạn tham gia"}
          </p>
        </div>

        {canCreateProject && (
          <Link href="/dashboard/projects/new">
            <button className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95">
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Tạo dự án mới
            </button>
          </Link>
        )}
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Tổng dự án", value: projects.length, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "text-indigo-600 bg-indigo-50" },
            { label: "Tổng nhiệm vụ", value: Object.values(taskCounts).reduce((a, b) => a + b, 0), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "text-emerald-600 bg-emerald-50" },
            { label: "Thành viên", value: Object.values(memberCounts).reduce((a, b) => a + b, 0), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-violet-600 bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Project Grid ───────────────────────────────────────────────────── */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project: any, i: number) => {
            const g = getGradient(i);
            const taskCount = taskCounts[project.Id] || 0;
            const memberCount = memberCounts[project.Id] || 0;

            return (
              <Link
                key={project.Id}
                href={`/dashboard/projects/${project.Id}`}
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Top gradient banner */}
                <div className={`h-24 bg-gradient-to-br ${g.from} ${g.to} relative overflow-hidden flex-shrink-0`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute top-6 -right-8 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full" />

                  {/* Avatar */}
                  <div className="absolute bottom-0 left-5 translate-y-1/2">
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg ring-4 ring-white flex items-center justify-center font-black text-xl ${g.text}`}>
                      {getInitials(project.Name)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Đang thực hiện
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
                  <h3 className={`text-lg font-black text-slate-900 group-hover:${g.text} transition-colors duration-200 line-clamp-1 mb-1`}>
                    {project.Name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
                    {project.Description || "Chưa có mô tả chi tiết cho dự án này."}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${g.badge}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                      </svg>
                      {taskCount} nhiệm vụ
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {memberCount} thành viên
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className="text-[10px] text-slate-300 font-medium">
                      {timeAgo(project.CreatedAt)}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-black ${g.text} group-hover:gap-2 transition-all duration-200`}>
                      Vào dự án
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Create New Card — only for admins/managers */}
          {canCreateProject && (
            <Link href="/dashboard/projects/new"
              className="group relative bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] gap-4 p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg className="w-7 h-7 text-indigo-500 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-black text-slate-600 group-hover:text-indigo-600 transition-colors text-sm">Tạo dự án mới</p>
                <p className="text-xs text-slate-400 mt-1">Bắt đầu một dự án từ đầu</p>
              </div>
            </Link>
          )}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center min-h-[420px] bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có dự án nào</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-8 text-sm leading-relaxed">
            {canCreateProject
              ? "Bắt đầu hành trình bằng cách tạo dự án đầu tiên của bạn."
              : "Bạn chưa tham gia dự án nào. Liên hệ quản lý để được thêm vào."}
          </p>
          {canCreateProject && (
            <Link href="/dashboard/projects/new">
              <button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5">
                Tạo dự án đầu tiên
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
