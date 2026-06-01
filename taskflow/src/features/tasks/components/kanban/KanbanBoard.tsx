"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { getTasks, updateTaskStatus } from "@/actions/task.actions";
import { getMyProjectRole } from "@/actions/project.actions";
import TaskDetailModal from "@/features/tasks/components/detail/TaskDetailModal";
import { createClient } from "@/shared/lib/supabase/client";
import { COLUMNS } from "./constants";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import type { CurrentUser, Task, TaskStatus } from "./types";

type KanbanBoardProps = {
  groupId: string;
  currentUser: CurrentUser | null;
  initialTasks?: Task[];
};

export default function KanbanBoard({ groupId, currentUser, initialTasks = [] }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");

  const supabase = useMemo(() => createClient(), []);

  const loadTasks = useCallback(async () => {
    const data = await getTasks(groupId);
    setTasks(data as Task[]);
  }, [groupId]);

  useEffect(() => {
    if (currentUser) {
      getMyProjectRole(groupId, currentUser.Id).then((role) => setUserRole(role));
    }

    const channel = supabase
      .channel("kanban-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "Tasks", filter: `GroupId=eq.${groupId}` }, () => loadTasks())
      .on("postgres_changes", { event: "*", schema: "public", table: "TaskAssignees" }, () => loadTasks())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, loadTasks, supabase, currentUser]);

  const isSystemAdmin = currentUser?.SystemRole?.toUpperCase() === "ADMIN";
  const canEdit = isSystemAdmin || userRole !== "VIEWER";
  const canCreate = isSystemAdmin || userRole === "OWNER" || userRole === "MANAGER";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.Id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const isActiveATask = tasks.some((t) => t.Id === activeId);
    const isOverATask = tasks.some((t) => t.Id === overId);
    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.Id === activeId);
        const overIndex = prev.findIndex((t) => t.Id === overId);
        if (prev[activeIndex].Status !== prev[overIndex].Status) {
          const updated = [...prev];
          updated[activeIndex] = { ...updated[activeIndex], Status: prev[overIndex].Status };
          return arrayMove(updated, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    const isOverAColumn = COLUMNS.some((col) => col.id === overId);
    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.Id === activeId);
        const updated = [...prev];
        updated[activeIndex] = { ...updated[activeIndex], Status: overId as TaskStatus };
        return arrayMove(updated, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.Id === active.id);
    if (task) await updateTaskStatus(task.Id, task.Status);
    setActiveTask(null);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="mb-3 flex shrink-0 items-center gap-2 overflow-x-auto px-1 pb-1">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.Status === col.id).length;
          return (
            <div key={col.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-semibold text-slate-800">{count}</span>
              <span className="text-xs font-medium text-slate-500">{col.title}</span>
            </div>
          );
        })}
        <div className="ml-auto hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 md:flex">
          {tasks.length} nhiệm vụ tổng cộng
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => { if (!canEdit) return; handleDragStart(e); }}
        onDragOver={(e) => { if (!canEdit) return; handleDragOver(e); }}
        onDragEnd={(e) => { if (!canEdit) return; handleDragEnd(e); }}
      >
        <div className="flex min-h-0 flex-1 snap-x gap-3 overflow-x-auto overflow-y-hidden px-1 pb-3 md:gap-4">
          {COLUMNS.map((col, colIdx) => (
            <KanbanColumn
              key={col.id}
              col={col}
              colIdx={colIdx}
              tasks={tasks.filter((t) => t.Status === col.id)}
              currentUser={currentUser}
              groupId={groupId}
              onTaskCreated={loadTasks}
              onTaskClick={setSelectedTask}
              canCreate={canCreate}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
          }}
        >
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            groupId={groupId}
            currentUser={currentUser}
            onClose={() => { setSelectedTask(null); loadTasks(); }}
            canEdit={canEdit}
            canCreate={canCreate}
          />
        )}
      </DndContext>
    </div>
  );
}
