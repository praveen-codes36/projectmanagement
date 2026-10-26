import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute, GuestRoute } from './auth/ProtectedRoute';
import { Toaster } from './components/ui/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';

// App Shell & Features
import { AppShell } from './components/layout/AppShell';
import ProjectsListPage from './features/projects/ProjectsListPage';
import ProjectWorkspacePage from './features/projects/ProjectWorkspacePage';
import AccountPage from './features/account/AccountPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Guest Routes (Redirect to /projects if already authenticated) */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset/:token" element={<ResetPasswordPage />} />
                <Route path="/verify/:token" element={<VerifyEmailPage />} />
              </Route>

              {/* Protected App Routes (Wrapped in ProtectedRoute and AppShell) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/projects" element={<ProjectsListPage />} />
                  <Route path="/projects/:projectId" element={<ProjectWorkspacePage />} />
                  <Route path="/projects/:projectId/:tab" element={<ProjectWorkspacePage />} />
                  <Route path="/account" element={<AccountPage />} />
                </Route>
              </Route>

              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
