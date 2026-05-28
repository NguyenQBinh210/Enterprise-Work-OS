"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { createTask } from "@/actions/task.actions";
import type { TaskStatus } from "./types";

type QuickAddTaskProps = {
  groupId: string;
  status: TaskStatus;
  creatorId?: string;
  onTaskCreated: () => void;
};

export function QuickAddTask({ groupId, status, creatorId, onTaskCreated }: QuickAddTaskProps) {
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
