import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as AuthContext from '../AuthProvider';

vi.mock('../AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute guard', () => {
  it('renders skeleton loading animation while authentication status is resolving', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      refetchUser: vi.fn(),
      logout: vi.fn(),
      setUserOptimistic: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secret Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Content')).toBeNull();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('redirects to /login when user is unauthenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      refetchUser: vi.fn(),
      logout: vi.fn(),
      setUserOptimistic: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secret Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page Form</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Content')).toBeNull();
    expect(screen.getByText('Login Page Form')).not.toBeNull();
  });

  it('renders child outlet when user is authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'test@camp.io', username: 'tester' },
      isLoading: false,
      isAuthenticated: true,
      refetchUser: vi.fn(),
      logout: vi.fn(),
      setUserOptimistic: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Secret Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Content')).not.toBeNull();
  });
});
