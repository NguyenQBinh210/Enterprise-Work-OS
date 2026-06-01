import type { COLUMNS } from "./constants";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type CurrentUser = {
  Id: string;
  SystemRole?: string | null;
};

export type TaskAssignee = {
  UserId: string;
  user?: {
    FullName?: string | null;
    Email?: string | null;
    AvatarUrl?: string | null;
  };
};

export type TaskPriority = "HIGH" | "NORMAL" | "LOW";

export type Task = {
  Id: string;
  Title: string;
  Description?: string | null;
  Status: TaskStatus;
  Priority?: TaskPriority | null;
  Deadline?: string | null;
  CreatorId?: string | null;
  Assignees?: TaskAssignee[];
};

export type KanbanColumnConfig = (typeof COLUMNS)[number];
