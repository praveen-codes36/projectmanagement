import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';
import { Project } from '../../api/types';
import { usePermissions } from '../../auth/usePermissions';
import { Button, Input, Dialog, Tooltip } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Settings, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface ProjectSettingsTabProps {
  project: Project;
}

export function ProjectSettingsTab({ project }: ProjectSettingsTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const permissions = usePermissions(project.currentUserRole);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState('');

  const updateMutation = useMutation({
    mutationFn: () =>
      projectsService.updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Expedition details updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update project settings.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project "${project.name}" has been permanently dismantled.`);
      navigate('/projects', { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete project.');
    },
  });

  if (!permissions.canViewSettings) {
    return (
      <div className="p-8 border border-border rounded-md bg-surface text-center space-y-3 max-w-lg mx-auto my-8">
        <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="text-sm font-semibold text-text">Restricted Zone</h2>
        <p className="text-xs text-text-muted">
          Only project administrators can view or modify expedition parameters and settings.
        </p>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    updateMutation.mutate();
  };

  const isDeleteConfirmed = confirmNameInput.trim() === project.name.trim();

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-text">Project Settings</h2>
        <p className="text-xs text-text-muted">
          Configure metadata, workspace identity, and lifecycle controls.
        </p>
      </div>

      {/* General Settings */}
      <div className="p-6 border border-border rounded-md bg-surface space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-text">Expedition Metadata</h3>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            helperText="The unique name identifying this workspace."
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-text select-none">
              Expedition Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline mission objectives and targets..."
              className="w-full p-3 text-xs bg-surface text-text rounded-sm border border-border placeholder:text-text-muted/60 focus-visible:outline-2 focus-visible:outline-accent resize-y font-sans leading-relaxed"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={updateMutation.isPending}
            disabled={name === project.name && description === project.description}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 border border-danger/20 rounded-md bg-danger/5 space-y-4">
        <div className="flex items-center gap-2 border-b border-danger/20 pb-3">
          <AlertTriangle className="w-4 h-4 text-danger" />
          <h3 className="text-sm font-semibold text-danger">Danger Zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-text">Dismantle Project</h4>
            <p className="text-xs text-text-muted">
              Permanently delete this project, including all tasks, subtasks, attachments, and field notes.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setConfirmNameInput('');
              setDeleteDialogOpen(true);
            }}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Project
          </Button>
        </div>
      </div>

      {/* Type-the-name confirmation dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Project Dismantling"
        description="This action cannot be undone. All waypoint coordinates, files, and member permissions will be erased."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              disabled={!isDeleteConfirmed}
              onClick={() => deleteMutation.mutate()}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xs text-xs text-danger space-y-1">
            <p className="font-semibold">Destructive Action Warning</p>
            <p>
              To confirm, type <span className="font-mono font-bold select-all">{project.name}</span> in the box below:
            </p>
          </div>

          <Input
            placeholder={project.name}
            value={confirmNameInput}
            onChange={(e) => setConfirmNameInput(e.target.value)}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
}
