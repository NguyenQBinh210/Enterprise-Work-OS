import UserManagementTable from "@/components/admin/UserManagementTable";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // Kiểm tra quyền Server-side
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) redirect("/login");

        if (!authUser.email) {
            console.error("Auth user email is missing");
            redirect("/login");
        }

        const { data: userData, error: dbError } = await supabase
            .from("Users")
            .select("SystemRole")
            .eq("Email", authUser.email)
            .single();

        if (dbError || !userData) {
            console.error("User not found in database:", dbError?.message);
            redirect("/dashboard/projects");
        }

        if (userData?.SystemRole?.toUpperCase() !== "ADMIN") {
            // Nếu không phải ADMIN thì đá ra trang chủ dashboard
            redirect("/dashboard/projects");
        }
    } catch (e) {
        console.error("Lỗi kiểm tra quyền Admin:", e);
        redirect("/dashboard/projects");
    }

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto animate-fade-in p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    Quản lý Nhân sự (Admin Only)
                </h1>
                <p className="text-slate-600">
                    Trung tâm điều khiển tài khoản: Cấp quyền và giám sát nhật ký hệ thống. Chỉ dành cho Quản trị viên tối cao.
                </p>
            </div>

            <UserManagementTable />
        </div>
    );
}
