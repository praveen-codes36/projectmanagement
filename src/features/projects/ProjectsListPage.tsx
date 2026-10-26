import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';
import { Button, Input, RoleBadge, EmptyState, Dialog } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getProjects(),
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      projectsService.createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project "${newProject.name}" established successfully.`);
      setCreateDialogOpen(false);
      setName('');
      setDesc('');
      navigate(`/projects/${newProject.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create project.');
    },
  });

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      description: desc.trim() || undefined,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-text">
            Expedition Projects
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Active workspaces, waypoints, and team assignments across all operations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Establish Project
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search projects by name or objective..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 border border-border rounded-md bg-surface space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="h-4 bg-surface-raised rounded w-2/3" />
                <div className="h-4 bg-surface-raised rounded w-16" />
              </div>
              <div className="h-3 bg-surface-raised rounded w-full" />
              <div className="h-3 bg-surface-raised rounded w-4/5" />
              <div className="pt-4 flex justify-between border-t border-border">
                <div className="h-3 bg-surface-raised rounded w-20" />
                <div className="h-3 bg-surface-raised rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 border border-danger/20 rounded-md bg-danger/5 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-sm font-semibold text-text">Failed to Load Projects</h2>
          <p className="text-xs text-text-muted">
            {(error as any)?.message || 'An error occurred while connecting to the project repository.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        search ? (
          <EmptyState
            title="No matching projects found"
            description={`No expedition workspaces matched "${search}". Try adjusting your keywords.`}
            actionLabel="Reset Search"
            onAction={() => setSearch('')}
          />
        ) : (
          <EmptyState
            icon={<FolderKanban className="w-6 h-6 text-primary" />}
            title="No expedition projects established"
            description="Start your first team expedition by establishing a project workspace with waypoint tracking and role management."
            actionLabel="Establish First Project"
            onAction={() => setCreateDialogOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group p-5 border border-border rounded-md bg-surface hover:border-primary/60 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </h2>
                  <RoleBadge role={project.currentUserRole} />
                </div>

                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {project.description || 'No expedition description specified.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{project.memberCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                  Enter
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="Establish Expedition Project"
        description="Configure a shared workspace for tasks, milestones, and field notes."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              onClick={handleCreateSubmit}
            >
              Establish Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Ridge Line Survey"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="Expedition mission, deliverables, or objectives..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  );
}
