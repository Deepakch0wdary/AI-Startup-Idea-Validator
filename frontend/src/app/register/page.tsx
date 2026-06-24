'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lightbulb, User, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPlan = searchParams.get('plan') || 'FREE';

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.register({ 
        email, 
        password, 
        name,
        plan: selectedPlan.toUpperCase()
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.googleOAuth({
        googleId: `google_oauth_${Math.random().toString(36).substring(2, 9)}`,
        email: email || 'oauth.user@validator.com',
        name: name || 'Google Founder',
      });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        
        {/* Back Link */}
        <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 w-fit transition-all">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to landing
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl">
              <Lightbulb className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-white">Create Account</h2>
          <p className="text-sm text-gray-400 mt-2">
            Registering for plan: <span className="text-violet-400 font-semibold uppercase">{selectedPlan}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center text-xs text-gray-500">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
          <span className="relative bg-[#0b0f19] px-3">or continue with</span>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Google Workspace</span>
        </button>

        {/* Footer Redirect */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading form...</span>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
