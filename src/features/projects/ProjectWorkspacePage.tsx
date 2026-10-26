import { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';
import { tasksService } from '../../api/services/tasks';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { TasksWorkspaceTab } from '../tasks/TasksWorkspaceTab';
import { MembersTab } from '../members/MembersTab';
import { NotesTab } from '../notes/NotesTab';
import { ProjectSettingsTab } from './ProjectSettingsTab';
import { ProjectTerrainAccent } from '../../three/ProjectTerrainAccent';
import { Tabs, RoleBadge, RouteProgress, Button, EmptyState } from '../../components/ui';
import { usePermissions } from '../../auth/usePermissions';
import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Users,
  FileText,
  Settings,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const { projectId = '', tab = 'overview' } = useParams<{ projectId: string; tab?: string }>();
  const navigate = useNavigate();

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });

  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksService.getTasks(projectId),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectsService.getMembers(projectId),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });

  const permissions = usePermissions(project?.currentUserRole);

  const availableTabs = useMemo(() => {
    const list = [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'tasks', label: 'Tasks', icon: <ListTodo className="w-4 h-4" />, badge: tasks.length },
      { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" />, badge: project?.memberCount },
      { id: 'notes', label: 'Field Notes', icon: <FileText className="w-4 h-4" /> },
    ];

    if (permissions.canViewSettings) {
      list.push({ id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> });
    }

    return list;
  }, [tasks.length, project?.memberCount, permissions.canViewSettings]);

  // Handle invalid tab fallback
  useEffect(() => {
    const validTabIds = availableTabs.map((t) => t.id);
    if (!validTabIds.includes(tab) && tab !== 'overview') {
      navigate(`/projects/${projectId}`, { replace: true });
    }
  }, [tab, availableTabs, projectId, navigate]);

  const handleTabChange = (newTab: string) => {
    if (newTab === 'overview') {
      navigate(`/projects/${projectId}`);
    } else {
      navigate(`/projects/${projectId}/${newTab}`);
    }
  };

  if (isProjectLoading || isTasksLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="h-4 bg-surface-raised rounded w-24" />
        <div className="h-8 bg-surface-raised rounded w-1/3" />
        <div className="h-10 bg-surface-raised rounded w-full" />
        <div className="h-48 bg-surface-raised rounded-md w-full" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="max-w-lg mx-auto p-8 my-12 border border-danger/20 rounded-md bg-danger/5 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-danger mx-auto" />
        <h1 className="text-base font-semibold text-text">Expedition Workspace Not Found</h1>
        <p className="text-xs text-text-muted">
          {(projectError as any)?.message ||
            'The requested project does not exist or you do not have permission to view it.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchProject()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
          <Link to="/projects">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Workspace Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link to="/projects" className="hover:text-text transition-colors flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-text truncate">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-display tracking-tight text-text truncate">
              {project.name}
            </h1>
            <RoleBadge role={project.currentUserRole} />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <ProjectTerrainAccent
              totalTasks={tasks.length}
              completedTasks={completedCount}
            />

            <div className="w-full sm:w-64 shrink-0">
              <RouteProgress
                totalTasks={tasks.length}
                completedTasks={completedCount}
                inProgressTasks={inProgressCount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* URL-synced Navigation Tabs */}
      <Tabs
        tabs={availableTabs}
        activeTab={tab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* Active Tab View */}
      <div className="pt-2">
        {tab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            tasks={tasks}
            onSelectTab={handleTabChange}
          />
        )}

        {tab === 'tasks' && (
          <TasksWorkspaceTab
            projectId={project.id}
            tasks={tasks}
            members={members}
            currentUserRole={project.currentUserRole}
          />
        )}

        {tab === 'members' && (
          <MembersTab
            projectId={project.id}
            currentUserRole={project.currentUserRole}
          />
        )}

        {tab === 'notes' && (
          <NotesTab
            projectId={project.id}
            currentUserRole={project.currentUserRole}
          />
        )}

        {tab === 'settings' && permissions.canViewSettings && (
          <ProjectSettingsTab project={project} />
        )}
      </div>
    </div>
  );
}
