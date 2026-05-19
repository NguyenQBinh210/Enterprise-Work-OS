import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import ProjectHeader from "@/components/project/ProjectHeader";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: groupId } = await params;
    const cookieStore = await cookies();

    // Tạo Supabase Client Server-side
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

    // 1. Lấy thông tin người dùng hiện tại
    let currentUser = null;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
        const { data: userData } = await supabase
            .from("Users")
            .select("*")
            .eq("Email", authUser.email)
            .single();
        if (userData) currentUser = userData;
    }

    // 2. Lấy thông tin dự án thật từ DB
    const { data: groupData } = await supabase
        .from("Groups")
        .select("*")
        .eq("Id", groupId)
        .single();

    const group = {
        id: groupId,
        name: groupData?.Name || "Dự án " + groupId,
        description: groupData?.Description || "Chi tiết dự án"
    };

    // 3. Lấy danh sách Tasks với thông tin Đội ngũ thực hiện (Nhiều người)
    const { data: rawTasks } = await supabase
        .from("Tasks")
        .select(`
            *,
            Assignees:TaskAssignees (
                UserId,
                user:Users (FullName, Email)
            )
        `)
        .eq("GroupId", groupId)
        .eq("IsDeleted", false)
        .order("Position", { ascending: true }); // Sắp xếp theo vị trí FLOAT mới

    let initialTasks = rawTasks || [];
    if (initialTasks.length > 0) {
        const userIds = new Set<string>();
        initialTasks.forEach(task => {
            task.Assignees?.forEach((a: { UserId: string }) => userIds.add(a.UserId));
        });

        if (userIds.size > 0) {
            const { data: profiles } = await supabase
                .from('UserProfiles')
                .select('UserId, AvatarUrl')
                .in('UserId', Array.from(userIds));
            
            initialTasks = initialTasks.map(task => {
                const newAssignees = task.Assignees?.map((a: { UserId: string; user: Record<string, unknown> }) => {
                    const profile = profiles?.find(p => p.UserId === a.UserId);
                    return {
                        ...a,
                        user: {
                            ...a.user,
                            AvatarUrl: profile?.AvatarUrl || null
                        }
                    };
                });
                return { ...task, Assignees: newAssignees };
            });
        }
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col px-3 pt-3 pb-3 max-w-full overflow-hidden bg-slate-50/50 animate-fade-in sm:px-5 sm:pt-5 md:px-6">
            <ProjectHeader group={group} currentUser={currentUser} />

            <div className="flex-1 overflow-hidden mt-3 min-h-0 sm:mt-4">
                <KanbanBoard
                    groupId={groupId}
                    initialTasks={initialTasks || []}
                    currentUser={currentUser}
                />
            </div>
        </div>
    );
}
