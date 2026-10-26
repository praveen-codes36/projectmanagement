import { TaskStatus, USER_ROLES, UserRole } from '../lib/constants';
import { Attachment, Note, Project, ProjectMember, Subtask, Task, User } from './types';

/**
 * ADAPTER ASSUMPTIONS CATALOG:
 * 1. User:
 *    - Assumes user identifier can be in `_id` or `id`.
 *    - Assumes `email` and `username` exist on the user payload.
 * 2. Project:
 *    - Assumes project list items may be flat `{ id, name, description, role, memberCount }`
 *      OR wrapped `{ project: { ... }, role: 'admin' }`.
 *    - Assumes `role` defaults to `member` if not returned in project listing.
 *    - Assumes `memberCount` defaults to `members?.length || 1` if omitted.
 * 3. Task:
 *    - Assumes task status can be 'todo' | 'in_progress' | 'done' (or fallback from 'TODO', 'IN_PROGRESS', 'DONE').
 *    - Assumes `subtasks` may be embedded in the task detail response or omitted in simple listings.
 *    - Assumes `assignedTo` is an ID string or an embedded user object `{ _id, username, email }`.
 * 4. Attachment:
 *    - Assumes attachment is `{ id || _id, url, name || originalname || filename, size, mimeType }`.
 * 5. Subtask:
 *    - Assumes `isCompleted` is a boolean (falls back from `completed` or `status === 'done'`).
 * 6. Member:
 *    - Assumes member item can be `{ user: { id, email, username }, role }` or flat `{ userId, email, username, role }`.
 * 7. Note:
 *    - Assumes note item is `{ id || _id, projectId, content, createdBy || author, createdAt, updatedAt }`.
 */

export function adaptUser(raw: any): User {
  if (!raw) {
    throw new Error('adaptUser: raw user object is null or undefined');
  }

  return {
    id: String(raw.id || raw._id || raw.userId || ''),
    email: String(raw.email || ''),
    username: String(raw.username || raw.name || raw.email?.split('@')[0] || 'User'),
    isEmailVerified: Boolean(raw.isEmailVerified ?? raw.isVerified ?? false),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
}

export function adaptProject(raw: any, fallbackRole: UserRole = USER_ROLES.MEMBER): Project {
  if (!raw) {
    throw new Error('adaptProject: raw project object is null or undefined');
  }

  // Handle wrapped { project: { ... }, role: 'admin' } pattern
  const projectObj = raw.project || raw;
  const rawRole = (raw.role || raw.currentUserRole || projectObj.currentUserRole || fallbackRole || 'member').toLowerCase();
  
  const role: UserRole = 
    rawRole === 'admin' 
      ? USER_ROLES.ADMIN 
      : rawRole === 'project_admin' 
        ? USER_ROLES.PROJECT_ADMIN 
        : USER_ROLES.MEMBER;

  return {
    id: String(projectObj.id || projectObj._id || ''),
    name: String(projectObj.name || projectObj.title || 'Untitled Project'),
    description: String(projectObj.description || ''),
    currentUserRole: role,
    memberCount: Number(projectObj.memberCount ?? projectObj.members?.length ?? 1),
    createdAt: projectObj.createdAt || new Date().toISOString(),
    updatedAt: projectObj.updatedAt || projectObj.createdAt || new Date().toISOString(),
  };
}

export function adaptAttachment(raw: any): Attachment {
  if (!raw) return { id: '', name: 'File', url: '' };

  return {
    id: String(raw.id || raw._id || Math.random().toString(36).slice(2)),
    name: String(raw.name || raw.originalname || raw.filename || 'Attachment'),
    url: String(raw.url || raw.path || ''),
    size: typeof raw.size === 'number' ? raw.size : undefined,
    mimeType: raw.mimetype || raw.mimeType || undefined,
  };
}

export function adaptSubtask(raw: any, taskId = ''): Subtask {
  if (!raw) return { id: '', taskId, title: '', isCompleted: false };

  return {
    id: String(raw.id || raw._id || ''),
    taskId: String(raw.taskId || taskId),
    title: String(raw.title || ''),
    isCompleted: Boolean(raw.isCompleted ?? raw.completed ?? (raw.status === 'done')),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function adaptTask(raw: any, projectId = ''): Task {
  if (!raw) {
    throw new Error('adaptTask: raw task object is null or undefined');
  }

  let status: TaskStatus = 'todo';
  const rawStatus = String(raw.status || '').toLowerCase().replace(/\s+/g, '_');
  if (rawStatus === 'done' || rawStatus === 'completed') {
    status = 'done';
  } else if (rawStatus === 'in_progress' || rawStatus === 'inprogress' || rawStatus === 'ongoing') {
    status = 'in_progress';
  }

  // Handle populated or raw assignedTo
  let assignedToId: string | null = null;
  let assigneeUser: User | null = null;

  if (raw.assignedTo && typeof raw.assignedTo === 'object') {
    assigneeUser = adaptUser(raw.assignedTo);
    assignedToId = assigneeUser.id;
  } else if (typeof raw.assignedTo === 'string' && raw.assignedTo.trim() !== '') {
    assignedToId = raw.assignedTo;
  }

  const attachments: Attachment[] = Array.isArray(raw.attachments)
    ? raw.attachments.map(adaptAttachment)
    : [];

  const taskId = String(raw.id || raw._id || '');
  const subtasks: Subtask[] = Array.isArray(raw.subtasks)
    ? raw.subtasks.map((st: any) => adaptSubtask(st, taskId))
    : [];

  return {
    id: taskId,
    projectId: String(raw.projectId || projectId),
    title: String(raw.title || 'Untitled Task'),
    description: String(raw.description || ''),
    assignedTo: assignedToId,
    assigneeUser,
    status,
    attachments,
    subtasks,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

export function adaptMember(raw: any, projectId = ''): ProjectMember {
  if (!raw) {
    throw new Error('adaptMember: raw member object is null or undefined');
  }

  const rawRole = String(raw.role || 'member').toLowerCase();
  const role: UserRole =
    rawRole === 'admin'
      ? USER_ROLES.ADMIN
      : rawRole === 'project_admin'
        ? USER_ROLES.PROJECT_ADMIN
        : USER_ROLES.MEMBER;

  let user: User;
  if (raw.user && typeof raw.user === 'object') {
    user = adaptUser(raw.user);
  } else {
    user = adaptUser({
      id: raw.userId || raw.id || raw._id,
      email: raw.email,
      username: raw.username || raw.name,
    });
  }

  return {
    userId: user.id,
    projectId: String(raw.projectId || projectId),
    role,
    user,
    joinedAt: raw.joinedAt || raw.createdAt,
  };
}

export function adaptNote(raw: any, projectId = ''): Note {
  if (!raw) {
    throw new Error('adaptNote: raw note object is null or undefined');
  }

  let author: User | null = null;
  if (raw.author && typeof raw.author === 'object') {
    author = adaptUser(raw.author);
  } else if (raw.createdBy && typeof raw.createdBy === 'object') {
    author = adaptUser(raw.createdBy);
  }

  return {
    id: String(raw.id || raw._id || ''),
    projectId: String(raw.projectId || projectId),
    content: String(raw.content || ''),
    createdBy: author ? author.id : typeof raw.createdBy === 'string' ? raw.createdBy : undefined,
    author,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}
