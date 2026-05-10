"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, onOpenDetail }: { task: any, onOpenDetail: (task: any) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.Id,
    data: {
      type: "Task",
      task,
      status: task.Status,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-blue-400 opacity-40 h-[120px]"
      />
    );
  }

  // Danh sách những người thực hiện (Multiple Assignees)
  const assignees = task.TaskAssignees || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 group transition-all animate-fade-in relative"
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider
            ${task.Priority === "HIGH" ? "bg-red-500 text-white" :
              task.Priority === "MEDIUM" ? "bg-amber-400 text-white" :
              "bg-blue-500 text-white"}`}
        >
          {task.Priority || "NORMAL"}
        </span>
        
        {/* Tay cầm kéo thả */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Vùng nhấn để mở chi tiết */}
      <div 
        onClick={() => onOpenDetail(task)}
        className="cursor-pointer"
      >
        <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
          {task.Title}
        </h4>

        {task.Description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {task.Description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
          {/* Nhóm Avatar người thực hiện */}
          <div className="flex -space-x-2 overflow-hidden">
            {assignees.length > 0 ? (
                assignees.slice(0, 3).map((a: any, i: number) => (
                    <div 
                        key={i} 
                        className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold border-2 border-white flex items-center justify-center shadow-sm"
                        title={a.user?.FullName}
                    >
                        {a.user?.FullName?.charAt(0)}
                    </div>
                ))
            ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                    ?
                </div>
            )}
            {assignees.length > 3 && (
                <div className="inline-block w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold border-2 border-white flex items-center justify-center">
                    +{assignees.length - 3}
                </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400">
              <span className="text-[10px] font-medium font-mono">
                  {task.CreatedAt ? new Date(task.CreatedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : ""}
              </span>
          </div>
        </div>
      </div>
    </div>
  );
}
