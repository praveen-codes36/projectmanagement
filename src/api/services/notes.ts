import { apiClient } from '../client';
import { adaptNote } from '../adapters';
import { Note } from '../types';

export const notesService = {
  async getNotes(projectId: string): Promise<Note[]> {
    const res = await apiClient<any>(`/notes/${projectId}`, { method: 'GET' });
    const rawList = Array.isArray(res.data) ? res.data : (res.data as any)?.notes || [];
    return rawList.map((item: any) => adaptNote(item, projectId));
  },

  async createNote(projectId: string, content: string): Promise<Note> {
    const res = await apiClient<any>(`/notes/${projectId}`, {
      method: 'POST',
      body: { content },
    });
    return adaptNote(res.data?.note || res.data, projectId);
  },

  async getNote(projectId: string, noteId: string): Promise<Note> {
    const res = await apiClient<any>(`/notes/${projectId}/n/${noteId}`, {
      method: 'GET',
    });
    return adaptNote(res.data?.note || res.data, projectId);
  },

  async updateNote(projectId: string, noteId: string, content: string): Promise<Note> {
    const res = await apiClient<any>(`/notes/${projectId}/n/${noteId}`, {
      method: 'PUT',
      body: { content },
    });
    return adaptNote(res.data?.note || res.data, projectId);
  },

  async deleteNote(projectId: string, noteId: string): Promise<void> {
    await apiClient(`/notes/${projectId}/n/${noteId}`, {
      method: 'DELETE',
    });
  },
};
