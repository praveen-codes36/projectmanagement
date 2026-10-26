export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  project_admin: 'Project Admin',
  member: 'Member',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full control over project settings, members, tasks, and notes.',
  project_admin: 'Can create and modify tasks and subtasks; read-only notes.',
  member: 'Can view project resources and check off assigned subtasks.',
};

export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'project_camp:session_expired',
};
