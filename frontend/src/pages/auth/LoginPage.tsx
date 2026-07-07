import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '../../lib/api';
import type { User } from '../../types';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password should be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

interface LoginPageProps {
  onAuthenticated: (user: User) => void;
}

export default function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.09),_transparent_55%)] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-soft"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/90">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-slate-400 uppercase">Procurement</p>
                <p className="text-xl font-semibold">Public Health Auditor</p>
              </div>
            </div>

            <h1 className="max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              Detect anomalies before public funds leave the system.
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-300">
              Monitor contract pricing against KEMSA benchmarks and surface suspicious purchases in one secure workspace.
            </p>

            <div className="mt-10 rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-slate-100">Why teams trust this workspace</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Real-time risk scoring for every contract.</li>
                <li>• Secure JWT-based access and role-aware routing.</li>
                <li>• Audit-ready workflow for procurement review.</li>
              </ul>
            </div>
          </div>

          <div className="px-8 py-10 sm:px-10 lg:px-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Secure access</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sign in to your workspace</h2>
              <p className="mt-2 text-sm text-slate-500">Access contracts, alerts, and governance views.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="auditor@health.go.ke"
                  {...register('email')}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Demo access uses the same credentials that the backend expects from your existing auth endpoints.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
