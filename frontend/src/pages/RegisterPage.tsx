import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { registerRequest } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/dashboard');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ name, email, password });
  }

  const errorMessage =
    (mutation.error as any)?.response?.data?.error ?? mutation.error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Abyss<span className="text-[var(--color-accent)]">ERP</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl p-6 space-y-4"
        >
          {errorMessage && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]
                         px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]
                         px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)]
                         px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-[var(--color-accent)] text-black font-semibold text-sm
                       py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-xs text-[var(--color-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-accent)] font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
