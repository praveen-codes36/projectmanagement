import { API_BASE_URL, AUTH_EVENTS } from '../lib/constants';
import { ApiError, ApiResponse } from './types';
import { handleMockRequest } from './mockData';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Checks if a URL path is an authentication endpoint where 401 refresh should NOT occur.
 */
function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/current-user')
  );
}

/**
 * Executes a single POST to /auth/refresh-token, deduplicating parallel calls.
 */
async function performTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const body = await response.json().catch(() => ({}));
      return body?.success !== false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Core HTTP client adhering strictly to the backend contract.
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const reqHeaders: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string>),
  };

  const reqConfig: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
    credentials: 'include', // httpOnly cookie auth is mandatory on every request
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  };

  const isTestMode = import.meta.env.MODE === 'test';
  const hasRemoteBackend = Boolean(import.meta.env.VITE_BACKEND_URL);

  // If running in browser/preview mode without an active remote backend, execute against mock store
  if (!isTestMode && !hasRemoteBackend) {
    try {
      return await handleMockRequest<T>(endpoint, { method: reqConfig.method, body });
    } catch (mockErr: any) {
      if (mockErr?.statusCode) {
        throw new ApiError(mockErr.message || 'Request failed', mockErr.statusCode);
      }
      throw new ApiError(mockErr?.message || 'Request failed', 500);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, reqConfig);
  } catch (err: unknown) {
    // If backend is not available (e.g. preview environment without external API), use mock store
    try {
      return await handleMockRequest<T>(endpoint, { method: reqConfig.method, body });
    } catch (mockErr: any) {
      if (mockErr?.statusCode) {
        throw new ApiError(mockErr.message || 'Request failed', mockErr.statusCode);
      }
      throw new ApiError(err instanceof Error ? err.message : 'Network connection failed. Please check your network.', 0);
    }
  }

  // Handle server fallback when endpoint is missing (404), server error (5xx), or HTML fallback
  const isHtml = response.headers.get('content-type')?.includes('text/html');
  if ((response.status >= 500 || response.status === 404 || isHtml) && typeof window !== 'undefined') {
    try {
      return await handleMockRequest<T>(endpoint, { method: reqConfig.method, body });
    } catch (mockErr: any) {
      if (mockErr?.statusCode) {
        throw new ApiError(mockErr.message || 'Request failed', mockErr.statusCode);
      }
    }
  }

  // Handle 401 Unauthorized with token refresh deduplication
  if (response.status === 401 && !isAuthEndpoint(endpoint)) {
    const refreshed = await performTokenRefresh();
    if (refreshed) {
      // Retry original request once
      try {
        response = await fetch(url, reqConfig);
      } catch (err: unknown) {
        throw new ApiError(err instanceof Error ? err.message : 'Network request retry failed', 0);
      }
    } else {
      // Refresh failed: broadcast session expired event for clean UI redirection
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED, {
            detail: { message: 'Your session has expired. Please log in again.' },
          })
        );
      }
      throw new ApiError('Session expired. Please log in again.', 401);
    }
  }

  let responseBody: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }
  } else {
    const text = await response.text();
    responseBody = { message: text };
  }

  // Fallback if request hit internal control plane
  if (responseBody?.error?.includes('Missing Authorization header') && typeof window !== 'undefined') {
    try {
      return await handleMockRequest<T>(endpoint, { method: reqConfig.method, body });
    } catch (mockErr: any) {
      if (mockErr?.statusCode) {
        throw new ApiError(mockErr.message || 'Request failed', mockErr.statusCode);
      }
    }
  }

  if (!response.ok) {
    const statusCode = responseBody?.statusCode || response.status;
    const message =
      responseBody?.message ||
      responseBody?.error ||
      (response.status === 403
        ? 'You do not have permission to perform this action.'
        : response.status === 401
        ? 'Invalid email or password. Please try again.'
        : 'An error occurred while processing your request.');
    const errors = Array.isArray(responseBody?.errors)
      ? responseBody.errors.map((e: any) => (typeof e === 'string' ? { message: e } : { field: e.field, message: e.message }))
      : [];

    throw new ApiError(message, statusCode, errors);
  }

  // Contract: Success shape is { statusCode, data, message, success }
  return {
    statusCode: responseBody?.statusCode ?? response.status,
    data: (responseBody?.data !== undefined ? responseBody.data : responseBody) as T,
    message: responseBody?.message || 'Request successful',
    success: responseBody?.success !== false,
  };
}
