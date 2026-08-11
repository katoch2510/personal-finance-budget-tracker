import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Lock, Eye, EyeOff, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Missing reset token. Please check your reset link.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Set New Password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Enter your reset token and new password below
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Password Updated!</h2>
              <p className="text-sm text-slate-300">
                Your password has been reset successfully. Redirecting to login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Reset Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-12 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center border-t border-slate-800/80 pt-6">
                <Link
                  to="/auth/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
