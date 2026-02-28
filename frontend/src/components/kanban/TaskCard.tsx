'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    assignee: string; // URL to avatar
}

interface TaskCardProps {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 rounded-lg border-2 border-blue-500 shadow-xl opacity-50 cursor-grab rotate-2 h-[120px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing group touch-none"
        >
            <div className="flex items-start justify-between mb-2">
                <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
            ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'}`}
                >
                    {task.priority}
                </span>
                <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </div>

            <h4 className="text-sm font-medium text-slate-800 mb-3 leading-snug">
                {task.title}
            </h4>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    2
                </div>
                <img
                    src={task.assignee}
                    alt="Assignee"
                    className="w-6 h-6 rounded-full ring-2 ring-white"
                />
            </div>
        </div>
    );
}
