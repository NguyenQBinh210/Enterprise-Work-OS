"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckCircle2, Clock, GripVertical, MessageSquare } from "lucide-react";
import { AppImage } from "@/shared/components/ui/AppImage";
import type { Task, TaskPriority } from "./types";
import { getDeadlineState } from "./utils";

const priorityConfig: Record<TaskPriority, { bar: string; badge: string; label: string }> = {
  HIGH: {
    bar: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Cao",
  },
  NORMAL: {
    bar: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Thường",
  },
  LOW: {
    bar: "bg-slate-300",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    label: "Thấp",
  },
};

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
  animIdx?: number;
};

export function TaskCard({ task, onClick, isOverlay, animIdx = 0 }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.Id });
  const priority = task.Priority || "NORMAL";
  const pc = priorityConfig[priority];
  const deadline = getDeadlineState(task.Deadline);
  const isDone = task.Status === "DONE";

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        animationDelay: `${animIdx * 45 + 80}ms`,
      }}
      className={`animate-card-entrance group relative cursor-pointer rounded-lg border bg-white p-3.5 transition-all duration-200 ${
        isOverlay
          ? "scale-[1.02] border-blue-300 shadow-xl"
          : "border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md"
      } ${isDone ? "opacity-75" : ""}`}
      onClick={onClick}
    >
      <div className={`absolute bottom-3 left-0 top-3 w-0.5 rounded-full ${pc.bar}`} />

      <div className="mb-2.5 flex items-start justify-between gap-2 pl-2">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${pc.badge}`}>
          {pc.label}
        </span>
        <div
          {...attributes}
          {...listeners}
          className="-mr-1 rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      <h4 className={`mb-1.5 line-clamp-2 pl-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-blue-700 ${isDone ? "text-slate-400 line-through" : ""}`}>
        {task.Title}
      </h4>

      {task.Description && (
        <p className="mb-3 line-clamp-2 pl-2 text-[11px] leading-relaxed text-slate-500">
          {task.Description}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5 pl-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex items-center gap-1 ${deadline.urgent ? (deadline.overdue ? "text-red-500" : "text-amber-600") : "text-slate-400"}`}>
            {deadline.overdue ? <CalendarDays className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            <span className="text-[11px] font-medium">{deadline.label}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <MessageSquare className="h-3 w-3" />
            <span className="text-[10px] font-medium">0</span>
          </div>
        </div>

        <div className="flex shrink-0 -space-x-1.5">
          {task.Assignees?.slice(0, 3).map((assignee) => (
            <div
              key={assignee.UserId}
              title={assignee.user?.FullName || ""}
              className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-600 shadow-sm"
            >
              {assignee.user?.AvatarUrl ? (
                <AppImage src={assignee.user.AvatarUrl} alt={assignee.user.FullName || "Avatar"} fill className="h-full w-full" imageClassName="object-cover" sizes="24px" />
              ) : (
                assignee.user?.FullName?.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {(task.Assignees?.length || 0) > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500 shadow-sm">
              +{(task.Assignees?.length || 0) - 3}
            </div>
          )}
          {(!task.Assignees || task.Assignees.length === 0) && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-[9px] font-semibold text-slate-300" title="Chưa phân công">
              ?
            </div>
          )}
        </div>
      </div>

      {isDone && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
          <CheckCircle2 className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
}
