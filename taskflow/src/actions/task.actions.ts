"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createNotification } from "./notification.actions";

async function getSupabase() {
  const cookieStore = await cookies();
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

type TaskAssignmentNotificationRow = {
  Title: string | null;
  Status: string | null;
  GroupId: string | null;
  Project?: { Name?: string | null } | { Name?: string | null }[] | null;
};

type TaskStatusUpdate = {
  Status: string;
  Position?: number;
};

type TaskAssigneeRow = {
  UserId: string;
  user?: {
    FullName?: string | null;
    Email?: string | null;
    AvatarUrl?: string | null;
  } | null;
};

type TaskWithAssignees = Record<string, unknown> & {
  Assignees?: TaskAssigneeRow[] | null;
};

type UserProfileRow = {
  UserId: string;
  AvatarUrl: string | null;
};

async function getCurrentUserId() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabase
    .from("Users")
    .select("Id")
    .eq("Email", user.email)
    .maybeSingle();

  return data?.Id ?? null;
}

function getProjectName(project: TaskAssignmentNotificationRow["Project"]) {
  if (Array.isArray(project)) return project[0]?.Name || null;
  return project?.Name || null;
}

// Cập nhật trạng thái và vị trí task (Hỗ trợ Fractional Indexing)
export async function updateTaskStatus(taskId: string, newStatus: string, newPosition?: number) {
  const supabase = await getSupabase();
  const updateData: TaskStatusUpdate = { Status: newStatus };
  if (newPosition !== undefined) {
    updateData.Position = newPosition;
  }

  const { error } = await supabase
    .from("Tasks")
    .update(updateData)
    .eq("Id", taskId);

  if (error) {
    console.error("Lỗi update task:", error);
    throw new Error(error.message);
  }
}

// Cập nhật thông tin chung (Tiêu đề, Mô tả)
export async function updateTask(taskId: string, title: string, description: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Tasks")
    .update({ Title: title, Description: description })
    .eq("Id", taskId);

  if (error) {
    console.error("Lỗi cập nhật task:", error);
    throw new Error(error.message);
  }
}



// Thêm người thực hiện
export async function addTaskAssignee(taskId: string, userId: string) {
  const supabase = await getSupabase();
  
  // 1. Thêm assignee
  const { error } = await supabase
    .from("TaskAssignees")
    .insert({ TaskId: taskId, UserId: userId });

  if (error) {
    console.error("Lỗi thêm người thực hiện:", error);
    throw new Error(error.message);
  }

  // 2. Tự động chuyển trạng thái sang IN_PROGRESS nếu đang là TODO
  const { data: taskData } = await supabase
    .from("Tasks")
    .select("Title, Status, GroupId, Project:GroupId(Name)")
    .eq("Id", taskId)
    .maybeSingle();
  const task = taskData as unknown as TaskAssignmentNotificationRow | null;

  if (task?.Status === "TODO") {
    await supabase.from("Tasks").update({ Status: "IN_PROGRESS" }).eq("Id", taskId);
  }

  const projectName = getProjectName(task?.Project);
  const taskTitle = task?.Title || "một nhiệm vụ";
  const projectText = projectName ? ` trong dự án "${projectName}"` : "";

  await createNotification({
    userId,
    message: `Bạn đã được giao nhiệm vụ "${taskTitle}"${projectText}.`,
    type: "TASK_ASSIGNED",
    taskId,
    groupId: task?.GroupId ?? null,
    actorId: await getCurrentUserId(),
    link: task?.GroupId ? `/dashboard/projects/${task.GroupId}` : "/dashboard/my-tasks",
  });
}

// Xóa người thực hiện nhiệm vụ
export async function removeTaskAssignee(taskId: string, userId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("TaskAssignees")
    .delete()
    .eq("TaskId", taskId)
    .eq("UserId", userId);

  if (error) {
    console.error("Lỗi xóa người thực hiện:", error);
    throw new Error(error.message);
  }
}

// Lấy danh sách những người đang thực hiện nhiệm vụ
export async function getTaskAssignees(taskId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("TaskAssignees")
    .select(`
      UserId,
      user:Users(Id, FullName, Email)
    `)
    .eq("TaskId", taskId);

  if (error) {
    console.error("Lỗi lấy danh sách người thực hiện:", error);
    return [];
  }
  return data;
}

// Lấy tin nhắn của task
export async function getTaskMessages(taskId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("TaskMessages")
    .select("*, Sender:SenderId(FullName, Email, Id)")
    .eq("TaskId", taskId)
    .order("CreatedAt", { ascending: true });

  if (error) {
    console.error("Lỗi lấy TaskMessages:", error);
    return [];
  }

  if (data && data.length > 0) {
    const senderIds = [...new Set(data.map(m => m.SenderId))];
    const { data: profiles } = await supabase
        .from('UserProfiles')
        .select('UserId, AvatarUrl')
        .in('UserId', senderIds);
    
    return data.map(m => {
        const profile = profiles?.find(p => p.UserId === m.SenderId);
        return {
            ...m,
            Sender: {
                ...m.Sender,
                AvatarUrl: profile?.AvatarUrl || null
            }
        };
    });
  }

  return [];
}

