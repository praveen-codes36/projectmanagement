import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/AuthProvider';
import { authService } from '../../api/services/auth';
import { Button, Input, Badge, Avatar } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { evaluatePasswordStrength } from '../../lib/password';
import { formatDate } from '../../lib/utils';
import { KeyRound, Mail, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPass = watch('newPassword') || '';
  const strength = evaluatePasswordStrength(newPass);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const res = await authService.resendEmailVerification();
      toast.success(res.message || 'Verification email dispatched.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setChangePasswordError(null);
    try {
      const res = await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success(res.message || 'Password successfully updated.');
      reset();
    } catch (err: any) {
      const msg = err.message || 'Failed to change password. Verify your current password.';
      setChangePasswordError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold font-display tracking-tight text-text">Account Profile</h1>
        <p className="text-xs text-text-muted">
          Manage your expedition credentials, email verification, and security settings.
        </p>
      </div>

      {/* User Details Card */}
      <div className="p-6 border border-border rounded-md bg-surface space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar nameOrEmail={user?.username || user?.email} size="lg" />
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-text">{user?.username}</h2>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.isEmailVerified ? (
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                Verified Email
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="warning">Unverified Email</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isResending}
                  onClick={handleResendVerification}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resend Link
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
          <div>
            <span className="text-text-muted">User ID</span>
            <p className="font-mono text-text mt-0.5 select-all">{user?.id || '—'}</p>
          </div>
          <div>
            <span className="text-text-muted">Member Since</span>
            <p className="font-mono text-text mt-0.5">{formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 border border-border rounded-md bg-surface space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-text">Change Password</h2>
        </div>

        {changePasswordError && (
          <div
            role="alert"
            className="p-3 bg-danger/10 border border-danger/20 rounded-xs flex items-start gap-2 text-xs text-danger"
          >
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <span>{changePasswordError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            error={errors.oldPassword?.message}
            {...register('oldPassword')}
          />

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

            {newPass.length > 0 && (
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
            placeholder="Repeat new password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Session / Danger Zone */}
      <div className="p-6 border border-danger/20 rounded-md bg-danger/5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-danger">Sign Out</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Conclude your current expedition session on this workstation.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
