import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../../api/services/tasks';
import { Task, ProjectMember, Subtask } from '../../api/types';
import { TaskStatus, UserRole } from '../../lib/constants';
import { usePermissions } from '../../auth/usePermissions';
import {
  Drawer,
  Button,
  Input,
  Select,
  Dialog,
  StatusBadge,
  Avatar,
  Tooltip,
} from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { formatBytes, formatDate } from '../../lib/utils';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Paperclip,
  Download,
  File,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  currentUserRole: UserRole;
}

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  projectId,
  members,
  currentUserRole,
}: TaskDetailDrawerProps) {
  const queryClient = useQueryClient();
  const permissions = usePermissions(currentUserRole);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setAssignedTo(task.assignedTo || '');
      setNewSubtaskTitle('');
    }
  }, [task]);

  // Update task core metadata
  const updateTaskMutation = useMutation({
    mutationFn: (updates: {
      title?: string;
      description?: string;
      assignedTo?: string | null;
      status?: TaskStatus;
      attachments?: File[];
    }) => {
      if (!task) throw new Error('Task not found');
      return tasksService.updateTask(projectId, task.id, updates);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update task.');
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: () => {
      if (!task) throw new Error('Task not found');
      return tasksService.deleteTask(projectId, task.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task removed from route.');
      setDeleteConfirmOpen(false);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete task.');
    },
  });

  // Subtask mutations
  const createSubtaskMutation = useMutation({
    mutationFn: (stTitle: string) => {
      if (!task) throw new Error('Task not found');
      return tasksService.createSubtask(projectId, task.id, stTitle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setNewSubtaskTitle('');
      toast.success('Subtask waypoint added.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add subtask.');
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subTaskId, isCompleted, title }: { subTaskId: string; isCompleted: boolean; title?: string }) => {
      return tasksService.updateSubtask(projectId, subTaskId, { isCompleted, title });
    },
    onMutate: async ({ subTaskId, isCompleted }) => {
      // Optimistic update for subtask toggle
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      if (previousTasks && task) {
        queryClient.setQueryData<Task[]>(
          ['tasks', projectId],
          previousTasks.map((t) => {
            if (t.id === task.id) {
              return {
                ...t,
                subtasks: t.subtasks.map((st) =>
                  st.id === subTaskId ? { ...st, isCompleted } : st
                ),
              };
            }
            return t;
          })
        );
      }
      return { previousTasks };
    },
    onError: (_, __, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      toast.error('Failed to update subtask.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subTaskId: string) => tasksService.deleteSubtask(projectId, subTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Subtask removed.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove subtask.');
    },
  });

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    createSubtaskMutation.mutate(newSubtaskTitle.trim());
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    updateTaskMutation.mutate({ attachments: files });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    updateTaskMutation.mutate({ status: newStatus });
  };

  const handleAssigneeChange = (newAssignee: string) => {
    setAssignedTo(newAssignee);
    updateTaskMutation.mutate({ assignedTo: newAssignee || null });
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }
    updateTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  if (!task) return null;

  // Derive subtask count
  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.isCompleted).length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`Task ID: ${task.id} · Logged ${formatDate(task.createdAt)}`}
      width="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {permissions.canDeleteTask && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Status and Assignee Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border rounded-md bg-surface-raised/30">
          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1.5 select-none">
              Status Progression
            </label>
            <Select
              value={status}
              disabled={!permissions.canEditTask || updateTaskMutation.isPending}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              options={[
                { value: 'todo', label: 'To do (Waypoint)' },
                { value: 'in_progress', label: 'In progress (Ascent)' },
                { value: 'done', label: 'Done (Summit)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1.5 select-none">
              Assigned Specialist
            </label>
            <Select
              value={assignedTo}
              disabled={!permissions.canEditTask || updateTaskMutation.isPending}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.username || m.user.email}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Title and Description Form */}
        <form onSubmit={handleSaveDetails} className="space-y-3">
          <Input
            label="Title"
            value={title}
            disabled={!permissions.canEditTask}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-text select-none">
              Description & Route Details
            </label>
            <textarea
              rows={4}
              value={description}
              disabled={!permissions.canEditTask}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific objectives and field conditions..."
              className="w-full p-3 text-xs bg-surface text-text rounded-sm border border-border placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-accent resize-y font-sans leading-relaxed disabled:opacity-75 disabled:bg-surface-raised"
            />
          </div>

          {permissions.canEditTask && (title !== task.title || description !== (task.description || '')) && (
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateTaskMutation.isPending}
              >
                Save Details
              </Button>
            </div>
          )}
        </form>

        {/* Subtasks Section */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-text">Subtask Waypoints</h3>
              <span className="font-mono text-text-muted tabular-nums">
                ({completedCount}/{subtasks.length})
              </span>
            </div>
          </div>

          {/* Add Subtask Input (Admin and Project Admin) */}
          {permissions.canCreateSubtask ? (
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 h-8 px-3 text-xs bg-surface text-text rounded-xs border border-border placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-accent"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!newSubtaskTitle.trim() || createSubtaskMutation.isPending}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add
              </Button>
            </form>
          ) : (
            <p className="text-[11px] text-text-muted">
              Only project admins can add new subtask steps. Members may check off completion.
            </p>
          )}

          {/* Subtask Checkbox List */}
          <div className="space-y-1.5 divide-y divide-border/40">
            {subtasks.length === 0 ? (
              <p className="text-xs text-text-muted/60 py-2">No subtasks established yet.</p>
            ) : (
              subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between py-2 group text-xs"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={(e) =>
                        toggleSubtaskMutation.mutate({
                          subTaskId: st.id,
                          isCompleted: e.target.checked,
                          title: st.title,
                        })
                      }
                      className="rounded-xs text-primary focus:ring-accent cursor-pointer w-4 h-4"
                    />
                    <span
                      className={cn(
                        'text-text transition-colors',
                        st.isCompleted && 'line-through text-text-muted'
                      )}
                    >
                      {st.title}
                    </span>
                  </label>

                  {permissions.canDeleteSubtask && (
                    <button
                      type="button"
                      onClick={() => deleteSubtaskMutation.mutate(st.id)}
                      aria-label="Remove subtask"
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger p-1 rounded-xs transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-text">Attachments</h3>
              <span className="font-mono text-text-muted tabular-nums">
                ({task.attachments?.length || 0})
              </span>
            </div>

            {permissions.canEditTask && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Paperclip className="w-3.5 h-3.5" />}
                >
                  Attach File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleAddFiles}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            {!task.attachments || task.attachments.length === 0 ? (
              <p className="text-xs text-text-muted/60">No files attached to this waypoint.</p>
            ) : (
              task.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-surface-raised border border-border rounded-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="truncate text-text font-medium">{file.name}</span>
                    {file.size && (
                      <span className="text-[10px] text-text-muted font-mono shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    )}
                  </div>

                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium shrink-0 ml-2"
                    >
                      <Download className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Dismantle Waypoint Task"
        description={`Are you sure you want to delete "${task.title}"? All associated subtask checkpoints and attachment records will be deleted.`}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleteTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteTaskMutation.isPending}
              onClick={() => deleteTaskMutation.mutate()}
            >
              Delete Task
            </Button>
          </>
        }
      >
        <p className="text-xs text-text-muted italic bg-surface-raised p-3 rounded-xs">
          Task: {task.title}
        </p>
      </Dialog>
    </Drawer>
  );
}
