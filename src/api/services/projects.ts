import { apiClient } from '../client';
import { adaptMember, adaptProject } from '../adapters';
import { Project, ProjectMember } from '../types';
import { UserRole } from '../../lib/constants';

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const res = await apiClient<any>('/projects', { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : (res.data as any)?.projects || [];
    return rawList.map((item: any) => adaptProject(item));
  },

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    const res = await apiClient<any>('/projects', {
      method: 'POST',
      body: data,
    });
    return adaptProject(res.data?.project || res.data, 'admin');
  },

  async getProject(projectId: string): Promise<Project> {
    const res = await apiClient<any>(`/projects/${projectId}`, { method: 'GET' });
    return adaptProject(res.data?.project || res.data);
  },

  async updateProject(projectId: string, data: { name: string; description?: string }): Promise<Project> {
    const res = await apiClient<any>(`/projects/${projectId}`, {
      method: 'PUT',
      body: data,
    });
    return adaptProject(res.data?.project || res.data);
  },

  async deleteProject(projectId: string): Promise<void> {
    await apiClient(`/projects/${projectId}`, { method: 'DELETE' });
  },

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    const res = await apiClient<any>(`/projects/${projectId}/members`, { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : (res.data as any)?.members || [];
    return rawList.map((item: any) => adaptMember(item, projectId));
  },

  async addMember(projectId: string, data: { email: string; role: UserRole }): Promise<ProjectMember> {
    const res = await apiClient<any>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: data,
    });
    return adaptMember(res.data?.member || res.data, projectId);
  },

  async updateMemberRole(projectId: string, userId: string, newRole: UserRole): Promise<ProjectMember> {
    const res = await apiClient<any>(`/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      body: { newRole },
    });
    return adaptMember(res.data?.member || res.data, projectId);
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await apiClient(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};
