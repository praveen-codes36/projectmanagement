import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../client';
import { AUTH_EVENTS } from '../../lib/constants';

describe('apiClient 401 refresh behaviour', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deduplicates parallel 401s into a single /auth/refresh-token request and retries', async () => {
    let refreshCalls = 0;
    let projectCalls = 0;

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/refresh-token')) {
        refreshCalls++;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ statusCode: 200, success: true, message: 'Refreshed' }),
        });
      }

      if (url.includes('/projects')) {
        projectCalls++;
        // First call fails with 401, subsequent retries succeed
        if (projectCalls <= 2) {
          return Promise.resolve({
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve({ statusCode: 401, message: 'Unauthorized', success: false }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ statusCode: 200, success: true, data: [{ id: 'p1', name: 'Alpha' }] }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      });
    });

    vi.stubGlobal('fetch', mockFetch);

    // Trigger two concurrent requests that receive 401s
    const [res1, res2] = await Promise.all([
      apiClient('/projects'),
      apiClient('/projects'),
    ]);

    // Verifies that only a single POST /auth/refresh-token request was dispatched across both parallel calls
    expect(refreshCalls).toBe(1);
    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
  });

  it('dispatches SESSION_EXPIRED event when token refresh fails', async () => {
    const eventSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, eventSpy);

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/refresh-token')) {
        return Promise.resolve({
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ statusCode: 401, message: 'Session expired', success: false }),
        });
      }

      return Promise.resolve({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ statusCode: 401, message: 'Unauthorized', success: false }),
      });
    });

    vi.stubGlobal('fetch', mockFetch);

    await expect(apiClient('/projects')).rejects.toThrow('Session expired');
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, eventSpy);
  });
});
