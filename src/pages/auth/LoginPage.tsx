import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../api/services/auth';
import { useAuth } from '../../auth/AuthProvider';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Mountain, AlertCircle, ArrowRight, ShieldCheck, Compass, User as UserIcon, Check } from 'lucide-react';
import { DEMO_USERS } from '../../api/mockData';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserOptimistic } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoLoggingIn, setDemoLoggingIn] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';
  const sessionExpiredMsg =
    (location.state as any)?.sessionExpiredMessage ||
    (isExpired ? 'Your session has expired. Please log in again.' : null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'lead@projectcamp.dev',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const result = await authService.login(data);
      setUserOptimistic(result.user);
      toast.success(result.message || 'Logged in successfully');
      const fromPath = (location.state as any)?.from?.pathname || '/projects';
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Failed to log in. Please check your credentials.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const handleQuickDemoLogin = async (roleKey: 'lead' | 'guide' | 'member') => {
    const demo = DEMO_USERS[roleKey];
    if (!demo) return;

    setServerError(null);
    setDemoLoggingIn(roleKey);
    setValue('email', demo.email);
    setValue('password', 'Password123!');

    try {
      const result = await authService.login({
        email: demo.email,
        password: 'Password123!',
      });
      setUserOptimistic(result.user);
      toast.success(`Welcome to Base Camp, ${demo.username} (${demo.title.split(' ')[0]})`);
      const fromPath = (location.state as any)?.from?.pathname || '/projects';
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Failed to log in with demo account.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setDemoLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-5 group">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-text">
            Project Camp
          </span>
        </Link>
        <h1 className="text-center text-2xl font-bold tracking-tight text-text font-display">
          Return to Base Camp
        </h1>
        <p className="mt-1 text-center text-xs text-text-muted">
          Select an expedition role below for instant demo access, or sign in with your email.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-surface py-7 px-5 shadow-xs border border-border rounded-md sm:px-8 space-y-6">
          {sessionExpiredMsg && (
            <div
              role="alert"
              className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xs flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{sessionExpiredMsg}</span>
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="p-3 bg-danger/10 border border-danger/20 rounded-xs flex items-start gap-2.5 text-xs text-danger"
            >
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Logins */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text uppercase tracking-wider">
                Instant Demo Logins (1-Click)
              </span>
              <span className="text-[11px] text-accent font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready to explore
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Project Lead */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('lead')}
                disabled={Boolean(demoLoggingIn) || isSubmitting}
                className="w-full text-left p-3 rounded-sm border border-border hover:border-primary/40 bg-surface-raised/40 hover:bg-surface-raised transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                        Elena Rostova
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-2xs font-mono font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      lead@projectcamp.dev • Full org permissions, settings, delete
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xs font-medium flex items-center gap-1">
                  <span>{demoLoggingIn === 'lead' ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Expedition Guide */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('guide')}
                disabled={Boolean(demoLoggingIn) || isSubmitting}
                className="w-full text-left p-3 rounded-sm border border-border hover:border-primary/40 bg-surface-raised/40 hover:bg-surface-raised transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xs bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                        Marcus Vance
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-2xs font-mono font-medium bg-primary/15 text-primary">
                        Project Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      guide@projectcamp.dev • Project manager, invite members, edit tasks
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xs font-medium flex items-center gap-1">
                  <span>{demoLoggingIn === 'guide' ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Field Researcher */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('member')}
                disabled={Boolean(demoLoggingIn) || isSubmitting}
                className="w-full text-left p-3 rounded-sm border border-border hover:border-primary/40 bg-surface-raised/40 hover:bg-surface-raised transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xs bg-surface-raised text-text-muted flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                        Tariq Chen
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-2xs font-mono font-medium bg-surface-raised text-text-muted">
                        Member
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      member@projectcamp.dev • Waypoint updates, subtasks, notes
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xs font-medium flex items-center gap-1">
                  <span>{demoLoggingIn === 'member' ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[11px] text-text-muted uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@team.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-xs text-text-muted hover:text-text hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Password123!"
                required
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting || Boolean(demoLoggingIn)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Sign In to Project Camp
            </Button>
          </form>

          <div className="pt-3 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-medium text-text hover:underline transition-colors"
              >
                Join an expedition / Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
