import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../api/services/auth';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Mountain, MailCheck, AlertCircle, ArrowLeft, Send } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setServerError(null);
    try {
      const res = await authService.forgotPassword(data);
      setSubmittedEmail(data.email);
      toast.success(res.message || 'Reset link dispatched.');
    } catch (err: any) {
      const msg = err.message || 'Failed to request password reset. Please try again.';
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
          Reset Expedition Credentials
        </h1>
        <p className="mt-1 text-center text-xs text-text-muted">
          Enter your registered email address to receive a secure password recovery token.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-xs border border-border rounded-md sm:px-10 space-y-6">
          {submittedEmail ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                <MailCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-text">Check your inbox</h2>
                <p className="text-xs text-text-muted">
                  If an account exists for <span className="font-semibold text-text">{submittedEmail}</span>,
                  we have sent recovery instructions with a password reset link.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
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
                  label="Registered Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@team.com"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="pt-4 border-t border-border text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text hover:underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
