import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task } from '../../api/types';
import { TaskStatus } from '../../lib/constants';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

export interface KanbanBoardProps {
  tasks: Task[];
  onOpenDetail: (task: Task) => void;
  onOpenCreate: (status: TaskStatus) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  canCreateTask?: boolean;
}

export function KanbanBoard({
  tasks,
  onOpenDetail,
  onOpenCreate,
  onUpdateTaskStatus,
  canCreateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement to begin drag, avoiding misclicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    // Identify target status: either directly the column id, or the status of the target task
    let targetStatus: TaskStatus | null = null;

    if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    const sourceTask = tasks.find((t) => t.id === activeTaskId);
    if (sourceTask && sourceTask.status !== targetStatus) {
      onUpdateTaskStatus(activeTaskId, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        <KanbanColumn
          status="todo"
          title="To do"
          tasks={todoTasks}
          onOpenDetail={onOpenDetail}
          onOpenCreate={onOpenCreate}
          onMoveStatus={onUpdateTaskStatus}
          canCreateTask={canCreateTask}
        />

        <KanbanColumn
          status="in_progress"
          title="In progress"
          tasks={inProgressTasks}
          onOpenDetail={onOpenDetail}
          onOpenCreate={onOpenCreate}
          onMoveStatus={onUpdateTaskStatus}
          canCreateTask={canCreateTask}
        />

        <KanbanColumn
          status="done"
          title="Done"
          tasks={doneTasks}
          onOpenDetail={onOpenDetail}
          onOpenCreate={onOpenCreate}
          onMoveStatus={onUpdateTaskStatus}
          canCreateTask={canCreateTask}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl opacity-90 cursor-grabbing">
            <TaskCard
              task={activeTask}
              onOpenDetail={() => {}}
              isDragDisabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
