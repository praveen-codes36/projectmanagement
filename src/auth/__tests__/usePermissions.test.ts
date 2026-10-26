import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { USER_ROLES } from '../../lib/constants';

describe('usePermissions RBAC', () => {
  it('grants full operational authority to admin role', () => {
    const { result } = renderHook(() => usePermissions(USER_ROLES.ADMIN));
    const p = result.current;

    expect(p.isAdmin).toBe(true);
    expect(p.canEditProject).toBe(true);
    expect(p.canDeleteProject).toBe(true);
    expect(p.canManageMembers).toBe(true);
    expect(p.canWriteNotes).toBe(true);
    expect(p.canCreateTask).toBe(true);
    expect(p.canCreateSubtask).toBe(true);
    expect(p.canCompleteSubtask).toBe(true);
    expect(p.getPermissionReason('edit_project')).toBeNull();
  });

  it('restricts project_admin from project deletion and notes writing', () => {
    const { result } = renderHook(() => usePermissions(USER_ROLES.PROJECT_ADMIN));
    const p = result.current;

    expect(p.isProjectAdmin).toBe(true);
    expect(p.canEditProject).toBe(false);
    expect(p.canDeleteProject).toBe(false);
    expect(p.canManageMembers).toBe(false);
    expect(p.canWriteNotes).toBe(false);
    // Project admin can manage tasks & subtasks
    expect(p.canCreateTask).toBe(true);
    expect(p.canEditTask).toBe(true);
    expect(p.canDeleteTask).toBe(true);
    expect(p.canCreateSubtask).toBe(true);
    expect(p.canCompleteSubtask).toBe(true);

    expect(p.getPermissionReason('write_notes')).toContain('Notes are read-only');
  });

  it('restricts member to viewing and completing subtasks', () => {
    const { result } = renderHook(() => usePermissions(USER_ROLES.MEMBER));
    const p = result.current;

    expect(p.isMember).toBe(true);
    expect(p.canEditProject).toBe(false);
    expect(p.canManageMembers).toBe(false);
    expect(p.canWriteNotes).toBe(false);
    expect(p.canCreateTask).toBe(false);
    expect(p.canDeleteTask).toBe(false);
    expect(p.canCreateSubtask).toBe(false);
    // Member CAN mark subtasks complete
    expect(p.canCompleteSubtask).toBe(true);

    expect(p.getPermissionReason('create_task')).toContain('Task creation requires Project Admin or Admin');
  });
});
