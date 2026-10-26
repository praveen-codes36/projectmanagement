import { User, Project, Task, ProjectMember, Note, ApiResponse } from './types';
import { TASK_STATUSES, USER_ROLES, UserRole } from '../lib/constants';

const STORAGE_KEYS = {
  CURRENT_USER: 'project_camp_current_user',
  PROJECTS: 'project_camp_projects',
  TASKS: 'project_camp_tasks',
  MEMBERS: 'project_camp_members',
  NOTES: 'project_camp_notes',
};

export const DEMO_USERS: Record<string, User & { role: UserRole; title: string; desc: string }> = {
  lead: {
    id: 'user-lead-01',
    email: 'lead@projectcamp.dev',
    username: 'Elena Rostova',
    role: USER_ROLES.ADMIN,
    title: 'Project Lead (Admin)',
    desc: 'Full administrative access: organization settings, role delegation, project deletion',
    isEmailVerified: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  guide: {
    id: 'user-guide-02',
    email: 'guide@projectcamp.dev',
    username: 'Marcus Vance',
    role: USER_ROLES.PROJECT_ADMIN,
    title: 'Expedition Guide (Project Admin)',
    desc: 'Project-level management: invite members, assign waypoints, organize routes',
    isEmailVerified: true,
    createdAt: '2026-01-12T09:30:00Z',
  },
  member: {
    id: 'user-member-03',
    email: 'member@projectcamp.dev',
    username: 'Tariq Chen',
    role: USER_ROLES.MEMBER,
    title: 'Field Researcher (Member)',
    desc: 'Standard contributor: create and complete tasks, update subtasks, write field notes',
    isEmailVerified: true,
    createdAt: '2026-01-15T10:15:00Z',
  },
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-alpine-01',
    name: 'Alpine Ridge Expedition Alpha',
    description: 'High-altitude telemetry deployment across northwest col and summit weather ridge.',
    currentUserRole: USER_ROLES.ADMIN,
    memberCount: 3,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-18T14:20:00Z',
  },
  {
    id: 'proj-glacier-02',
    name: 'Denali Glacial Flow Study',
    description: 'Long-term seismic and laser altimetry sensors monitoring ice shelf displacement.',
    currentUserRole: USER_ROLES.PROJECT_ADMIN,
    memberCount: 2,
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-16T11:45:00Z',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-01',
    projectId: 'proj-alpine-01',
    title: 'Calibrate Base Camp weather station sensors',
    description: 'Verify barometric pressure transducers and anemometers before ascending to High Camp.',
    assignedTo: DEMO_USERS.member.id,
    assigneeUser: DEMO_USERS.member,
    status: TASK_STATUSES.DONE,
    attachments: [
      { id: 'att-1', name: 'sensor-calibration-spec.pdf', url: '#', size: 245000, mimeType: 'application/pdf' },
    ],
    subtasks: [
      { id: 'sub-1', taskId: 'task-01', title: 'Barometer calibration check', isCompleted: true },
      { id: 'sub-2', taskId: 'task-01', title: 'Wind vane orientation sync', isCompleted: true },
      { id: 'sub-3', taskId: 'task-01', title: 'Log baseline pressure profile', isCompleted: true },
    ],
    createdAt: '2026-02-02T09:00:00Z',
    updatedAt: '2026-02-03T16:00:00Z',
  },
  {
    id: 'task-02',
    projectId: 'proj-alpine-01',
    title: 'Survey Northwest Col ascent route and ice bridge',
    description: 'Inspect seracs and set up static line anchors across the lower crevasse field.',
    assignedTo: DEMO_USERS.guide.id,
    assigneeUser: DEMO_USERS.guide,
    status: TASK_STATUSES.IN_PROGRESS,
    attachments: [
      { id: 'att-2', name: 'col-topo-route-v2.png', url: '#', size: 1200000, mimeType: 'image/png' },
    ],
    subtasks: [
      { id: 'sub-4', taskId: 'task-02', title: 'Crevasse perimeter probe test', isCompleted: true },
      { id: 'sub-5', taskId: 'task-02', title: 'Fixed anchor placement on rock band', isCompleted: true },
      { id: 'sub-6', taskId: 'task-02', title: 'Ascent corridor marking flags', isCompleted: false },
    ],
    createdAt: '2026-02-04T07:30:00Z',
    updatedAt: '2026-02-06T12:00:00Z',
  },
  {
    id: 'task-03',
    projectId: 'proj-alpine-01',
    title: 'Stage High Camp 2 rations and oxygen manifolds',
    description: 'Transfer 7 days of survival rations and medical reserve gear to 5,800m ledge.',
    assignedTo: DEMO_USERS.member.id,
    assigneeUser: DEMO_USERS.member,
    status: TASK_STATUSES.IN_PROGRESS,
    attachments: [],
    subtasks: [
      { id: 'sub-7', taskId: 'task-03', title: 'Load calculation per climber', isCompleted: true },
      { id: 'sub-8', taskId: 'task-03', title: 'Weather window confirmation', isCompleted: false },
    ],
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-07T08:15:00Z',
  },
  {
    id: 'task-04',
    projectId: 'proj-alpine-01',
    title: 'Deploy solar satellite relay on ridge summit',
    description: 'High-bandwidth telemetry connection to coordinate live field data with regional lab.',
    assignedTo: DEMO_USERS.lead.id,
    assigneeUser: DEMO_USERS.lead,
    status: TASK_STATUSES.TODO,
    attachments: [],
    subtasks: [
      { id: 'sub-9', taskId: 'task-04', title: 'Test battery cold discharge rating', isCompleted: false },
      { id: 'sub-10', taskId: 'task-04', title: 'Aim dish towards polar satellite arc', isCompleted: false },
    ],
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'task-05',
    projectId: 'proj-alpine-01',
    title: 'Safety protocol review with dispatch team',
    description: 'Sync emergency beacon frequencies and evacuation winch coordinates.',
    assignedTo: null,
    assigneeUser: null,
    status: TASK_STATUSES.TODO,
    attachments: [],
    subtasks: [],
    createdAt: '2026-02-09T14:00:00Z',
    updatedAt: '2026-02-09T14:00:00Z',
  },
];

