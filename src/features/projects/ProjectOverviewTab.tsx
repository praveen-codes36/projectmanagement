import { Link } from 'react-router-dom';
import { Project, Task } from '../../api/types';
import { RoleBadge, RouteProgress } from '../../components/ui';
import { ROLE_DESCRIPTIONS } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  Circle,
  Users,
  FileText,
  ListTodo,
  Shield,
  ArrowRight,
} from 'lucide-react';

export interface ProjectOverviewTabProps {
  project: Project;
  tasks: Task[];
  onSelectTab: (tabId: string) => void;
}

export function ProjectOverviewTab({ project, tasks, onSelectTab }: ProjectOverviewTabProps) {
  // Derive counts exclusively from real task data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  return (
    <div className="space-y-6">
      {/* Expedition Header Card */}
      <div className="p-6 border border-border rounded-md bg-surface shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-lg font-bold font-display text-text">{project.name}</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              {project.description || 'No description established for this expedition.'}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Your Role:</span>
              <RoleBadge role={project.currentUserRole} />
            </div>
            <p className="text-[11px] text-text-muted max-w-xs sm:text-right">
              {ROLE_DESCRIPTIONS[project.currentUserRole]}
            </p>
          </div>
        </div>

        {/* Live Expedition Route Line */}
        <div className="pt-4 border-t border-border">
          <RouteProgress
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            inProgressTasks={inProgressTasks}
          />
        </div>
      </div>

      {/* Task & Expedition Telemetry Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 border border-border rounded-md bg-surface space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Total Tasks</span>
            <ListTodo className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-text">{totalTasks}</p>
          <span className="text-[10px] text-text-muted">Waypoints logged</span>
        </div>

        <div className="p-4 border border-border rounded-md bg-surface space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-status-inprogress" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-status-inprogress">
            {inProgressTasks}
          </p>
          <span className="text-[10px] text-text-muted">Active ascents</span>
        </div>

        <div className="p-4 border border-border rounded-md bg-surface space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-status-done" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-status-done">
            {completedTasks}
          </p>
          <span className="text-[10px] text-text-muted">Milestones cleared</span>
        </div>

        <div className="p-4 border border-border rounded-md bg-surface space-y-1">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>To Do</span>
            <Circle className="w-4 h-4 text-status-todo" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-text">{todoTasks}</p>
          <span className="text-[10px] text-text-muted">Pending trail nodes</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onSelectTab('tasks')}
          className="p-5 border border-border rounded-md bg-surface hover:border-primary/60 transition-all text-left space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-text">
            <span className="text-xs font-semibold flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-primary" />
              Waypoint Tasks
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-text-muted">
            Plan, assign, and organize tasks across Kanban board or list views with subtasks.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('members')}
          className="p-5 border border-border rounded-md bg-surface hover:border-primary/60 transition-all text-left space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-text">
            <span className="text-xs font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Expedition Roster
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-text-muted">
            Inspect team members, verify permissions, and allocate project-level roles.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('notes')}
          className="p-5 border border-border rounded-md bg-surface hover:border-primary/60 transition-all text-left space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between text-text">
            <span className="text-xs font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Field Notes
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-text-muted">
            Review shared field logs, sprint retrospective observations, and briefings.
          </p>
        </button>
      </div>

      {/* Meta Specifications */}
      <div className="p-4 border border-border rounded-md bg-surface-raised/30 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4 flex-wrap">
          <span>Project ID: <span className="font-mono text-text select-all">{project.id}</span></span>
          <span>·</span>
          <span>Created: <span className="font-mono text-text">{formatDate(project.createdAt)}</span></span>
          <span>·</span>
          <span>Last Activity: <span className="font-mono text-text">{formatDate(project.updatedAt)}</span></span>
        </div>
      </div>
    </div>
  );
}
