import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../../lib/api';
import type { User } from '../../types';
import { Button, FieldError, Input, Label } from '../../components/ui';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password should be at least 8 characters'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password should be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface LoginPageProps {
  onAuthenticated: (user: User) => void;
}

export default function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const errors = mode === 'login' ? loginForm.formState.errors : signupForm.formState.errors;
  const registerEmail = mode === 'login' ? loginForm.register('email') : signupForm.register('email');
  const registerPassword = mode === 'login' ? loginForm.register('password') : signupForm.register('password');

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await authApi.login(values.email, values.password);
      localStorage.setItem('pa_token', response.data.token);
      localStorage.setItem('pa_user', JSON.stringify(response.data.user));
      onAuthenticated(response.data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await authApi.register(values.full_name, values.email, values.password);
      localStorage.setItem('pa_token', response.data.token);
      localStorage.setItem('pa_user', JSON.stringify(response.data.user));
      onAuthenticated(response.data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = mode === 'login' ? loginForm.handleSubmit(onLoginSubmit) : signupForm.handleSubmit(onSignupSubmit);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.1),_transparent_55%)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12">
            <div className="pointer-events-none absolute inset-0 bg-grid-slate bg-[length:32px_32px] opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]" />
            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Procurement</p>
                  <p className="text-lg font-semibold">Public Health Auditor</p>
                </div>
              </div>

              <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Detect anomalies before public funds leave the system.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Monitor contract pricing against KEMSA benchmarks and surface suspicious purchases in one secure workspace.
              </p>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-slate-100">Why teams trust this workspace</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Real-time risk scoring for every contract.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Secure JWT-based access and role-aware routing.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Audit-ready workflow for procurement review.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="px-8 py-10 sm:px-10 lg:px-12">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Secure access</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">Access contracts, alerts, and governance views.</p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    leftIcon={<UserIcon className="h-4 w-4" />}
                    placeholder="Jane Auditor"
                    invalid={Boolean(signupForm.formState.errors.full_name)}
                    {...signupForm.register('full_name')}
                  />
                  <FieldError>{signupForm.formState.errors.full_name?.message}</FieldError>
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  placeholder="auditor@health.go.ke"
                  invalid={Boolean(errors.email)}
                  {...registerEmail}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Enter your password"
                  invalid={Boolean(errors.password)}
                  rightSlot={
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="pointer-events-auto text-slate-400 transition hover:text-slate-600"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  {...registerPassword}
                />
                <FieldError>{errors.password?.message}</FieldError>
              </div>

              {error ? (
                <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <Button type="submit" variant="secondary" size="lg" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Sign up'}
              </Button>
            </form>

            <button
              type="button"
              className="mt-5 w-full text-center text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
                setError('');
              }}
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-600">
              Demo credentials: <span className="font-semibold text-slate-900">jane.auditor@health.go.ke</span> /{' '}
              <span className="font-semibold text-slate-900">password123</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

