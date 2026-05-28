"use client";

import { createProject } from "@/actions/project.actions";
import { createClient } from "@/lib/supabase/client";

export type ProjectCreator = {
  Id: string;
  SystemRole?: string | null;
};

type LoadProjectCreatorResult = {
  user: ProjectCreator | null;
  redirectTo?: string;
};

type CreateNewProjectParams = {
  name: string;
  description: string;
  creatorId: string;
};

type CreateNewProjectResult = {
  success: boolean;
  projectId?: string;
  error?: string;
};

export async function loadProjectCreator(): Promise<LoadProjectCreatorResult> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return { user: null, redirectTo: "/login" };
  }

  const { data: userData } = await supabase
    .from("Users")
    .select("*")
    .eq("Email", session.user.email)
    .single();

  if (!userData) {
    return { user: null, redirectTo: "/login" };
  }

  const role = userData.SystemRole?.toUpperCase();
  if (role !== "ADMIN" && role !== "MANAGER") {
    return { user: userData, redirectTo: "/dashboard/projects" };
  }

  return { user: userData };
}

export async function createNewProject({
  name,
  description,
  creatorId,
}: CreateNewProjectParams): Promise<CreateNewProjectResult> {
  if (!name.trim()) {
    return { success: false, error: "Vui lòng nhập tên dự án" };
  }

  try {
    const result = await createProject(name, description, creatorId);
    if (result.success) {
      return { success: true, projectId: result.data.Id };
    }

    return { success: false, error: result.message || "Lỗi không xác định khi tạo dự án" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
    return { success: false, error: message };
  }
}
