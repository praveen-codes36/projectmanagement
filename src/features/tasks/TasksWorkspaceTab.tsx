import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../../api/services/tasks';
import { Task, ProjectMember } from '../../api/types';
import { TaskStatus, UserRole, STATUS_LABELS } from '../../lib/constants';
import { usePermissions } from '../../auth/usePermissions';
import { KanbanBoard } from './KanbanBoard';
import { TasksTableView } from './TasksTableView';
import { TaskCreateDrawer } from './TaskCreateDrawer';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { Button, Input, Select, EmptyState } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface TasksWorkspaceTabProps {
  projectId: string;
  tasks: Task[];
  members: ProjectMember[];
  currentUserRole: UserRole;
}

export function TasksWorkspaceTab({
  projectId,
  tasks,
  members,
  currentUserRole,
}: TasksWorkspaceTabProps) {
  const queryClient = useQueryClient();
  const permissions = usePermissions(currentUserRole);

  // View mode preference stored per project
  const viewStorageKey = `project_camp_task_view_${projectId}`;
  const [viewMode, setViewMode] = useState<'board' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(viewStorageKey);
      if (saved === 'board' || saved === 'table') return saved;
    }
    return 'board';
  });

  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem(viewStorageKey, viewMode);
  }, [viewMode, viewStorageKey]);

  // Optimistic update for task status change
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      tasksService.updateTask(projectId, taskId, { status: newStatus }),
    onMutate: async ({ taskId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', projectId],
          previousTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }

      // If moving to Done, show celebratory waypoint achievement
      if (newStatus === 'done') {
        toast.success('Waypoint reached! Task marked as Done.', {
          icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        });
      }

      return { previousTasks };
    },
    onError: (err: any, _, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error(err.message || 'Failed to update task status. Changes rolled back.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const handleOpenCreateWithStatus = (initialStatus: TaskStatus) => {
    setCreateInitialStatus(initialStatus);
    setCreateDrawerOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (t.assignedTo) return false;
        } else if (t.assignedTo !== assigneeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, search, statusFilter, assigneeFilter]);

  // Keep selectedTask in sync with queries
  const activeDetailTask = useMemo(() => {
    if (!selectedTask) return null;
    return tasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [selectedTask, tasks]);

  return (
    <div className="space-y-4">
      {/* Controls Bar: View Toggle, Search, Filters, Create Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface p-3 border border-border rounded-md shadow-xs">
        {/* Left: View toggle and search */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Segmented Board/Table control */}
          <div className="inline-flex items-center p-1 bg-surface-raised border border-border rounded-sm">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              aria-label="Kanban board view"
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-surface text-text shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table list view"
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-surface text-text shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          {/* Status filter dropdown */}
          <div className="w-32">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'todo', label: 'To do' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'done', label: 'Done' },
              ]}
            />
          </div>

          {/* Assignee filter dropdown */}
          <div className="w-36">
            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.username || m.user.email}
                </option>
              ))}
            </Select>
          </div>

          {/* Density toggle for table view */}
          {viewMode === 'table' && (
            <button
              type="button"
              onClick={() =>
                setDensity((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'))
              }
              className="text-xs px-2.5 py-1 text-text-muted hover:text-text border border-border rounded-xs bg-surface-raised cursor-pointer"
            >
              Density: {density === 'comfortable' ? 'Comfortable' : 'Compact'}
            </button>
          )}
        </div>

        {/* Right: Add Task button */}
        {permissions.canCreateTask && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenCreateWithStatus('todo')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Main View Area */}
      {filteredTasks.length === 0 && tasks.length === 0 ? (
        <EmptyState
          title="No waypoint tasks logged"
          description="Establish your first task waypoint along this expedition route."
          actionLabel={permissions.canCreateTask ? 'Add First Task' : undefined}
          onAction={permissions.canCreateTask ? () => handleOpenCreateWithStatus('todo') : undefined}
        />
      ) : viewMode === 'board' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onOpenDetail={(task) => setSelectedTask(task)}
          onOpenCreate={handleOpenCreateWithStatus}
          onUpdateTaskStatus={(taskId, newStatus) =>
            updateStatusMutation.mutate({ taskId, newStatus })
          }
          canCreateTask={permissions.canCreateTask}
        />
      ) : (
        <TasksTableView
          tasks={filteredTasks}
          onOpenDetail={(task) => setSelectedTask(task)}
          density={density}
        />
      )}

      {/* Create Task Drawer */}
      <TaskCreateDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        projectId={projectId}
        members={members}
        initialStatus={createInitialStatus}
      />

      {/* Detail & Subtasks Drawer */}
      <TaskDetailDrawer
        task={activeDetailTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        projectId={projectId}
        members={members}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
