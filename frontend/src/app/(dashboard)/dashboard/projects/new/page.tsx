"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProject } from "@/actions/project.actions";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectPage() {
    const router = useRouter();
    const supabase = createClient();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: userData } = await supabase
                    .from("Users")
                    .select("*")
                    .eq("Email", session.user.email)
                    .single();
                
                if (userData) {
                    setCurrentUser(userData);
                    // Kiểm tra quyền: Chỉ ADMIN hoặc MANAGER mới được vào trang này
                    const role = userData.SystemRole?.toUpperCase();
                    if (role !== "ADMIN" && role !== "MANAGER") {
                        router.push("/dashboard/projects");
                    }
                }
            } else {
                router.push("/login");
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Vui lòng nhập tên dự án");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await createProject(name, description, currentUser.Id);
            if (result.success) {
                router.push(`/dashboard/projects/${result.data.Id}`);
            } else {
                setError(result.message || "Lỗi không xác định khi tạo dự án");
            }
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8 animate-fade-in">
            <div className="mb-8">
                <button 
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Quay lại</span>
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Tạo dự án mới</h1>
                <p className="text-slate-500 mt-2">Bắt đầu một không gian làm việc mới cho nhóm của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tên dự án <span className="text-red-500">*</span></label>
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ví dụ: Thiết kế Website Enterprise"
                        className="h-12 text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mô tả dự án</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả mục tiêu và phạm vi của dự án này..."
                        className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    />
                </div>

                <div className="pt-4 flex gap-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tạo...
                            </span>
                        ) : "Xác nhận tạo dự án"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="h-12 px-8 font-bold"
                    >
                        Hủy
                    </Button>
                </div>
            </form>
        </div>
    );
}