const INITIAL_MEMBERS: Record<string, ProjectMember[]> = {
  'proj-alpine-01': [
    {
      userId: DEMO_USERS.lead.id,
      projectId: 'proj-alpine-01',
      role: USER_ROLES.ADMIN,
      user: DEMO_USERS.lead,
      joinedAt: '2026-02-01T08:00:00Z',
    },
    {
      userId: DEMO_USERS.guide.id,
      projectId: 'proj-alpine-01',
      role: USER_ROLES.PROJECT_ADMIN,
      user: DEMO_USERS.guide,
      joinedAt: '2026-02-01T09:00:00Z',
    },
    {
      userId: DEMO_USERS.member.id,
      projectId: 'proj-alpine-01',
      role: USER_ROLES.MEMBER,
      user: DEMO_USERS.member,
      joinedAt: '2026-02-02T10:00:00Z',
    },
  ],
  'proj-glacier-02': [
    {
      userId: DEMO_USERS.lead.id,
      projectId: 'proj-glacier-02',
      role: USER_ROLES.ADMIN,
      user: DEMO_USERS.lead,
      joinedAt: '2026-02-05T10:00:00Z',
    },
    {
      userId: DEMO_USERS.guide.id,
      projectId: 'proj-glacier-02',
      role: USER_ROLES.PROJECT_ADMIN,
      user: DEMO_USERS.guide,
      joinedAt: '2026-02-05T11:00:00Z',
    },
  ],
};

const INITIAL_NOTES: Record<string, Note[]> = {
  'proj-alpine-01': [
    {
      id: 'note-01',
      projectId: 'proj-alpine-01',
      content: 'High Camp 2 Weather Observation: Barometric trend is stable at 540 hPa. Clear inversion layer expected above 5,000m for next 48 hours. Optimum summit push window is Tuesday 04:00 AM.',
      createdBy: DEMO_USERS.guide.id,
      author: DEMO_USERS.guide,
      createdAt: '2026-02-06T18:00:00Z',
      updatedAt: '2026-02-06T18:00:00Z',
    },
    {
      id: 'note-02',
      projectId: 'proj-alpine-01',
      content: 'Radio Comms Frequencies: Primary repeater channel 7 (146.520 MHz). Backup VHF relay 156.700 MHz via High Camp transponder. Hourly status check-ins at :15 past the hour.',
      createdBy: DEMO_USERS.lead.id,
      author: DEMO_USERS.lead,
      createdAt: '2026-02-04T12:30:00Z',
      updatedAt: '2026-02-04T12:30:00Z',
    },
  ],
};

