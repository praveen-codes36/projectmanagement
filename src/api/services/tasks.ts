import { apiClient } from '../client';
import { adaptSubtask, adaptTask } from '../adapters';
import { Subtask, Task } from '../types';
import { TaskStatus } from '../../lib/constants';

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo?: string | null;
  status?: TaskStatus;
  attachments?: File[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string | null;
  status?: TaskStatus;
  attachments?: File[];
}

export const tasksService = {
  async getTasks(projectId: string): Promise<Task[]> {
    const res = await apiClient<any>(`/tasks/${projectId}`, { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : (res.data as any)?.tasks || [];
    return rawList.map((item: any) => adaptTask(item, projectId));
  },

  async getTask(projectId: string, taskId: string): Promise<Task> {
    const res = await apiClient<any>(`/tasks/${projectId}/t/${taskId}`, { method: 'GET' });
    return adaptTask(res.data?.task || res.data, projectId);
  },

  async createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
    const formData = new FormData();
    formData.append('title', input.title);
    if (input.description !== undefined) {
      formData.append('description', input.description);
    }
    if (input.assignedTo) {
      formData.append('assignedTo', input.assignedTo);
    }
    if (input.status) {
      formData.append('status', input.status);
    }
    if (input.attachments && input.attachments.length > 0) {
      input.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const res = await apiClient<any>(`/tasks/${projectId}`, {
      method: 'POST',
      body: formData,
    });
    return adaptTask(res.data?.task || res.data, projectId);
  },

  async updateTask(projectId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    // If only status is being updated or no file attachments are present, we can check if JSON or FormData
    const hasAttachments = input.attachments && input.attachments.length > 0;
    
    let res: any;
    if (hasAttachments) {
      const formData = new FormData();
      if (input.title !== undefined) formData.append('title', input.title);
      if (input.description !== undefined) formData.append('description', input.description);
      if (input.assignedTo !== undefined) formData.append('assignedTo', input.assignedTo || '');
      if (input.status !== undefined) formData.append('status', input.status);
      input.attachments!.forEach((file) => {
        formData.append('attachments', file);
      });

      res = await apiClient<any>(`/tasks/${projectId}/t/${taskId}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // JSON is allowed for status only or standard field updates
      res = await apiClient<any>(`/tasks/${projectId}/t/${taskId}`, {
        method: 'PUT',
        body: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
      });
    }

    return adaptTask(res.data?.task || res.data, projectId);
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await apiClient(`/tasks/${projectId}/t/${taskId}`, { method: 'DELETE' });
  },

  async createSubtask(projectId: string, taskId: string, title: string): Promise<Subtask> {
    const res = await apiClient<any>(`/tasks/${projectId}/t/${taskId}/subtasks`, {
      method: 'POST',
      body: { title },
    });
    return adaptSubtask(res.data?.subtask || res.data, taskId);
  },

  async updateSubtask(
    projectId: string,
    subTaskId: string,
    data: { title?: string; isCompleted?: boolean }
  ): Promise<Subtask> {
    const res = await apiClient<any>(`/tasks/${projectId}/st/${subTaskId}`, {
      method: 'PUT',
      body: data,
    });
    return adaptSubtask(res.data?.subtask || res.data);
  },

  async deleteSubtask(projectId: string, subTaskId: string): Promise<void> {
    await apiClient(`/tasks/${projectId}/st/${subTaskId}`, {
      method: 'DELETE',
    });
  },
};
