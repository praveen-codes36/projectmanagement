import { Task } from '../../api/types';
import { StatusBadge, Avatar } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { CheckSquare, Paperclip } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TasksTableViewProps {
  tasks: Task[];
  onOpenDetail: (task: Task) => void;
  density?: 'comfortable' | 'compact';
}

export function TasksTableView({
  tasks,
  onOpenDetail,
  density = 'comfortable',
}: TasksTableViewProps) {
  const isCompact = density === 'compact';

  return (
    <div className="w-full border border-border rounded-md overflow-x-auto bg-surface shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-raised/60 text-text-muted font-semibold">
            <th className={cn('whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
              Task Title
            </th>
            <th className={cn('whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
              Status
            </th>
            <th className={cn('whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
              Assignee
            </th>
            <th className={cn('whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
              Subtasks
            </th>
            <th className={cn('whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
              Files
            </th>
            <th
              className={cn(
                'whitespace-nowrap text-right',
                isCompact ? 'px-3 py-2' : 'px-4 py-3'
              )}
            >
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-xs text-text-muted">
                No waypoint tasks match the active filters.
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const totalSub = task.subtasks?.length || 0;
              const completedSub = task.subtasks?.filter((s) => s.isCompleted).length || 0;
              const attCount = task.attachments?.length || 0;

              return (
                <tr
                  key={task.id}
                  onClick={() => onOpenDetail(task)}
                  className="hover:bg-surface-raised/50 transition-colors cursor-pointer group"
                >
                  <td className={cn('align-middle font-medium', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    <span className="text-text group-hover:text-primary transition-colors line-clamp-1">
                      {task.title}
                    </span>
                  </td>

                  <td className={cn('align-middle whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    <StatusBadge status={task.status} />
                  </td>

                  <td className={cn('align-middle whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    {task.assigneeUser ? (
                      <div className="flex items-center gap-2">
                        <Avatar nameOrEmail={task.assigneeUser.username} size="xs" />
                        <span className="truncate">{task.assigneeUser.username}</span>
                      </div>
                    ) : (
                      <span className="text-text-muted/60">—</span>
                    )}
                  </td>

                  <td className={cn('align-middle font-mono tabular-nums whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    {totalSub > 0 ? (
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>
                          {completedSub}/{totalSub}
                        </span>
                      </span>
                    ) : (
                      <span className="text-text-muted/60">—</span>
                    )}
                  </td>

                  <td className={cn('align-middle font-mono tabular-nums whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    {attCount > 0 ? (
                      <span className="flex items-center gap-1 text-text-muted">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{attCount}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted/60">—</span>
                    )}
                  </td>

                  <td className={cn('align-middle font-mono text-text-muted text-right whitespace-nowrap', isCompact ? 'px-3 py-2' : 'px-4 py-3')}>
                    {formatDate(task.updatedAt)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
