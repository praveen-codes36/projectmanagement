import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { useTheme } from '../../lib/theme';
import { projectsService } from '../../api/services/projects';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import {
  Button,
  Dialog,
  Input,
  Avatar,
  Menu,
} from '../ui';
import { toast } from '../ui/Toast';
import {
  Mountain,
  FolderKanban,
  User as UserIcon,
  Plus,
  Search,
  Sun,
  Moon,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Fetch projects for sidebar recents & command palette
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getProjects(),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      projectsService.createProject(data),
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Project "${newProj.name}" created successfully`);
      setCreateProjectOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      navigate(`/projects/${newProj.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create project');
    },
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcuts when inside an active input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    createMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-text">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border sticky top-0 z-40">
        <Link to="/projects" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold">
            <Mountain className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm font-display tracking-tight text-text">Project Camp</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open search command palette"
            onClick={() => setPaletteOpen(true)}
          >
            <Search className="w-4 h-4 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <MenuIcon className="w-4 h-4 text-text" />
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-surface border-r border-border h-screen sticky top-0 z-30 transition-all duration-200 shrink-0 select-none',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Brand Zone */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <Link to="/projects" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold shrink-0">
              <Mountain className="w-3.5 h-3.5" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-sm font-display tracking-tight text-text whitespace-nowrap">
                Project Camp
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-text-muted hover:text-text p-1 rounded-xs hover:bg-surface-raised cursor-pointer transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Button
            variant="primary"
            size="sm"
            className={cn('w-full', isCollapsed ? 'px-0' : '')}
            onClick={() => setCreateProjectOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 shrink-0" />}
          >
            {!isCollapsed && 'New Project'}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div className="space-y-1">
            <Link
              to="/projects"
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors',
                location.pathname === '/projects'
                  ? 'bg-surface-raised text-text font-semibold border border-border'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised/50'
              )}
            >
              <FolderKanban className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Projects</span>}
            </Link>

            <Link
              to="/account"
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors',
                location.pathname === '/account'
                  ? 'bg-surface-raised text-text font-semibold border border-border'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised/50'
              )}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Account</span>}
            </Link>
          </div>

          {/* Recent Projects List */}
          {!isCollapsed && projects.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-text-muted px-2 block">
                Active Projects
              </span>
              <div className="space-y-0.5">
                {projects.slice(0, 5).map((p) => {
                  const isActive = location.pathname.startsWith(`/projects/${p.id}`);
                  return (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className={cn(
                        'block px-2.5 py-1.5 rounded-sm text-xs truncate transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-muted hover:text-text hover:bg-surface-raised/50'
                      )}
                    >
                      {p.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Bar at bottom */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          <Link
            to="/account"
            className="flex items-center gap-2.5 overflow-hidden group min-w-0 flex-1"
          >
            <Avatar nameOrEmail={user?.username || user?.email} size="sm" />
            {!isCollapsed && (
              <div className="truncate text-left min-w-0">
                <p className="text-xs font-medium text-text truncate group-hover:underline">
                  {user?.username}
                </p>
                <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Contract (Desktop) */}
        <header className="hidden md:flex items-center justify-between gap-8 h-14 px-6 border-b border-border bg-surface shrink-0 sticky top-0 z-20">
          {/* Zone 1: Location indicator */}
          <div className="flex items-center gap-2 text-xs text-text-muted min-w-0 shrink-0">
            <Link to="/projects" className="hover:text-text transition-colors">
              Base Camp
            </Link>
            <span>/</span>
            <span className="font-semibold text-text truncate">
              {location.pathname === '/account'
                ? 'Account'
                : location.pathname === '/projects'
                ? 'Projects'
                : 'Workspace'}
            </span>
          </div>

          {/* Zone 2: Command palette search trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center justify-between gap-4 w-full max-w-sm h-8 px-3 text-xs text-text-muted bg-surface-raised border border-border rounded-sm hover:border-text-muted/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Jump to project or command...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded-xs shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="p-1.5 text-text-muted hover:text-text rounded-sm hover:bg-surface-raised transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              aria-label="View keyboard shortcuts"
              className="p-1.5 text-text-muted hover:text-text rounded-sm hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <Menu
              trigger={
                <button type="button" className="cursor-pointer ml-1">
                  <Avatar nameOrEmail={user?.username || user?.email} size="sm" />
                </button>
              }
              items={[
                {
                  id: 'acc',
                  label: 'Account Profile',
                  icon: <UserIcon className="w-3.5 h-3.5" />,
                  onClick: () => navigate('/account'),
                },
                'separator',
                {
                  id: 'out',
                  label: 'Log Out',
                  icon: <LogOut className="w-3.5 h-3.5" />,
                  variant: 'danger',
                  onClick: logout,
                },
              ]}
            />
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface p-4 space-y-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium text-text rounded-sm hover:bg-surface-raised"
              >
                Projects
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium text-text rounded-sm hover:bg-surface-raised"
              >
                Account Profile
              </Link>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenCreateProject={() => setCreateProjectOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Global Keyboard Shortcuts Help */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Global Create Project Dialog */}
      <Dialog
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        title="Establish New Project"
        description="Create a collaborative expedition workspace for your team."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateProjectOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              onClick={handleCreateProjectSubmit}
            >
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Ridge Line Ascent"
            required
            autoFocus
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="Key objectives, milestones, or project scope..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  );
}
