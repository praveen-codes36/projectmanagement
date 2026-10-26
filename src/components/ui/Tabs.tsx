import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'segmented';
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={cn(
          'inline-flex items-center gap-1 p-1 bg-surface-raised border border-border rounded-sm',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer',
                isActive
                  ? 'bg-surface text-text shadow-xs border border-border/80'
                  : 'text-text-muted hover:text-text'
              )}
            >
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="font-mono text-[10px] opacity-75 tabular-nums">
                  ({tab.badge})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-6 border-b border-border overflow-x-auto', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 pt-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer',
              isActive
                ? 'border-primary text-text font-semibold'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-xs font-mono tabular-nums text-text-muted">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
