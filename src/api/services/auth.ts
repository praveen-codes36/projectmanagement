import { apiClient } from '../client';
import { adaptUser } from '../adapters';
import { User } from '../types';

export const authService = {
  async register(data: { email: string; username: string; password: string }): Promise<{ user: User; message: string }> {
    const res = await apiClient<any>('/auth/register', {
      method: 'POST',
      body: data,
    });
    return {
      user: adaptUser(res.data?.user || res.data),
      message: res.message || 'Registration successful. A verification email has been sent.',
    };
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; message: string }> {
    const res = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: data,
    });
    return {
      user: adaptUser(res.data?.user || res.data),
      message: res.message || 'Logged in successfully',
    };
  },

  async logout(): Promise<void> {
    await apiClient('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await apiClient<any>('/auth/current-user', {
        method: 'GET',
      });
      return adaptUser(res.data?.user || res.data);
    } catch (err: any) {
      if (err.statusCode === 401) {
        return null;
      }
      throw err;
    }
  },

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient<any>('/auth/change-password', {
      method: 'POST',
      body: data,
    });
    return { message: res.message || 'Password changed successfully' };
  },

  async verifyEmail(verificationToken: string): Promise<{ message: string }> {
    const res = await apiClient<any>(`/auth/verify-email/${encodeURIComponent(verificationToken)}`, {
      method: 'GET',
    });
    return { message: res.message || 'Email successfully verified' };
  },

  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    const res = await apiClient<any>('/auth/forgot-password', {
      method: 'POST',
      body: data,
    });
    return { message: res.message || 'Password reset link sent to your email' };
  },

  async resetPassword(resetToken: string, data: { newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient<any>(`/auth/reset-password/${encodeURIComponent(resetToken)}`, {
      method: 'POST',
      body: data,
    });
    return { message: res.message || 'Password has been reset successfully' };
  },

  async resendEmailVerification(): Promise<{ message: string }> {
    const res = await apiClient<any>('/auth/resend-email-verification', {
      method: 'POST',
    });
    return { message: res.message || 'Verification email resent' };
  },
};
