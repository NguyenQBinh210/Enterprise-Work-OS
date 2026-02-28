'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard, { Task } from './TaskCard';
import { useMemo } from 'react';

interface KanbanColumnProps {
    id: string; // 'todo', 'in-progress', 'done'
    title: string;
    tasks: Task[];
}

export default function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
            id,
        },
        disabled: true, // Disable dragging the column itself for now
    });

    return (
        <div
            ref={setNodeRef}
            className="bg-slate-50 flex flex-col w-[350px] min-w-[350px] rounded-xl border border-slate-200 h-full max-h-full"
        >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700">{title}</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Task List */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
                <SortableContext items={taskIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
}
