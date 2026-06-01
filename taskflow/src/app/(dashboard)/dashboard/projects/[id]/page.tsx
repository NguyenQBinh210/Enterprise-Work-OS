import KanbanBoard from "@/components/kanban/KanbanBoard";
import ProjectHeader from "@/components/project/ProjectHeader";
import { getProjectDetailPageData } from "./project-detail.supabase";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params;
  const { currentUser, group, initialTasks } = await getProjectDetailPageData(groupId);

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
