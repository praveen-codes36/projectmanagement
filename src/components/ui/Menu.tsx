import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export interface MenuProps {
  trigger: React.ReactNode;
  items: Array<MenuItem | 'separator'>;
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({ trigger, items, align = 'right', className }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] max-w-xs bg-surface border border-border rounded-sm shadow-md py-1 focus:outline-hidden',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item, idx) => {
            if (item === 'separator') {
              return <div key={`sep-${idx}`} className="h-px bg-border my-1" role="separator" />;
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-1.5 text-xs font-medium flex items-center gap-2 text-left transition-colors cursor-pointer select-none',
                  'hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:outline-hidden',
                  item.variant === 'danger'
                    ? 'text-danger hover:bg-danger/10'
                    : 'text-text hover:text-text',
                  item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                )}
              >
                {item.icon && <span className="w-3.5 h-3.5 shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
