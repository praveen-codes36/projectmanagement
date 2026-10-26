import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../auth/AuthProvider';
import { Search, FolderKanban, Plus, Sun, Moon, HelpCircle, User, LogOut, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject?: () => void;
  onOpenShortcuts?: () => void;
}

export interface CommandItem {
  id: string;
  category: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenCreateProject,
  onOpenShortcuts,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getProjects(),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const staticActions: CommandItem[] = useMemo(
    () => [
      {
        id: 'action-create-project',
        category: 'Actions',
        label: 'Create New Project',
        icon: <Plus className="w-4 h-4 text-primary" />,
        action: () => {
          onClose();
          onOpenCreateProject?.();
        },
      },
      {
        id: 'action-all-projects',
        category: 'Navigation',
        label: 'View All Projects',
        icon: <FolderKanban className="w-4 h-4 text-text-muted" />,
        action: () => {
          navigate('/projects');
          onClose();
        },
      },
      {
        id: 'action-account',
        category: 'Navigation',
        label: 'Account Profile & Security',
        icon: <User className="w-4 h-4 text-text-muted" />,
        action: () => {
          navigate('/account');
          onClose();
        },
      },
      {
        id: 'action-toggle-theme',
        category: 'Preferences',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        icon: theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'action-shortcuts',
        category: 'Help',
        label: 'Keyboard Shortcuts Guide',
        icon: <HelpCircle className="w-4 h-4 text-text-muted" />,
        action: () => {
          onClose();
          onOpenShortcuts?.();
        },
      },
      {
        id: 'action-logout',
        category: 'Account',
        label: 'Log Out of Project Camp',
        icon: <LogOut className="w-4 h-4 text-danger" />,
        action: () => {
          onClose();
          logout();
        },
      },
    ],
    [theme, toggleTheme, navigate, onClose, onOpenCreateProject, onOpenShortcuts, logout]
  );

  const filteredItems: CommandItem[] = useMemo(() => {
    const q = search.toLowerCase().trim();

    const projectItems: CommandItem[] = projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map((p) => ({
        id: `project-${p.id}`,
        category: 'Projects',
        label: p.name,
        subtitle: `${p.memberCount} members · ${p.currentUserRole}`,
        icon: <FolderKanban className="w-4 h-4 text-primary" />,
        action: () => {
          navigate(`/projects/${p.id}`);
          onClose();
        },
      }));

    const actionItems = staticActions.filter((a) => a.label.toLowerCase().includes(q));

    return [...projectItems, ...actionItems];
  }, [projects, staticActions, search, navigate, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl bg-surface border border-border rounded-md shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border bg-surface">
          <Search className="w-4 h-4 text-text-muted shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a project, action, or command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-transparent text-sm text-text placeholder:text-text-muted/60 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-raised border border-border rounded-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No matching waypoints or commands found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer select-none transition-colors text-xs',
                    isSelected ? 'bg-surface-raised text-text' : 'text-text-muted hover:bg-surface-raised/60'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-text">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-text-muted truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-text-muted font-mono">{item.category}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-text" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface-raised/40 text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-mono text-[10px]">Project Camp Command Bar</span>
        </div>
      </div>
    </div>
  );
}
