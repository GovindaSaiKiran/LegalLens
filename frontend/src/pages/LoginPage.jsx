import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google Sign-In failed or was cancelled.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address above to receive a password reset link.');
      return;
    }
    setError(null);
    try {
      await resetPassword(email);
      setInfoMessage(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      try {
        await login('demo@legallens.in', 'Password123');
      } catch {
        await registerUser({ name: 'Demo Legal User', email: 'demo@legallens.in', password: 'Password123' });
        await login('demo@legallens.in', 'Password123');
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Could not initialize demo login. Please register a quick account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-neo-yellow border-2 border-black text-black flex items-center justify-center mx-auto shadow-neo-sm">
            <Scale className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">
            {t('auth.signInTitle', 'Sign In to LegalLens')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold">
            {t('auth.signInSubtitle', 'Access your saved contract reports and statutory inquiries.')}
          </p>
        </div>

        {/* Google Sign-In & Demo Login Pills */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-black border-3 border-black font-black uppercase text-xs transition flex items-center justify-center gap-2.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{googleLoading ? t('auth.signingIn', 'Connecting to Google...') : t('auth.googleSignIn', 'Continue with Google')}</span>
          </button>

          <div className="p-3 rounded-2xl bg-neo-yellow/30 border-2 border-black text-center shadow-neo-sm">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || googleLoading}
              className="w-full py-2 px-4 rounded-xl bg-neo-yellow text-black border-2 border-black font-black uppercase text-xs transition flex items-center justify-center gap-2 shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{t('auth.guestBtn', '1-Click Sign In as Demo User')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-0.5 bg-black/20"></div>
          <span className="text-[11px] font-black uppercase font-mono text-black/60">{t('auth.orEmail', 'Or with Email')}</span>
          <div className="flex-1 h-0.5 bg-black/20"></div>
        </div>

        <div className="bg-white rounded-2xl border-3 border-black shadow-neo-md p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-neo-coral/20 border-2 border-black text-black text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-xl bg-neo-green/20 border-2 border-black text-black text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5] text-green-700" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black text-sm font-semibold bg-white text-black shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-black">
                  {t('auth.password', 'Password')}
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-extrabold text-black hover:underline cursor-pointer"
                >
                  {t('auth.forgotPassword', 'Forgot Password?')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black text-sm font-semibold bg-white text-black shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-xl bg-neo-yellow text-black border-2 border-black font-black uppercase text-sm shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{t('auth.signingIn', 'Signing In...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.loginBtn', 'Sign In')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs font-bold text-slate-800 pt-2">
            <Link to="/register" className="text-black underline font-black hover:bg-neo-yellow">
              {t('auth.noAccount', "Don't have an account? Sign up")}
            </Link>
          </div>
        </div>

        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
}
