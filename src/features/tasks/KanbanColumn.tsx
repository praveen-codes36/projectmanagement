import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '../../api/types';
import { TaskStatus } from '../../lib/constants';
import { TaskCard } from './TaskCard';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onOpenDetail: (task: Task) => void;
  onOpenCreate?: (status: TaskStatus) => void;
  onMoveStatus?: (taskId: string, newStatus: TaskStatus) => void;
  canCreateTask?: boolean;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  onOpenDetail,
  onOpenCreate,
  onMoveStatus,
  canCreateTask = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const columnConfig = {
    todo: {
      icon: <Circle className="w-3.5 h-3.5 text-status-todo" />,
      borderHighlight: 'border-status-todo/40',
      tagColor: 'text-status-todo',
    },
    in_progress: {
      icon: <Clock className="w-3.5 h-3.5 text-status-inprogress" />,
      borderHighlight: 'border-status-inprogress/40',
      tagColor: 'text-status-inprogress',
    },
    done: {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-status-done" />,
      borderHighlight: 'border-status-done/40',
      tagColor: 'text-status-done',
    },
  };

  const config = columnConfig[status];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-surface-raised/40 border border-border rounded-md min-w-[280px] sm:min-w-[320px] max-w-[380px] flex-1 shrink-0 transition-colors',
        isOver && 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-xs font-semibold text-text uppercase tracking-wider font-mono">
            {title}
          </h3>
          <span className="font-mono text-xs text-text-muted tabular-nums">
            ({tasks.length})
          </span>
        </div>

        {canCreateTask && onOpenCreate && (
          <button
            type="button"
            onClick={() => onOpenCreate(status)}
            aria-label={`Add task to ${title}`}
            className="p-1 text-text-muted hover:text-text rounded-xs hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Column Tasks Container */}
      <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[300px] max-h-[calc(100vh-280px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenDetail={onOpenDetail}
              onMoveStatus={onMoveStatus}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-border/80 rounded-sm flex items-center justify-center text-[11px] text-text-muted/60 select-none">
            Drop waypoint tasks here
          </div>
        )}
      </div>
    </div>
  );
}
