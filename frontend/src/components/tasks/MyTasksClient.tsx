"use client";

import { useState } from "react";
import { completeTask, deleteTask, createTask } from "@/actions/task.actions";
import { 
    CheckCircle2, 
    Circle, 
    Clock, 
    Trash2, 
    Plus, 
    AlertCircle,
    Calendar,
    ChevronRight,
    Trophy
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MyTasksClient({ initialTasks, currentUser }: { initialTasks: any[], currentUser: any }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const handleComplete = async (taskId: string) => {
        setLoadingId(taskId);
        const res = await completeTask(taskId);
        if (res.success) {
            setTasks(prev => prev.map(t => t.Id === taskId ? { ...t, Status: "DONE" } : t));
        }
        setLoadingId(null);
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
        setLoadingId(taskId);
        try {
            await deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.Id !== taskId));
        } catch (e) {
            console.error(e);
        }
        setLoadingId(null);
    };

    const getDeadlineInfo = (deadlineStr: string) => {
        if (!deadlineStr) return null;
        const deadline = new Date(deadlineStr);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: `Quá hạn ${Math.abs(diffDays)} ngày`, color: "text-red-600 bg-red-50 border-red-100" };
        if (diffDays === 0) return { label: "Hạn chót hôm nay", color: "text-amber-600 bg-amber-50 border-amber-100" };
        if (diffDays <= 3) return { label: `Còn ${diffDays} ngày`, color: "text-orange-600 bg-orange-50 border-orange-100" };
        return { label: `Hạn: ${deadline.toLocaleDateString("vi-VN")}`, color: "text-slate-500 bg-slate-50 border-slate-100" };
    };

    const todoTasks = tasks.filter(t => t.Status !== "DONE");
    const doneTasks = tasks.filter(t => t.Status === "DONE");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Task List */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Active Tasks */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Đang thực hiện
                            <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100">
                                {todoTasks.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {todoTasks.map(task => {
                            const deadline = getDeadlineInfo(task.Deadline || task.DueDate);
                            return (
                                <div key={task.Id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all flex items-center gap-5">
                                    <button 
                                        onClick={() => handleComplete(task.Id)}
                                        disabled={loadingId === task.Id}
                                        className="shrink-0 w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                    >
                                        <Circle className="w-6 h-6" />
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                            {task.Title}
                                        </h3>
                                        
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                            {/* Dự án */}
                                            {task.Project?.Name && (
                                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    {task.Project.Name}
                                                </div>
                                            )}
                                            
                                            {/* Deadline */}
                                            {deadline && (
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${deadline.color}`}>
                                                    <Clock className="w-3 h-3" />
                                                    {deadline.label}
                                                </div>
                                            )}
                                            
                                            {!deadline && !task.Project?.Name && (
                                                <p className="text-xs text-slate-400">Nhiệm vụ tự do</p>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(task.Id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })}

                        {todoTasks.length === 0 && (
                            <div className="py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                                <Trophy className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-bold">Tuyệt vời! Bạn đã hoàn thành hết công việc.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Completed Tasks */}
                {doneTasks.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2 mb-6">
                            <CheckCircle2 className="w-5 h-5" />
                            Đã hoàn thành
                        </h2>
                        <div className="space-y-3 opacity-60">
                            {doneTasks.map(task => (
                                <div key={task.Id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-500 line-through mb-1">{task.Title}</h3>
                                        {task.Project?.Name && (
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                Dự án: {task.Project.Name}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(task.Id)} className="p-2 text-slate-300 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Right: Summary & Quick Actions */}
            <div className="space-y-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Tiến độ cá nhân</p>
                        <h3 className="text-4xl font-black mb-6">
                            {tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0}%
                        </h3>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full transition-all duration-1000" 
                                style={{ width: `${tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0}%` }}
                            />
                        </div>
                        <p className="mt-6 text-sm text-slate-300 leading-relaxed font-medium">
                            Bạn đã hoàn thành <strong className="text-white">{doneTasks.length}</strong> trên tổng số <strong className="text-white">{tasks.length}</strong> nhiệm vụ được giao.
                        </p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Thao tác nhanh</h3>
                    <div className="space-y-3">
                        <Button className="w-full justify-start gap-3 py-6 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100">
                            <Plus className="w-5 h-5" />
                            Ghi chú việc cần làm
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 py-6 rounded-2xl text-slate-500 hover:bg-slate-50">
                            <Calendar className="w-5 h-5" />
                            Xem lịch trình
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
