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
  Circle,
  Loader2,
  CheckCircle2,
  Plus,
  GripVertical,
  MessageSquare,
  Clock,
  CalendarDays,
  Sparkles,
  LayoutGrid,
  Zap,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ── Column Config ────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "TODO",
    title: "Cần làm",
    icon: Circle,
    accent: "from-slate-400 to-slate-500",
    accentLight: "from-slate-50 to-white",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    glow: "hover:shadow-slate-200/80",
    iconBg: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    colIcon: LayoutGrid,
    description: "Chưa bắt đầu",
  },
  {
    id: "IN_PROGRESS",
    title: "Đang tiến hành",
    icon: Loader2,
    accent: "from-indigo-500 to-blue-500",
    accentLight: "from-indigo-50/60 to-blue-50/40",
    badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    glow: "hover:shadow-blue-200/60",
    iconBg: "bg-blue-100 text-blue-600",
    dot: "bg-blue-500",
    colIcon: Zap,
    description: "Đang thực thi",
  },
  {
    id: "DONE",
    title: "Hoàn thành",
    icon: CheckCircle2,
    accent: "from-emerald-500 to-teal-500",
    accentLight: "from-emerald-50/60 to-teal-50/40",
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    glow: "hover:shadow-emerald-200/60",
    iconBg: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-500",
    colIcon: Trophy,
    description: "Đã xong",
  },
];

// ── Deadline Helper ──────────────────────────────────────────────────────────
function getDeadlineState(deadline?: string) {
  if (!deadline) return { label: "Không có hạn", urgent: false, overdue: false, daysLeft: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diff = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `Quá hạn ${Math.abs(diff)}n`, urgent: true, overdue: true, daysLeft: diff };
  if (diff === 0) return { label: "Hôm nay", urgent: true, overdue: false, daysLeft: 0 };
  if (diff <= 2) return { label: `Còn ${diff} ngày`, urgent: true, overdue: false, daysLeft: diff };
  return {
    label: dl.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    urgent: false,
    overdue: false,
    daysLeft: diff,
  };
}

