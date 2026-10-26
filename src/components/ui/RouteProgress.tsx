import { cn } from '../../lib/utils';

export interface RouteProgressProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks?: number;
  className?: string;
}

export function RouteProgress({
  totalTasks,
  completedTasks,
  inProgressTasks = 0,
  className,
}: RouteProgressProps) {
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label="Expedition route completion"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('space-y-1.5', className)}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-text">
          <span className="w-1.5 h-1.5 rounded-xs bg-primary shrink-0" aria-hidden="true" />
          <span>Route Progress</span>
        </div>
        <div className="flex items-center gap-2 font-mono tabular-nums text-xs text-text-muted">
          <span>{completedTasks}/{totalTasks} waypoints</span>
          <span className="text-border">·</span>
          <span className="font-semibold text-text">{percent}%</span>
        </div>
      </div>

      {/* Segmented Expedition Track */}
      <div className="relative w-full h-2 bg-surface-raised border border-border rounded-xs overflow-hidden">
        {/* Completed track */}
        <div
          style={{ width: `${percent}%` }}
          className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-300 ease-out"
        />
        {/* In-progress trail */}
        <div
          style={{ left: `${percent}%`, width: `${inProgressPercent}%` }}
          className="absolute top-0 bottom-0 bg-status-inprogress/60 transition-all duration-300 ease-out"
        />
      </div>

      {/* Waypoint markers under track */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-0.5">
        <span>Base Camp</span>
        <span className={percent >= 50 ? 'text-text font-medium' : ''}>Waypoint High Pass</span>
        <span className={percent === 100 ? 'text-primary font-bold' : ''}>Summit</span>
      </div>
    </div>
  );
}