function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export function getStoredCurrentUser(): User | null {
  return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setStoredCurrentUser(user: User | null): void {
  setStorage<User | null>(STORAGE_KEYS.CURRENT_USER, user);
}

/**
 * Handles mock API requests when backend is offline or for preview mode.
 */
export async function handleMockRequest<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  const cleanPath = endpoint.split('?')[0].replace(/^\/api/, '');

  // Simulate small network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 80));

  // 1. Current User
  if (cleanPath === '/auth/current-user') {
    const user = getStoredCurrentUser();
    if (!user) {
      throw { statusCode: 401, message: 'Unauthenticated' };
    }
    return {
      statusCode: 200,
      data: { user } as unknown as T,
      message: 'Authenticated',
      success: true,
    };
  }

  // 2. Login
  if (cleanPath === '/auth/login' && method === 'POST') {
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const email = body?.email?.toLowerCase().trim();

    let matchedUser: User | undefined;
    if (email?.includes('lead')) {
      matchedUser = DEMO_USERS.lead;
    } else if (email?.includes('guide')) {
      matchedUser = DEMO_USERS.guide;
    } else if (email?.includes('member')) {
      matchedUser = DEMO_USERS.member;
    } else {
      matchedUser = {
        id: `user-${Date.now().toString(36)}`,
        email: email || 'user@projectcamp.dev',
        username: email?.split('@')[0] || 'Expedition Member',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
    }

    setStoredCurrentUser(matchedUser);
    return {
      statusCode: 200,
      data: { user: matchedUser } as unknown as T,
      message: 'Logged in successfully',
      success: true,
    };
  }

  // 3. Register
  if (cleanPath === '/auth/register' && method === 'POST') {
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const newUser: User = {
      id: `user-${Date.now().toString(36)}`,
      email: body?.email || 'new@projectcamp.dev',
      username: body?.username || 'New Member',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    };
    setStoredCurrentUser(newUser);
    return {
      statusCode: 201,
      data: { user: newUser } as unknown as T,
      message: 'Registration successful. A verification email has been sent.',
      success: true,
    };
  }

  // 4. Logout
  if (cleanPath === '/auth/logout' && method === 'POST') {
    setStoredCurrentUser(null);
    return {
      statusCode: 200,
      data: {} as unknown as T,
      message: 'Logged out',
      success: true,
    };
  }

  // 5. Projects list
  if (cleanPath === '/projects' && method === 'GET') {
    const projects = getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    return {
      statusCode: 200,
      data: projects as unknown as T,
      message: 'Projects retrieved',
      success: true,
    };
  }

  // 6. Create project
  if (cleanPath === '/projects' && method === 'POST') {
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const projects = getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const newProj: Project = {
      id: `proj-${Date.now().toString(36)}`,
      name: body.name || 'Untitled Expedition',
      description: body.description || '',
      currentUserRole: USER_ROLES.ADMIN,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProj);
    setStorage(STORAGE_KEYS.PROJECTS, projects);
    return {
      statusCode: 201,
      data: { project: newProj } as unknown as T,
      message: 'Project created successfully',
      success: true,
    };
  }

  // 7. Get single project
  const projectMatch = cleanPath.match(/^\/projects\/([a-zA-Z0-9_-]+)$/);
  if (projectMatch && method === 'GET') {
    const id = projectMatch[1];
    const projects = getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const proj = projects.find((p) => p.id === id) || projects[0];
    return {
      statusCode: 200,
      data: { project: proj } as unknown as T,
      message: 'Project found',
      success: true,
    };
  }

  // 8. Update project
  if (projectMatch && method === 'PUT') {
    const id = projectMatch[1];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const projects = getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...body, updatedAt: new Date().toISOString() };
      setStorage(STORAGE_KEYS.PROJECTS, projects);
      return {
        statusCode: 200,
        data: { project: projects[index] } as unknown as T,
        message: 'Project updated',
        success: true,
      };
    }
  }

  // 9. Delete project
  if (projectMatch && method === 'DELETE') {
    const id = projectMatch[1];
    let projects = getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    projects = projects.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PROJECTS, projects);
    return {
      statusCode: 200,
      data: {} as unknown as T,
      message: 'Project deleted',
      success: true,
    };
  }

  // 10. Members
  const membersMatch = cleanPath.match(/^\/projects\/([a-zA-Z0-9_-]+)\/members$/);
  if (membersMatch && method === 'GET') {
    const projectId = membersMatch[1];
    const allMembers = getStorage<Record<string, ProjectMember[]>>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const list = allMembers[projectId] || INITIAL_MEMBERS['proj-alpine-01'] || [];
    return {
      statusCode: 200,
      data: list as unknown as T,
      message: 'Members retrieved',
      success: true,
    };
  }

  if (membersMatch && method === 'POST') {
    const projectId = membersMatch[1];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const allMembers = getStorage<Record<string, ProjectMember[]>>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    const list = allMembers[projectId] || [...(INITIAL_MEMBERS['proj-alpine-01'] || [])];
    const newMember: ProjectMember = {
      userId: `user-${Date.now().toString(36)}`,
      projectId,
      role: body.role || USER_ROLES.MEMBER,
      user: {
        id: `user-${Date.now().toString(36)}`,
        email: body.email,
        username: body.email.split('@')[0],
      },
      joinedAt: new Date().toISOString(),
    };
    list.push(newMember);
    allMembers[projectId] = list;
    setStorage(STORAGE_KEYS.MEMBERS, allMembers);
    return {
      statusCode: 201,
      data: { member: newMember } as unknown as T,
      message: 'Member invited successfully',
      success: true,
    };
  }

  // 11. Tasks for project
  const tasksMatch = cleanPath.match(/^\/tasks\/([a-zA-Z0-9_-]+)$/);
  if (tasksMatch && method === 'GET') {
    const projectId = tasksMatch[1];
    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const list = allTasks.filter((t) => t.projectId === projectId);
    return {
      statusCode: 200,
      data: (list.length > 0 ? list : allTasks) as unknown as T,
      message: 'Tasks retrieved',
      success: true,
    };
  }

  // Create Task
  if (tasksMatch && method === 'POST') {
    const projectId = tasksMatch[1];
    let bodyData: any = {};
    if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
      bodyData = {
        title: options.body.get('title') || 'Untitled Task',
        description: options.body.get('description') || '',
        assignedTo: options.body.get('assignedTo') || null,
        status: options.body.get('status') || TASK_STATUSES.TODO,
      };
    } else {
      bodyData = options.body || {};
    }

    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const newTask: Task = {
      id: `task-${Date.now().toString(36)}`,
      projectId,
      title: bodyData.title || 'New Waypoint',
      description: bodyData.description || '',
      assignedTo: bodyData.assignedTo || null,
      assigneeUser: bodyData.assignedTo ? Object.values(DEMO_USERS).find((u) => u.id === bodyData.assignedTo) || null : null,
      status: bodyData.status || TASK_STATUSES.TODO,
      attachments: [],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allTasks.unshift(newTask);
    setStorage(STORAGE_KEYS.TASKS, allTasks);
    return {
      statusCode: 201,
      data: { task: newTask } as unknown as T,
      message: 'Task created',
      success: true,
    };
  }

  // Update Task
  const singleTaskMatch = cleanPath.match(/^\/tasks\/([a-zA-Z0-9_-]+)\/t\/([a-zA-Z0-9_-]+)$/);
  if (singleTaskMatch && (method === 'PUT' || method === 'PATCH')) {
    const taskId = singleTaskMatch[2];
    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const index = allTasks.findIndex((t) => t.id === taskId);
    let bodyData: any = {};
    if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
      bodyData = {
        title: options.body.get('title'),
        description: options.body.get('description'),
        assignedTo: options.body.get('assignedTo'),
        status: options.body.get('status'),
      };
    } else if (typeof options.body === 'string') {
      try {
        bodyData = JSON.parse(options.body);
      } catch {
        bodyData = {};
      }
    } else {
      bodyData = options.body || {};
    }

    if (index !== -1) {
      const updated = {
        ...allTasks[index],
        ...bodyData,
        updatedAt: new Date().toISOString(),
      };
      allTasks[index] = updated;
      setStorage(STORAGE_KEYS.TASKS, allTasks);
      return {
        statusCode: 200,
        data: { task: updated } as unknown as T,
        message: 'Task updated',
        success: true,
      };
    }
  }

  // Delete Task
  if (singleTaskMatch && method === 'DELETE') {
    const taskId = singleTaskMatch[2];
    let allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    allTasks = allTasks.filter((t) => t.id !== taskId);
    setStorage(STORAGE_KEYS.TASKS, allTasks);
    return {
      statusCode: 200,
      data: {} as unknown as T,
      message: 'Task deleted',
      success: true,
    };
  }

  // Subtasks
  const subtasksMatch = cleanPath.match(/^\/tasks\/([a-zA-Z0-9_-]+)\/t\/([a-zA-Z0-9_-]+)\/subtasks$/);
  if (subtasksMatch && method === 'POST') {
    const taskId = subtasksMatch[2];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    const newSubtask = {
      id: `sub-${Date.now().toString(36)}`,
      taskId,
      title: body.title || 'New Subtask',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    if (task) {
      task.subtasks.push(newSubtask);
      setStorage(STORAGE_KEYS.TASKS, allTasks);
    }
    return {
      statusCode: 201,
      data: { subtask: newSubtask } as unknown as T,
      message: 'Subtask added',
      success: true,
    };
  }

  const singleSubtaskMatch = cleanPath.match(/^\/tasks\/([a-zA-Z0-9_-]+)\/t\/([a-zA-Z0-9_-]+)\/subtasks\/([a-zA-Z0-9_-]+)$/);
  if (singleSubtaskMatch && (method === 'PUT' || method === 'PATCH')) {
    const taskId = singleSubtaskMatch[2];
    const subtaskId = singleSubtaskMatch[3];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    let updatedSubtask: any = null;
    if (task) {
      task.subtasks = task.subtasks.map((st) => {
        if (st.id === subtaskId) {
          updatedSubtask = { ...st, ...body };
          return updatedSubtask;
        }
        return st;
      });
      setStorage(STORAGE_KEYS.TASKS, allTasks);
    }
    return {
      statusCode: 200,
      data: { subtask: updatedSubtask } as unknown as T,
      message: 'Subtask updated',
      success: true,
    };
  }

  if (singleSubtaskMatch && method === 'DELETE') {
    const taskId = singleSubtaskMatch[2];
    const subtaskId = singleSubtaskMatch[3];
    const allTasks = getStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      task.subtasks = task.subtasks.filter((st) => st.id !== subtaskId);
      setStorage(STORAGE_KEYS.TASKS, allTasks);
    }
    return {
      statusCode: 200,
      data: {} as unknown as T,
      message: 'Subtask deleted',
      success: true,
    };
  }

  // 12. Notes
  const notesMatch = cleanPath.match(/^\/notes\/([a-zA-Z0-9_-]+)$/);
  if (notesMatch && method === 'GET') {
    const projectId = notesMatch[1];
    const allNotes = getStorage<Record<string, Note[]>>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const list = allNotes[projectId] || INITIAL_NOTES['proj-alpine-01'] || [];
    return {
      statusCode: 200,
      data: list as unknown as T,
      message: 'Notes retrieved',
      success: true,
    };
  }

  if (notesMatch && method === 'POST') {
    const projectId = notesMatch[1];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const allNotes = getStorage<Record<string, Note[]>>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const list = allNotes[projectId] || [...(INITIAL_NOTES['proj-alpine-01'] || [])];
    const user = getStoredCurrentUser() || DEMO_USERS.lead;
    const newNote: Note = {
      id: `note-${Date.now().toString(36)}`,
      projectId,
      content: body.content || '',
      createdBy: user.id,
      author: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newNote);
    allNotes[projectId] = list;
    setStorage(STORAGE_KEYS.NOTES, allNotes);
    return {
      statusCode: 201,
      data: { note: newNote } as unknown as T,
      message: 'Field note logged',
      success: true,
    };
  }

  const singleNoteMatch = cleanPath.match(/^\/notes\/([a-zA-Z0-9_-]+)\/n\/([a-zA-Z0-9_-]+)$/);
  if (singleNoteMatch && (method === 'PUT' || method === 'PATCH')) {
    const projectId = singleNoteMatch[1];
    const noteId = singleNoteMatch[2];
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as any;
    const allNotes = getStorage<Record<string, Note[]>>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const list = allNotes[projectId] || [];
    const idx = list.findIndex((n) => n.id === noteId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
      allNotes[projectId] = list;
      setStorage(STORAGE_KEYS.NOTES, allNotes);
      return {
        statusCode: 200,
        data: { note: list[idx] } as unknown as T,
        message: 'Note updated',
        success: true,
      };
    }
  }

  if (singleNoteMatch && method === 'DELETE') {
    const projectId = singleNoteMatch[1];
    const noteId = singleNoteMatch[2];
    const allNotes = getStorage<Record<string, Note[]>>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const list = allNotes[projectId] || [];
    allNotes[projectId] = list.filter((n) => n.id !== noteId);
    setStorage(STORAGE_KEYS.NOTES, allNotes);
    return {
      statusCode: 200,
      data: {} as unknown as T,
      message: 'Note deleted',
      success: true,
    };
  }

  // Fallback generic response
  return {
    statusCode: 200,
    data: {} as unknown as T,
    message: 'Operation complete',
    success: true,
  };
}
