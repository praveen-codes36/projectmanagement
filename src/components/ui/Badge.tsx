import React from 'react';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TaskStatus, UserRole } from '../../lib/constants';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'role' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variantStyles = {
    neutral: 'bg-surface-raised text-text-muted border-border',
    role: 'bg-surface-raised text-text font-medium border-border',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-xs border font-medium select-none whitespace-nowrap shrink-0',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const roleDisplay = {
    admin: { label: 'Admin', variant: 'role' as const },
    project_admin: { label: 'Project Admin', variant: 'neutral' as const },
    member: { label: 'Member', variant: 'neutral' as const },
  };

  const current = roleDisplay[role] || { label: role, variant: 'neutral' };

  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'done':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-status-done font-medium whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-status-done shrink-0" aria-hidden="true" />
          <span>Done</span>
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-status-inprogress font-medium whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 text-status-inprogress shrink-0" aria-hidden="true" />
          <span>In progress</span>
        </span>
      );
    case 'todo':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-status-todo font-medium whitespace-nowrap shrink-0">
          <Circle className="w-3.5 h-3.5 text-status-todo shrink-0" aria-hidden="true" />
          <span>To do</span>
        </span>
      );
  }
}

/**
 * Clean unboxed metadata component with typographic separators (anti-slop rule).
 */
export function MetadataText({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const filtered = items.filter(Boolean);
  return (
    <div className={cn('flex items-center gap-2 text-xs text-text-muted', className)}>
      {filtered.map((item, index) => (
        <React.Fragment key={index}>
          <span>{item}</span>
          {index < filtered.length - 1 && (
            <span className="text-border select-none" aria-hidden="true">
              ·
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
