import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xs bg-surface-raised/80', className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-md bg-surface space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}
