import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, GOOGLE_LOGIN_URL } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import {
  isNameValid,
  isRestrictedEmailValid,
  sanitizeEmailInput,
  sanitizeNameInput,
} from '../utils/formValidation';

/**
 * Signup page with email/password registration form AND Google OAuth2 option.
 */
export default function SignupPage() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    if (name === 'name') {
      nextValue = sanitizeNameInput(value);
    } else if (name === 'email') {
      nextValue = sanitizeEmailInput(value);
    }

    setForm({ ...form, [name]: nextValue });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid(form.name)) {
      setError('Name can only contain letters and spaces');
      return;
    }

    if (!isRestrictedEmailValid(form.email)) {
      setError('Email can only contain letters, numbers, @ and .');
      return;
    }

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3B82F6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#1F2937] bg-[#111827] p-10 shadow-2xl shadow-black/40">
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#10B981]/20 blur-[80px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-[80px]"
          aria-hidden
        />

        <div className="relative">
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10B981] text-xl font-bold text-white shadow-[0_0_32px_rgba(16,185,129,0.5)]">
            SC
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create account
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Join the Smart Campus Operations Hub
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] outline-none transition-colors focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="Your email"
                className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] outline-none transition-colors focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] outline-none transition-colors focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <div>
              <label htmlFor="signup-confirm" className="mb-1.5 block text-sm font-medium text-[#CBD5E1]">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-[#64748B] outline-none transition-colors focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
              />
            </div>
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#10B981] px-6 py-3 text-base font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1F2937]" />
            <span className="text-xs font-medium text-[#64748B]">OR</span>
            <div className="h-px flex-1 bg-[#1F2937]" />
          </div>

          {/* Google Signup Button */}
          <button
            id="google-signup-btn"
            onClick={handleGoogleSignup}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#334155] bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#10B981]/50 hover:bg-white/[0.07] hover:shadow-[0_0_24px_rgba(16,185,129,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#3B82F6] transition-colors hover:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
