import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../../api/services/auth';
import { Button } from '../../components/ui';
import { Mountain, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function runVerification() {
      if (!token) {
        setStatus('error');
        setMessage('Missing or invalid email verification token.');
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          setMessage(res.message || 'Your email address has been successfully verified.');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'Verification link expired or already used. Please request a new one.');
        }
      }
    }

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

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
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-xs border border-border rounded-md sm:px-10 text-center space-y-5">
          {status === 'loading' && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <h1 className="text-base font-semibold text-text">Verifying Credentials</h1>
              <p className="text-xs text-text-muted">
                Communicating with base camp to confirm your verification token...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-base font-semibold text-text">Email Confirmed</h1>
                <p className="text-xs text-text-muted">{message}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <Link to="/login">
                  <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Continue to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-sm bg-danger/10 border border-danger/20 text-danger mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-base font-semibold text-text">Verification Incomplete</h1>
                <p className="text-xs text-danger">{message}</p>
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Proceed to Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
