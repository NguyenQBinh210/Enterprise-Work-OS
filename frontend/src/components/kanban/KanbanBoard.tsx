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
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createTask, getTasks, updateTaskStatus } from "@/actions/task.actions";
import { getMyProjectRole } from "@/actions/project.actions";
import TaskDetailModal from "./TaskDetailModal";
import { createBrowserClient } from "@supabase/ssr";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  GripVertical,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type CurrentUser = {
  Id: string;
  SystemRole?: string | null;
};

type TaskAssignee = {
  UserId: string;
  user?: {
    FullName?: string | null;
    Email?: string | null;
    AvatarUrl?: string | null;
  };
};

type Task = {
  Id: string;
  Title: string;
  Description?: string | null;
  Status: TaskStatus;
  Priority?: "HIGH" | "NORMAL" | "LOW" | null;
  Deadline?: string | null;
  CreatorId?: string | null;
  Assignees?: TaskAssignee[];
};

const COLUMNS = [
  {
    id: "TODO",
    title: "Cần làm",
    icon: Circle,
    accent: "bg-slate-400",
    surface: "bg-slate-50",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    iconBg: "bg-white text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
    description: "Chưa bắt đầu",
  },
  {
    id: "IN_PROGRESS",
    title: "Đang tiến hành",
    icon: Loader2,
    accent: "bg-blue-500",
    surface: "bg-blue-50/60",
    badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    iconBg: "bg-white text-blue-600 ring-1 ring-blue-200",
    dot: "bg-blue-500",
    description: "Đang thực thi",
  },
  {
    id: "DONE",
    title: "Hoàn thành",
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    surface: "bg-emerald-50/60",
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    iconBg: "bg-white text-emerald-600 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    description: "Đã xong",
  },
] as const;

function getDeadlineState(deadline?: string | null) {
  if (!deadline) return { label: "Không có hạn", urgent: false, overdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diff = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: `Quá hạn ${Math.abs(diff)}n`, urgent: true, overdue: true };
  if (diff === 0) return { label: "Hôm nay", urgent: true, overdue: false };
  if (diff <= 2) return { label: `Còn ${diff} ngày`, urgent: true, overdue: false };

  return {
    label: dl.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    urgent: false,
    overdue: false,
  };
}

export default function KanbanBoard({
  groupId,
  currentUser,
  initialTasks = [],
}: {
  groupId: string;
  currentUser: CurrentUser | null;
  initialTasks?: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const loadTasks = useCallback(async () => {
    const data = await getTasks(groupId);
    setTasks(data as Task[]);
  }, [groupId]);

  useEffect(() => {
    if (currentUser) {
      getMyProjectRole(groupId, currentUser.Id).then((role) => setUserRole(role));
    }

    void Promise.resolve().then(loadTasks);
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
              canEdit={canEdit}
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

function KanbanColumn({
  col,
  colIdx,
  tasks,
  currentUser,
  groupId,
  onTaskCreated,
  onTaskClick,
  canCreate,
}: {
  col: (typeof COLUMNS)[number];
  colIdx: number;
  tasks: Task[];
  currentUser: CurrentUser | null;
  groupId: string;
  onTaskCreated: () => void;
  onTaskClick: (task: Task) => void;
  canEdit: boolean;
  canCreate: boolean;
}) {
  const Icon = col.icon;

  return (
    <div
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

      <div className="kanban-scroll min-h-[120px] flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3" id={col.id}>
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

function TaskCard({
  task,
  onClick,
  isOverlay,
  animIdx = 0,
}: {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
  animIdx?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.Id });

  const priorityConfig = {
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
                <img src={assignee.user.AvatarUrl} alt={assignee.user.FullName || "Avatar"} className="h-full w-full object-cover" />
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

function QuickAddTask({
  groupId,
  status,
  creatorId,
  onTaskCreated,
}: {
  groupId: string;
  status: TaskStatus;
  creatorId?: string;
  onTaskCreated: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || loading || !creatorId) return;
    setLoading(true);
    try {
      await createTask(groupId, title, creatorId, description, status, deadline);
      onTaskCreated();
      setTitle("");
      setDescription("");
      setDeadline("");
      setIsAdding(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm nhiệm vụ
      </button>
    );
  }

  return (
    <div className="animate-card-entrance space-y-3 rounded-lg border border-blue-300 bg-white p-3 shadow-md shadow-blue-500/10">
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase text-slate-400">
          Tiêu đề *
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setIsAdding(false);
          }}
          placeholder="Tên nhiệm vụ..."
          className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase text-slate-400">Mô tả</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả..."
            className="w-full border-none bg-transparent p-0 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-300"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase text-slate-400">Hạn chót</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-400/20"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setIsAdding(false)}
          className="flex-1 rounded-md py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700"
        >
          Hủy
        </button>
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="flex-[2] rounded-md bg-blue-600 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
        >
          {loading ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : "Tạo thẻ"}
        </button>
      </div>
    </div>
  );
}
