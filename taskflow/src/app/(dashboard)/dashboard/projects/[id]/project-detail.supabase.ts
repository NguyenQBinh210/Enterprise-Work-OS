import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CurrentUser, Task, TaskAssignee } from "@/features/tasks/components/kanban/types";

type RawTaskAssignee = TaskAssignee & {
  user?: TaskAssignee["user"] & Record<string, unknown>;
};

type RawTask = Task & {
  Assignees?: RawTaskAssignee[];
};

function createProjectServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
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
}

export async function getProjectDetailPageData(groupId: string) {
  const cookieStore = await cookies();
  const supabase = createProjectServerClient(cookieStore);

  let currentUser: CurrentUser | null = null;
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (authUser) {
    const { data: userData } = await supabase
      .from("Users")
      .select("*")
      .eq("Email", authUser.email)
      .single();
    if (userData) currentUser = userData;
  }

  const { data: groupData } = await supabase
    .from("Groups")
    .select("*")
    .eq("Id", groupId)
    .single();

  const group = {
    id: groupId,
    name: groupData?.Name || "Dự án " + groupId,
    description: groupData?.Description || "Chi tiết dự án",
  };

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
    .order("Position", { ascending: true });

  let initialTasks = (rawTasks || []) as RawTask[];
  if (initialTasks.length > 0) {
    const userIds = new Set<string>();
    initialTasks.forEach((task) => {
      task.Assignees?.forEach((assignee) => userIds.add(assignee.UserId));
    });

    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from("UserProfiles")
        .select("UserId, AvatarUrl")
        .in("UserId", Array.from(userIds));

      initialTasks = initialTasks.map((task) => {
        const newAssignees = task.Assignees?.map((assignee) => {
          const profile = profiles?.find((item) => item.UserId === assignee.UserId);
          return {
            ...assignee,
            user: {
              ...assignee.user,
              AvatarUrl: profile?.AvatarUrl || null,
            },
          };
        });
        return { ...task, Assignees: newAssignees };
      });
    }
  }

  return { currentUser, group, initialTasks };
}
