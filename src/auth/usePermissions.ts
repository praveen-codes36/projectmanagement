import { useMemo } from 'react';
import { USER_ROLES, UserRole } from '../lib/constants';

export type ActionName =
  | 'edit_project'
  | 'delete_project'
  | 'manage_members'
  | 'add_member'
  | 'remove_member'
  | 'change_member_role'
  | 'write_notes'
  | 'manage_tasks'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'create_subtask'
  | 'edit_subtask'
  | 'delete_subtask'
  | 'complete_subtask'
  | 'view_project';

/**
 * Hook to evaluate RBAC permissions given the active project role.
 */
export function usePermissions(role?: UserRole | null) {
  const permissions = useMemo(() => {
    const currentRole = role || USER_ROLES.MEMBER;
    const isAdmin = currentRole === USER_ROLES.ADMIN;
    const isProjectAdmin = currentRole === USER_ROLES.PROJECT_ADMIN;
    const isMember = currentRole === USER_ROLES.MEMBER;

    return {
      role: currentRole,
      isAdmin,
      isProjectAdmin,
      isMember,

      // Project controls
      canEditProject: isAdmin,
      canDeleteProject: isAdmin,
      canViewSettings: isAdmin,

      // Member management
      canManageMembers: isAdmin,
      canAddMember: isAdmin,
      canRemoveMember: isAdmin,
      canChangeRole: isAdmin,

      // Notes
      canWriteNotes: isAdmin,
      canViewNotes: true,

      // Tasks
      canCreateTask: isAdmin || isProjectAdmin,
      canEditTask: isAdmin || isProjectAdmin,
      canDeleteTask: isAdmin || isProjectAdmin,
      canManageTasks: isAdmin || isProjectAdmin,

      // Subtasks
      canCreateSubtask: isAdmin || isProjectAdmin,
      canEditSubtask: isAdmin || isProjectAdmin,
      canDeleteSubtask: isAdmin || isProjectAdmin,
      canCompleteSubtask: true, // admin, project_admin, or member

      /**
       * Returns a user-friendly explanation for disabled actions on hover/focus.
       */
      getPermissionReason(action: ActionName): string | null {
        switch (action) {
          case 'edit_project':
          case 'delete_project':
            if (!isAdmin) return 'Only project admins can modify project settings.';
            return null;
          case 'manage_members':
          case 'add_member':
          case 'remove_member':
          case 'change_member_role':
            if (!isAdmin) return 'Only project admins can manage members.';
            return null;
          case 'write_notes':
            if (!isAdmin) return 'Notes are read-only for non-admin members.';
            return null;
          case 'create_task':
          case 'edit_task':
          case 'delete_task':
          case 'manage_tasks':
            if (isMember) return 'Members can view tasks and complete subtasks. Task creation requires Project Admin or Admin role.';
            return null;
          case 'create_subtask':
          case 'edit_subtask':
          case 'delete_subtask':
            if (isMember) return 'Members can only toggle subtask completion status.';
            return null;
          case 'complete_subtask':
          case 'view_project':
            return null;
          default:
            return null;
        }
      },
    };
  }, [role]);

  return permissions;
}
