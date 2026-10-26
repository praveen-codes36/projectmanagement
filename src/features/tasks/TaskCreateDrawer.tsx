import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../../api/services/tasks';
import { ProjectMember } from '../../api/types';
import { TaskStatus } from '../../lib/constants';
import { Drawer, Button, Input, Select } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { formatBytes } from '../../lib/utils';
import { Paperclip, X, File, AlertCircle } from 'lucide-react';

export interface TaskCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  initialStatus?: TaskStatus;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export function TaskCreateDrawer({
  isOpen,
  onClose,
  projectId,
  members,
  initialStatus = 'todo',
}: TaskCreateDrawerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial status when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setStatus(initialStatus);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setSelectedFiles([]);
      setValidationError(null);
    }
  }, [isOpen, initialStatus]);

  const createMutation = useMutation({
    mutationFn: () =>
      tasksService.createTask(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo || null,
        status,
        attachments: selectedFiles,
      }),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success(`Task "${newTask.title}" logged along the route.`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create task.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setValidationError(`File "${oversized.name}" exceeds the 10MB limit.`);
      return;
    }

    setValidationError(null);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }
    setValidationError(null);
    createMutation.mutate();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Waypoint Task"
      subtitle="Establish a new milestone or action item along this expedition route."
      width="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={createMutation.isPending}
            onClick={handleSubmit}
          >
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationError && (
          <div
            role="alert"
            className="p-3 bg-danger/10 border border-danger/20 rounded-xs flex items-start gap-2 text-xs text-danger"
          >
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Map ridge ascent topography"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-medium text-text select-none">
            Description & Notes
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, acceptance criteria, or reference coordinates..."
            className="w-full p-3 text-xs bg-surface text-text rounded-sm border border-border placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-accent resize-y font-sans leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'todo', label: 'To do' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'done', label: 'Done' },
            ]}
          />

          <Select
            label="Assigned Team Member"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.username || m.user.email} ({m.role})
              </option>
            ))}
          </Select>
        </div>

        {/* Attachment Upload Zone */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-text select-none">
              File Attachments
            </label>
            <span className="text-[10px] text-text-muted">Max 10MB per file</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-border rounded-sm p-4 text-center hover:border-primary/60 hover:bg-surface-raised/30 transition-colors cursor-pointer space-y-1"
          >
            <Paperclip className="w-5 h-5 text-text-muted mx-auto" />
            <p className="text-xs text-text font-medium">Click to select files or drag here</p>
            <p className="text-[10px] text-text-muted">Images, PDFs, documents, logs</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2 bg-surface-raised border border-border rounded-xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="truncate text-text font-medium">{file.name}</span>
                    <span className="text-[10px] text-text-muted font-mono shrink-0">
                      ({formatBytes(file.size)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    aria-label={`Remove file ${file.name}`}
                    className="text-text-muted hover:text-danger p-1 rounded-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