// Gửi tin nhắn vào task
export async function addTaskMessage(taskId: string, senderId: string, content: string) {
  const supabase = await getSupabase();
  const msgId = "msg_" + Math.random().toString(36).substring(2, 10);

  const { data, error } = await supabase
    .from("TaskMessages")
    .insert({
      Id: msgId,
      TaskId: taskId,
      SenderId: senderId,
      Content: content,
    })
    .select("*, Sender:SenderId(FullName, Email, Id)")
    .single();

  if (error) {
    console.error("Lỗi gửi TaskMessage:", error);
    throw new Error(error.message);
  }

  // Fetch avatar for the sender
  if (data) {
    const { data: profile } = await supabase
        .from('UserProfiles')
        .select('AvatarUrl')
        .eq('UserId', senderId)
        .maybeSingle();
    
    return {
        ...data,
        Sender: {
            ...data.Sender,
            AvatarUrl: profile?.AvatarUrl || null
        }
    };
  }

  return data;
}

// Cập nhật tin nhắn
export async function updateTaskMessage(messageId: string, content: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("TaskMessages")
    .update({ Content: content })
    .eq("Id", messageId);

  if (error) {
    console.error("Lỗi cập nhật tin nhắn:", error);
    throw new Error(error.message);
  }
}

// Xóa tin nhắn
export async function deleteTaskMessage(messageId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("TaskMessages")
    .delete()
    .eq("Id", messageId);

  if (error) {
    console.error("Lỗi xóa tin nhắn:", error);
    throw new Error(error.message);
  }
}

// Tạo task mới
export async function createTask(groupId: string, title: string, creatorId: string, description?: string, status?: string, deadline?: string) {
  const supabase = await getSupabase();
  const taskId = "task_" + Math.random().toString(36).substring(2, 10);

  // Mặc định Position là thời gian hiện tại (giây) để nó nằm cuối danh sách
  const position = Date.now() / 1000;

  const { data, error } = await supabase
    .from("Tasks")
    .insert({
      Id: taskId,
      GroupId: groupId,
      Title: title,
      Description: description || null,
      Status: status || "TODO",
      CreatorId: creatorId,
      Position: position,
      Deadline: deadline || null
    })
    .select("*")
    .single();

  if (error) {
    console.error("Lỗi tạo task:", error);
    throw new Error(error.message);
  }
  return data;
}


// Xóa mềm task
export async function deleteTask(taskId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Tasks")
    .delete()
    .eq("Id", taskId);

  if (error) {
    console.error("Lỗi xóa task:", error);
    throw new Error(error.message);
  }
}

// Lấy task cá nhân (được giao)
export async function getMyTasks(userId: string) {
  const supabase = await getSupabase();
  
  // Lấy danh sách ID các task mà user được assign
  const { data: assignments } = await supabase
    .from("TaskAssignees")
    .select("TaskId")
    .eq("UserId", userId);

  const taskIds = assignments?.map(a => a.TaskId) || [];

  const { data, error } = await supabase
    .from("Tasks")
    .select("*, Project:GroupId(Name)")
    .in("Id", taskIds)
    .order("CreatedAt", { ascending: false });

  if (error) {
    console.error("Lỗi lấy task cá nhân:", error);
    return [];
  }
  return data || [];
}

// Hoàn thành nhanh task
export async function completeTask(taskId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("Tasks")
    .update({ Status: "DONE" })
    .eq("Id", taskId);

  if (error) {
    console.error("Lỗi hoàn thành task:", error);
    return { success: false };
  }
  return { success: true };
}

// Lấy danh sách task kèm người thực hiện
export async function getTasks(groupId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("Tasks")
    .select(`
      *,
      Assignees:TaskAssignees(
        UserId,
        user:Users(FullName, Email)
      )
    `)
    .eq("GroupId", groupId)
    .eq("IsDeleted", false)
    .order("Position", { ascending: true });

  if (error) {
    console.error("Lỗi lấy danh sách task:", error);
    return [];
  }

  if (data && data.length > 0) {
    const tasks = data as unknown as TaskWithAssignees[];
    const userIds = new Set<string>();
    tasks.forEach(task => {
        task.Assignees?.forEach((a) => userIds.add(a.UserId));
    });

    if (userIds.size > 0) {
        const { data: profiles } = await supabase
            .from('UserProfiles')
            .select('UserId, AvatarUrl')
            .in('UserId', Array.from(userIds));
        const profileRows = (profiles || []) as UserProfileRow[];
        
        return tasks.map(task => {
            const newAssignees = task.Assignees?.map((a) => {
                const profile = profileRows.find((p) => p.UserId === a.UserId);
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

  return data || [];
}
