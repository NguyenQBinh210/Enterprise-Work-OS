import Link from 'next/link';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    // 1. Lấy ID người dùng
    const { data: userData } = await supabase
        .from('Users')
        .select('Id, FullName')
        .eq('Email', session?.user?.email)
        .single();

    if (!userData) return <div className="p-10">Vui lòng đăng nhập lại.</div>;

    // 2. Thống kê dự án đã tham gia
    const { count: projectCount } = await supabase
        .from("GroupMembers")
        .select("*", { count: 'exact', head: true })
        .eq("UserId", userData.Id);

    // 3. Thống kê công việc cá nhân
    const { data: assignments } = await supabase
        .from("TaskAssignees")
        .select("TaskId")
        .eq("UserId", userData.Id);
    
    const taskIds = assignments?.map(a => a.TaskId) || [];

    // Lấy số lượng task chưa xong
    const { count: pendingTaskCount } = await supabase
        .from("Tasks")
        .select("*", { count: 'exact', head: true })
        .in("Id", taskIds)
        .neq("Status", "DONE");

    // Lấy số lượng task đã xong
    const { count: doneTaskCount } = await supabase
        .from("Tasks")
        .select("*", { count: 'exact', head: true })
        .in("Id", taskIds)
        .eq("Status", "DONE");

    const totalTasks = (Number(pendingTaskCount) || 0) + (Number(doneTaskCount) || 0);
    const completionRate = totalTasks ? Math.round((Number(doneTaskCount) / totalTasks) * 100) : 0;

    const stats = [
        { label: 'Dự án tham gia', value: projectCount || 0, color: "text-blue-600", bg: "bg-blue-50" },
        { label: 'Công việc còn lại', value: pendingTaskCount || 0, color: "text-amber-600", bg: "bg-amber-50" },
        { label: 'Đã hoàn thành', value: doneTaskCount || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: 'Hiệu suất cá nhân', value: `${completionRate}%`, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    // 4. Lấy danh sách dự án tham gia gần đây
    const { data: memberOfGroups } = await supabase
        .from("GroupMembers")
        .select("GroupId")
        .eq("UserId", userData.Id)
        .limit(3);
    
    const groupIds = memberOfGroups?.map(m => m.GroupId) || [];
    const { data: recentProjects } = await supabase
        .from("Groups")
        .select("*")
        .in("Id", groupIds)
        .order("CreatedAt", { ascending: false });

    return (
        <div className="space-y-10 p-6 md:p-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Tổng quan <span className="text-blue-600">Công việc</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Chào mừng trở lại, {userData.FullName}. Dưới đây là tiến độ cá nhân của bạn.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Hệ thống ổn định</span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                    >
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</h3>
                        <div className="flex items-end justify-between">
                            <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>
                                {stat.value}
                            </span>
                            <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                <svg className={`w-6 h-6 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Projects Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                            Dự án đang thực hiện
                        </h2>
                        <Link
                            href="/dashboard/projects"
                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
                        >
                            Xem tất cả →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recentProjects?.map((project: any) => (
                            <Link
                                key={project.Id}
                                href={`/dashboard/projects/${project.Id}`}
                                className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all p-8 flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg">
                                        {project.Name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                            {project.Name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{project.Id.substring(0, 8)}</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-6 font-medium leading-relaxed">
                                    {project.Description || "Dự án này chưa có mô tả chi tiết từ quản trị viên."}
                                </p>
                                <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>{new Date(project.CreatedAt).toLocaleDateString("vi-VN")}</span>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">Chi tiết →</span>
                                </div>
                            </Link>
                        ))}

                        <Link href="/dashboard/projects/new" className="group flex flex-col items-center justify-center min-h-[180px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:shadow-md transition-all mb-3">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-widest">Tạo dự án mới</span>
                        </Link>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Thông báo quan trọng</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-sm font-bold mb-1">Cập nhật hệ thống</p>
                                    <p className="text-[10px] text-slate-400">Phiên bản 2.4.0 đã sẵn sàng với nhiều tính năng mới.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-sm font-bold mb-1">Bảo trì định kỳ</p>
                                    <p className="text-[10px] text-slate-400">Chủ nhật này từ 02:00 - 04:00 sáng.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mẹo làm việc</h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Hãy sử dụng phím <kbd className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[10px]">Enter</kbd> để tạo nhanh các nhiệm vụ trong bảng Kanban của bạn.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
