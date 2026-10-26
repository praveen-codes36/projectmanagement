import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../api/services/auth';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { evaluatePasswordStrength } from '../../lib/password';
import { Mountain, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('newPassword') || '';
  const strength = evaluatePasswordStrength(currentPassword);

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      setServerError('Invalid or missing password recovery token.');
      return;
    }

    setServerError(null);
    try {
      const res = await authService.resetPassword(token, { newPassword: data.newPassword });
      setIsSuccess(true);
      toast.success(res.message || 'Password has been reset successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to reset password. The token may be expired or invalid.';
      setServerError(msg);
      toast.error(msg);
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
          Establish New Password
        </h1>
        <p className="mt-1 text-center text-xs text-text-muted">
          Create a strong password to secure your project workspaces.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-xs border border-border rounded-md sm:px-10 space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-text">Password Reset Complete</h2>
                <p className="text-xs text-text-muted">
                  Your credentials have been securely updated. You can now log in with your new password.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Link to="/login">
                  <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Proceed to Login
                  </Button>
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
                <div className="space-y-1.5">
                  <Input
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />

                  {currentPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Strength:</span>
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
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Update Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
