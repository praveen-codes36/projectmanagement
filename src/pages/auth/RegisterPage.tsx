import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../api/services/auth';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { evaluatePasswordStrength } from '../../lib/password';
import { Mountain, MailCheck, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or fewer')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, underscores, and dashes only'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
    },
  });

  const currentPassword = watch('password') || '';
  const strength = evaluatePasswordStrength(currentPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await authService.register(data);
      setRegisteredEmail(data.email);
      toast.success(res.message || 'Account created successfully!');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await authService.resendEmailVerification();
      toast.success(res.message || 'Verification email resent successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-text">
            Project Camp
          </span>
        </Link>
        <h1 className="text-center text-xl font-bold tracking-tight text-text font-display">
          Create Your Base Camp Account
        </h1>
        <p className="mt-1 text-center text-xs text-text-muted">
          Join your team to plan project waypoints, assign roles, and share field notes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-xs border border-border rounded-md sm:px-10 space-y-6">
          {registeredEmail ? (
            /* Success confirmation with resend option */
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-text">Verify your email address</h2>
                <p className="text-xs text-text-muted">
                  We sent a confirmation link to{' '}
                  <span className="font-semibold text-text">{registeredEmail}</span>. Click the link
                  in the email to activate your account.
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  isLoading={isResending}
                  onClick={handleResend}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resend verification email
                </Button>

                <Link to="/login" className="block text-xs font-medium text-text hover:underline">
                  Proceed to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {serverError && (
                <div
                  role="alert"
                  className="p-3 bg-danger/10 border border-danger/20 rounded-xs flex items-start gap-2.5 text-xs text-danger"
                >
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="alex@team.com"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Username"
                  autoComplete="username"
                  placeholder="alex_camp"
                  required
                  error={errors.username?.message}
                  helperText="Unique team identifier"
                  {...register('username')}
                />

                <div className="space-y-1.5">
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  {/* Password Strength Meter */}
                  {currentPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Password strength:</span>
                        <span className="font-medium text-text">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-raised rounded-xs overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 transition-all ${
                              step <= strength.score ? strength.color : 'bg-border/60'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.feedback.length > 0 && (
                        <p className="text-[11px] text-text-muted">{strength.feedback[0]}</p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Create Account
                </Button>
              </form>

              <div className="pt-4 border-t border-border text-center">
                <p className="text-xs text-text-muted">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-text hover:underline transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
