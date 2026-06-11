"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { CurrentUser, KanbanColumnConfig, Task } from "./types";
import { QuickAddTask } from "./QuickAddTask";
import { TaskCard } from "./TaskCard";

type KanbanColumnProps = {
  col: KanbanColumnConfig;
  colIdx: number;
  tasks: Task[];
  currentUser: CurrentUser | null;
  groupId: string;
  onTaskCreated: () => void;
  onTaskClick: (task: Task) => void;
  canCreate: boolean;
};

export function KanbanColumn({
  col,
  colIdx,
  tasks,
  currentUser,
  groupId,
  onTaskCreated,
  onTaskClick,
  canCreate,
}: KanbanColumnProps) {
  const Icon = col.icon;
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      className="animate-col-entrance flex w-[86vw] max-w-[380px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:w-[31%] md:min-w-[300px] md:max-w-none"
      style={{ animationDelay: `${colIdx * 60}ms` }}
    >
      <div className={`h-1 w-full ${col.accent}`} />

      <div className={`border-b border-slate-200 px-4 py-3 ${col.surface}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${col.iconBg}`}>
              <Icon
                className={col.id === "IN_PROGRESS" ? "h-[18px] w-[18px] animate-spin-slow" : "h-[18px] w-[18px]"}
              />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-tight text-slate-900">{col.title}</h3>
              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{col.description}</p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${col.badge}`}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        className={`kanban-scroll min-h-[120px] flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3 transition-colors ${
          isOver ? "bg-blue-50/80" : ""
        }`}
        id={col.id}
      >
        <SortableContext items={tasks.map((t) => t.Id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.Id}
              task={task}
              onClick={() => onTaskClick(task)}
              animIdx={i}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-slate-400">
            <Icon className="mb-3 h-5 w-5 text-slate-300" />
            <p className="text-xs font-medium">Chưa có nhiệm vụ</p>
          </div>
        )}
      </div>

      {canCreate && (
        <div className="border-t border-slate-200 bg-white p-3">
          <QuickAddTask
            groupId={groupId}
            status={col.id}
            creatorId={currentUser?.Id}
            onTaskCreated={onTaskCreated}
          />
        </div>
      )}
    </div>
  );
}
