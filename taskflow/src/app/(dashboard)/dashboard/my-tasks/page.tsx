import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import MyTasksClient from "@/components/tasks/MyTasksClient";
import { getMyTasks } from "@/actions/task.actions";

export default async function MyTasksPage() {
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
    
    // Lấy ID người dùng từ Email
    const { data: userData } = await supabase
        .from('Users')
        .select('*')
        .eq('Email', session?.user?.email)
        .single();

    if (!userData) return <div className="p-10 text-slate-500">Vui lòng đăng nhập lại.</div>;

    const tasks = await getMyTasks(userData.Id);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Công việc của tôi</h1>
                <p className="text-slate-500 mt-2 font-medium">Trung tâm điều hành cá nhân: Quản lý, theo dõi và hoàn thành nhiệm vụ được giao.</p>
            </div>
            
            <MyTasksClient initialTasks={tasks} currentUser={userData} />
        </div>
    );
}
