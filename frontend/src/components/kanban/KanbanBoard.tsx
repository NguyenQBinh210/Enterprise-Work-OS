'use client';

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import TaskCard, { Task } from './TaskCard';

// Initial Mock State
const INITIAL_TASKS: Task[] = [
    { id: '1', title: 'Research competitors', priority: 'high', assignee: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', title: 'Design system architecture', priority: 'high', assignee: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', title: 'Setup CI/CD pipeline', priority: 'medium', assignee: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', title: 'Create login page', priority: 'low', assignee: 'https://i.pravatar.cc/150?u=4' },
    { id: '5', title: 'Write unit tests', priority: 'medium', assignee: 'https://i.pravatar.cc/150?u=5' },
];

type TasksState = {
    [key: string]: Task[];
};

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<TasksState>({
        todo: [INITIAL_TASKS[0], INITIAL_TASKS[1]],
        dropbox: [], // Using 'dropbox' as internal name for 'In Progress' just to demonstrate mapping, but let's stick to standard IDs
        inProgress: [INITIAL_TASKS[2], INITIAL_TASKS[3]],
        done: [INITIAL_TASKS[4]],
    });

    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string): string | undefined => {
        if (id in tasks) return id;
        return Object.keys(tasks).find((key) => tasks[key].find((t) => t.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string) || (overId as string); // In case dropping on empty column

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setTasks((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((t) => t.id === active.id);
            const overIndex = overItems.findIndex((t) => t.id === overId);

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string) || (overId as string);

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = tasks[activeContainer].findIndex((t) => t.id === active.id);
            const overIndex = tasks[overContainer].findIndex((t) => t.id === overId);

            if (activeIndex !== overIndex) {
                setTasks((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
    };

    // Helper to get task by ID for Overlay
    const getTaskById = (id: string) => {
        for (const key in tasks) {
            const task = tasks[key].find(t => t.id === id);
            if (task) return task;
        }
        return null;
    };

    const activeTask = activeId ? getTaskById(activeId) : null;

    return (
        <div className="h-full overflow-x-auto pb-4">
            <DndContext
                id="kanban-board"
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex items-start gap-6 h-full min-h-[500px]">
                    <KanbanColumn id="todo" title="To Do" tasks={tasks['todo']} />
                    <KanbanColumn id="inProgress" title="In Progress" tasks={tasks['inProgress']} />
                    <KanbanColumn id="done" title="Done" tasks={tasks['done']} />
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