// ── Main Board ───────────────────────────────────────────────────────────────
export default function KanbanBoard({
  groupId,
  currentUser,
  initialTasks = [],
}: {
  groupId: string;
  currentUser: any;
  initialTasks?: any[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("VIEWER");
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

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
    setTasks(data);
  }, [groupId]);

  useEffect(() => {
    setIsMounted(true);
    if (initialTasks.length > 0 && tasks.length === 0) setTasks(initialTasks);

    if (currentUser) {
      setIsSystemAdmin(currentUser.SystemRole?.toUpperCase() === "ADMIN");
      getMyProjectRole(groupId, currentUser.Id).then((role) => setUserRole(role));
    }

    loadTasks();
    const channel = supabase
      .channel("kanban-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "Tasks", filter: `GroupId=eq.${groupId}` }, () => loadTasks())
      .on("postgres_changes", { event: "*", schema: "public", table: "TaskAssignees" }, () => loadTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, initialTasks, loadTasks, supabase, currentUser]);

  const canEdit = isSystemAdmin || userRole !== "VIEWER";
  const canCreate = isSystemAdmin || userRole === "OWNER" || userRole === "MANAGER";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const task = tasks.find((t) => t.Id === event.active.id);
    setActiveTask(task);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = tasks.some((t) => t.Id === activeId);
    const isOverATask = tasks.some((t) => t.Id === overId);
    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const ai = prev.findIndex((t) => t.Id === activeId);
        const oi = prev.findIndex((t) => t.Id === overId);
        if (prev[ai].Status !== prev[oi].Status) {
          const updated = [...prev];
          updated[ai] = { ...updated[ai], Status: prev[oi].Status };
          return arrayMove(updated, ai, oi);
        }
        return arrayMove(prev, ai, oi);
      });
    }

    const isOverAColumn = COLUMNS.some((col) => col.id === overId);
    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const ai = prev.findIndex((t) => t.Id === activeId);
        const updated = [...prev];
        updated[ai] = { ...updated[ai], Status: overId };
        return arrayMove(updated, ai, ai);
      });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((t) => t.Id === active.id);
    if (task) await updateTaskStatus(task.Id, task.Status as any);
    setActiveTask(null);
  };

  // ── Skeleton Loader ──────────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="flex gap-6 h-[calc(100vh-180px)] overflow-hidden px-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col w-[360px] shrink-0 rounded-2xl border border-slate-100 p-4 gap-3 bg-white/70">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded-full w-24 animate-pulse" />
                <div className="h-2 bg-slate-50 rounded-full w-16 animate-pulse" />
              </div>
              <div className="w-7 h-5 bg-slate-100 rounded-full animate-pulse" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-28 bg-slate-50 rounded-xl animate-pulse" style={{ animationDelay: `${j * 80}ms` }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Board Stats Bar */}
      <div className="flex items-center gap-3 px-1 mb-4 flex-shrink-0">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.Status === col.id).length;
          return (
            <div key={col.id} className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="text-xs font-black text-slate-700">{count}</span>
              <span className="text-xs text-slate-400 font-medium">{col.description}</span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
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
        <div className="flex gap-5 overflow-x-auto overflow-y-hidden pb-3 scrollbar-hide px-1" style={{ height: '100%', minHeight: 0 }}>
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

// ── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ col, colIdx, tasks, currentUser, groupId, onTaskCreated, onTaskClick, canEdit, canCreate }: any) {
  const Icon = col.icon;
  const ColIcon = col.colIcon;

  return (
    <div
      className="animate-col-entrance flex flex-col flex-1 min-w-[280px] max-w-[480px] rounded-2xl bg-white border border-slate-100/80 shadow-sm overflow-hidden"
      style={{ animationDelay: `${colIdx * 80}ms` }}
    >
      {/* Gradient Accent Top */}
      <div className={`h-1 w-full bg-gradient-to-r ${col.accent} flex-shrink-0`} />

      {/* Column Header */}
      <div className={`px-5 pt-4 pb-4 bg-gradient-to-b ${col.accentLight}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${col.iconBg} shadow-sm`}>
              <Icon
                className={`w-4.5 h-4.5 ${col.id === "IN_PROGRESS" ? "animate-spin-slow" : ""}`}
                style={{ width: 18, height: 18 }}
              />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm leading-none">{col.title}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{col.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${col.badge}`}>
              {tasks.length}
            </span>
            <ColIcon className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Progress bar */}
        {col.id === "DONE" && tasks.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: "100%" }} />
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Complete</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-4" />

      {/* Cards Scroll Area */}
      <div className="flex-1 overflow-y-auto kanban-scroll p-4 space-y-3 min-h-[100px]" id={col.id}>
        <SortableContext items={tasks.map((t: any) => t.Id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any, i: number) => (
            <TaskCard
              key={task.Id}
              task={task}
              onClick={() => onTaskClick(task)}
              animIdx={i}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300 select-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-300">Chưa có nhiệm vụ</p>
          </div>
        )}
      </div>

      {/* Quick Add */}
      {canCreate && (
        <div className="px-4 pb-4 pt-1">
          <QuickAddTask
            groupId={groupId}
            status={col.id}
            creatorId={currentUser?.Id}
            onTaskCreated={onTaskCreated}
            accentColor={col.accent}
          />
        </div>
      )}
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onClick, isOverlay, animIdx = 0 }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.Id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const priorityConfig: any = {
    HIGH: {
      bar: "bg-red-500",
      badge: "bg-red-50 text-red-600 border-red-200 shadow-red-100",
      label: "Cao",
    },
    NORMAL: {
      bar: "bg-indigo-400",
      badge: "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-indigo-100",
      label: "Bình thường",
    },
    LOW: {
      bar: "bg-slate-300",
      badge: "bg-slate-50 text-slate-500 border-slate-200 shadow-slate-100",
      label: "Thấp",
    },
  };

  const pc = priorityConfig[task.Priority || "NORMAL"];
  const dl = getDeadlineState(task.Deadline);
  const isDone = task.Status === "DONE";

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        animationDelay: `${animIdx * 60 + 100}ms`,
      }}
      className={`animate-card-entrance group relative bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 
        ${isOverlay
          ? "shadow-2xl border-indigo-300 rotate-1 scale-105"
          : `border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5`
        }
        ${isDone ? "opacity-80" : ""}
      `}
      onClick={onClick}
    >
      {/* Priority side bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${pc.bar} opacity-60`} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 pl-2 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${pc.badge}`}>
          {pc.label}
        </span>
        <div
          {...attributes}
          {...listeners}
          className="p-1 -mr-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Title */}
      <h4 className={`font-bold text-sm text-slate-800 leading-snug mb-1.5 pl-2 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-150 ${isDone ? "line-through text-slate-400" : ""}`}>
        {task.Title}
      </h4>

      {/* Description */}
      {task.Description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pl-2 mb-3">
          {task.Description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 pl-2">
        {/* Meta */}
        <div className="flex items-center gap-3">
          {/* Deadline */}
          <div className={`flex items-center gap-1 ${dl.urgent ? (dl.overdue ? "text-red-500" : "text-orange-500") : "text-slate-400"}`}>
            {dl.overdue ? (
              <CalendarDays className={`w-3 h-3 ${dl.urgent ? "animate-deadline-pulse" : ""}`} />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span className={`text-[10px] font-black ${dl.urgent ? "font-black" : "font-medium"}`}>
              {dl.label}
            </span>
          </div>

          {/* Messages */}
          <div className="flex items-center gap-1 text-slate-300">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px] font-medium">0</span>
          </div>
        </div>

        {/* Assignee Avatars */}
        <div className="flex -space-x-1.5">
          {task.Assignees?.slice(0, 3).map((a: any, i: number) => (
            <div
              key={i}
              title={a.user?.FullName}
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm hover:z-10 transition-transform hover:scale-110 overflow-hidden"
            >
              {a.user?.AvatarUrl ? (
                <img src={a.user.AvatarUrl} alt={a.user.FullName} className="w-full h-full object-cover" />
              ) : (
                a.user?.FullName?.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {task.Assignees?.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm">
              +{task.Assignees.length - 3}
            </div>
          )}
          {(!task.Assignees || task.Assignees.length === 0) && (
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center" title="Chưa phân công">
              <span className="text-[9px] text-slate-300 font-black">?</span>
            </div>
          )}
        </div>
      </div>

      {/* DONE checkmark overlay */}
      {isDone && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

// ── Quick Add Task ───────────────────────────────────────────────────────────
function QuickAddTask({ groupId, status, creatorId, onTaskCreated, accentColor }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    try {
      await createTask(groupId, title, creatorId, description, status, deadline);
      onTaskCreated();
      setTitle("");
      setDescription("");
      setDeadline("");
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-2.5 flex items-center justify-center gap-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-dashed border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all duration-200 group"
      >
        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
        Thêm nhiệm vụ
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-indigo-400 rounded-xl p-4 shadow-xl shadow-indigo-500/10 animate-card-entrance space-y-3">
      <div>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
          Tiêu đề *
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setIsAdding(false); }}
          placeholder="Tên nhiệm vụ..."
          className="w-full text-sm text-slate-900 font-semibold placeholder:text-slate-300 bg-transparent border-none outline-none p-0"
        />
      </div>

      <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mô tả</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả..."
            className="w-full text-xs text-slate-700 placeholder:text-slate-300 bg-transparent border-none outline-none p-0 font-medium"
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Hạn chót</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full text-[10px] bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setIsAdding(false)}
          className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
        >
          Hủy
        </button>
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="flex-[2] py-2 text-xs font-black text-white rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-md shadow-indigo-500/20"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" />Tạo thẻ</>}
        </button>
      </div>
    </div>
  );
}

// Re-export for DragOverlay
const CheckCircle2Icon = CheckCircle2;
