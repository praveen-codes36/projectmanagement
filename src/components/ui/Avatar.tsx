import { useMemo } from 'react';
import { getInitials, cn } from '../../lib/utils';

export interface AvatarProps {
  nameOrEmail?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ nameOrEmail, size = 'md', className }: AvatarProps) {
  const initials = getInitials(nameOrEmail);

  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  // Deterministic subtle tint
  const bgColor = useMemo(() => {
    if (!nameOrEmail) return 'bg-surface-raised text-text-muted';
    const hues = [
      'bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      'bg-sky-950/20 text-sky-700 dark:text-sky-300 border-sky-500/30',
      'bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      'bg-stone-900/10 text-stone-700 dark:text-stone-300 border-stone-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < nameOrEmail.length; i++) {
      hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % hues.length;
    return hues[index];
  }, [nameOrEmail]);

  return (
    <div
      title={nameOrEmail}
      aria-label={nameOrEmail || 'User avatar'}
      className={cn(
        'inline-flex items-center justify-center font-medium font-mono select-none rounded-sm border shrink-0',
        sizeMap[size],
        bgColor,
        className
      )}
    >
      {initials}
    </div>
  );
}
