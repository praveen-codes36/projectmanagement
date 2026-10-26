import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../api/types';
import { TaskStatus, STATUS_LABELS } from '../../lib/constants';
import { Avatar, Menu } from '../../components/ui';
import {
  CheckSquare,
  Paperclip,
  GripVertical,
  MoreVertical,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TaskCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  onMoveStatus?: (taskId: string, newStatus: TaskStatus) => void;
  isDragDisabled?: boolean;
}

export function TaskCard({
  task,
  onOpenDetail,
  onMoveStatus,
  isDragDisabled = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const attachmentCount = task.attachments?.length || 0;

  const moveMenuOptions: Array<any> = [
    {
      id: 'move-todo',
      label: 'Move to To do',
      disabled: task.status === 'todo',
      onClick: () => onMoveStatus?.(task.id, 'todo'),
    },
    {
      id: 'move-inprogress',
      label: 'Move to In progress',
      disabled: task.status === 'in_progress',
      onClick: () => onMoveStatus?.(task.id, 'in_progress'),
    },
    {
      id: 'move-done',
      label: 'Move to Done',
      disabled: task.status === 'done',
      onClick: () => onMoveStatus?.(task.id, 'done'),
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-surface border border-border rounded-sm p-3.5 shadow-xs transition-shadow',
        'hover:border-primary/50 hover:shadow-sm',
        isDragging && 'opacity-40 shadow-lg border-primary scale-[1.02] z-50 ring-2 ring-primary/20'
      )}
    >
      {/* Top Bar inside card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 -ml-1 text-text-muted/40 group-hover:text-text-muted">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag task handle"
            className="cursor-grab active:cursor-grabbing p-0.5 rounded-xs hover:bg-surface-raised"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3
          onClick={() => onOpenDetail(task)}
          className="flex-1 font-semibold text-xs text-text hover:text-primary cursor-pointer line-clamp-2 leading-snug"
        >
          {task.title}
        </h3>

        {/* Keyboard Move & Options Menu */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <Menu
            trigger={
              <button
                type="button"
                aria-label="Task options"
                className="p-1 text-text-muted hover:text-text rounded-xs hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            }
            items={moveMenuOptions}
          />
        </div>
      </div>

      {/* Description Excerpt */}
      {task.description && (
        <p
          onClick={() => onOpenDetail(task)}
          className="mt-2 text-[11px] text-text-muted line-clamp-2 cursor-pointer leading-relaxed"
        >
          {task.description}
        </p>
      )}

      {/* Footer Info: Subtasks, Attachments & Assignee */}
      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-3">
          {totalSubtasks > 0 && (
            <span
              className={cn(
                'flex items-center gap-1 font-mono tabular-nums',
                completedSubtasks === totalSubtasks && 'text-status-done font-medium'
              )}
            >
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {attachmentCount > 0 && (
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Paperclip className="w-3 h-3" />
              <span>{attachmentCount}</span>
            </span>
          )}
        </div>

        <div>
          {task.assigneeUser ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assigneeUser.username}`}>
              <Avatar nameOrEmail={task.assigneeUser.username} size="xs" />
            </div>
          ) : (
            <span className="text-[10px] text-text-muted/60">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
