import { TaskStatus, UserRole } from '../lib/constants';

/** Standard backend envelope */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: Array<{ field?: string; message: string } | string>;
  success: false;
}

export class ApiError extends Error {
  statusCode: number;
  errors: Array<{ field?: string; message: string }>;

  constructor(message: string, statusCode = 500, errors: Array<{ field?: string; message: string }> = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/** Clean Frontend Domain Models */

export interface User {
  id: string;
  email: string;
  username: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  currentUserRole: UserRole;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo?: string | null;
  assigneeUser?: User | null;
  status: TaskStatus;
  attachments: Attachment[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  projectId: string;
  role: UserRole;
  user: User;
  joinedAt?: string;
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  createdBy?: string;
  author?: User | null;
  createdAt: string;
  updatedAt: string;
}
