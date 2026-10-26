import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="h-8 bg-surface-raised rounded-md w-1/3" />
          <div className="h-4 bg-surface-raised rounded w-2/3" />
          <div className="space-y-3 pt-6">
            <div className="h-16 bg-surface-raised rounded-lg" />
            <div className="h-16 bg-surface-raised rounded-lg" />
            <div className="h-16 bg-surface-raised rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return <Outlet />;
}
