import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../api/services/projects';
import { ProjectMember } from '../../api/types';
import { usePermissions } from '../../auth/usePermissions';
import { USER_ROLES, UserRole } from '../../lib/constants';
import {
  Button,
  Input,
  Select,
  Dialog,
  Table,
  RoleBadge,
  Avatar,
  Tooltip,
  EmptyState,
} from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { formatDate } from '../../lib/utils';
import { UserPlus, Trash2, Shield, AlertCircle, RefreshCw } from 'lucide-react';

export interface MembersTabProps {
  projectId: string;
  currentUserRole: UserRole;
}

export function MembersTab({ projectId, currentUserRole }: MembersTabProps) {
  const queryClient = useQueryClient();
  const permissions = usePermissions(currentUserRole);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<UserRole>(USER_ROLES.MEMBER);
  const [addError, setAddError] = useState<string | null>(null);

  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  const {
    data: members = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectsService.getMembers(projectId),
    staleTime: 30 * 1000,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: UserRole }) =>
      projectsService.addMember(projectId, data),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`${newMember.user.username || newMember.user.email} added to project.`);
      setAddDialogOpen(false);
      setMemberEmail('');
      setMemberRole(USER_ROLES.MEMBER);
      setAddError(null);
    },
    onError: (err: any) => {
      const msg =
        err.message ||
        'Failed to add member. Please verify the email address is registered and not already in this project.';
      setAddError(msg);
      toast.error(msg);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: UserRole }) =>
      projectsService.updateMemberRole(projectId, userId, newRole),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      toast.success('Member role updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update member role.');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsService.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Member removed from expedition.');
      setMemberToRemove(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove member.');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      setAddError('Email address is required');
      return;
    }
    setAddError(null);
    addMemberMutation.mutate({
      email: memberEmail.trim(),
      role: memberRole,
    });
  };

  const columns = [
    {
      key: 'user',
      header: 'Team Member',
      render: (m: ProjectMember) => (
        <div className="flex items-center gap-3">
          <Avatar nameOrEmail={m.user.username || m.user.email} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-text truncate">{m.user.username}</p>
            <p className="text-[11px] text-text-muted truncate">{m.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Project Role',
      render: (m: ProjectMember) => {
        if (!permissions.canChangeRole) {
          return <RoleBadge role={m.role} />;
        }

        return (
          <select
            value={m.role}
            disabled={updateRoleMutation.isPending}
            onChange={(e) =>
              updateRoleMutation.mutate({
                userId: m.userId,
                newRole: e.target.value as UserRole,
              })
            }
            className="text-xs bg-surface border border-border rounded-xs px-2 py-1 text-text focus-visible:outline-accent cursor-pointer"
          >
            <option value="admin">Admin</option>
            <option value="project_admin">Project Admin</option>
            <option value="member">Member</option>
          </select>
        );
      },
    },
    {
      key: 'joinedAt',
      header: 'Joined Date',
      render: (m: ProjectMember) => (
        <span className="font-mono text-[11px] text-text-muted">
          {formatDate(m.joinedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (m: ProjectMember) => {
        if (!permissions.canRemoveMember) return null;

        return (
          <button
            type="button"
            onClick={() => setMemberToRemove(m)}
            aria-label={`Remove ${m.user.username || m.user.email}`}
            className="text-text-muted hover:text-danger p-1 rounded-xs hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-text">Expedition Team Roster</h2>
          <p className="text-xs text-text-muted">
            Manage project participants, access permissions, and role designations.
          </p>
        </div>

        <div>
          {permissions.canAddMember ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setAddError(null);
                setAddDialogOpen(true);
              }}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Member
            </Button>
          ) : (
            <Tooltip content={permissions.getPermissionReason('add_member') || 'Admin role required'}>
              <Button
                variant="outline"
                size="sm"
                disabled
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Admin Managed
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="p-4 border border-border rounded-md bg-surface space-y-3 animate-pulse">
          <div className="h-4 bg-surface-raised rounded w-1/4" />
          <div className="h-8 bg-surface-raised rounded w-full" />
          <div className="h-8 bg-surface-raised rounded w-full" />
        </div>
      ) : isError ? (
        <div className="p-8 border border-danger/20 rounded-md bg-danger/5 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-danger mx-auto" />
          <p className="text-xs text-danger">{(error as any)?.message || 'Failed to load team roster.'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          title="No team members assigned"
          description="Establish your expedition party by inviting team members with designated roles."
          actionLabel={permissions.canAddMember ? 'Add First Member' : undefined}
          onAction={permissions.canAddMember ? () => setAddDialogOpen(true) : undefined}
        />
      ) : (
        <Table
          columns={columns}
          data={members}
          keyExtractor={(m) => m.userId}
        />
      )}

      {/* Add Member Dialog */}
      <Dialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Invite Expedition Member"
        description="Allocate access to this project workspace by registered email."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={addMemberMutation.isPending}
              onClick={handleAddSubmit}
            >
              Add to Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {addError && (
            <div
              role="alert"
              className="p-3 bg-danger/10 border border-danger/20 rounded-xs flex items-start gap-2 text-xs text-danger"
            >
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <span>{addError}</span>
            </div>
          )}

          <Input
            label="User Email Address"
            type="email"
            placeholder="colleague@team.com"
            required
            autoFocus
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            helperText="The user must have an existing Project Camp account."
          />

          <Select
            label="Designated Project Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as UserRole)}
            options={[
              { value: 'member', label: 'Member (View tasks/notes, mark subtasks done)' },
              { value: 'project_admin', label: 'Project Admin (Create & edit tasks/subtasks)' },
              { value: 'admin', label: 'Admin (Full control, members & notes authoring)' },
            ]}
          />
        </form>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member from Project"
        description={`Are you sure you want to remove ${memberToRemove?.user.username || memberToRemove?.user.email} from this project? They will lose access to all tasks and shared field notes.`}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMemberToRemove(null)}
              disabled={removeMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={removeMemberMutation.isPending}
              onClick={() => {
                if (memberToRemove) {
                  removeMemberMutation.mutate(memberToRemove.userId);
                }
              }}
            >
              Remove Member
            </Button>
          </>
        }
      >
        <div className="p-3 bg-surface-raised rounded-xs text-xs text-text-muted space-y-1">
          <p className="font-semibold text-text">User: {memberToRemove?.user.username}</p>
          <p>Email: {memberToRemove?.user.email}</p>
          <p>Role: {memberToRemove?.role}</p>
        </div>
      </Dialog>
    </div>
  );
}
