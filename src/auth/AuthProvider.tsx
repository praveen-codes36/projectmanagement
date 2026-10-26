import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/auth';
import { User } from '../api/types';
import { AUTH_EVENTS } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => Promise<any>;
  logout: () => Promise<void>;
  setUserOptimistic: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_QUERY_KEY = ['currentUser'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user = null,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if server request fails, clear local cache
    } finally {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      navigate('/login', { replace: true });
    }
  }, [navigate, queryClient]);

  const setUserOptimistic = useCallback(
    (updatedUser: User | null) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
    },
    [queryClient]
  );

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/' && !path.startsWith('/verify')) {
          navigate('/login?expired=1', {
            state: { sessionExpiredMessage: customEvent.detail?.message || 'Your session has expired. Please log in again.' },
            replace: true,
          });
        }
      }
    };

    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    };
  }, [navigate, queryClient]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    refetchUser: refetch,
    logout,
    setUserOptimistic,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
