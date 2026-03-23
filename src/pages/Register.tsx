import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { register, login, googleLoginUrl } from '@/api/auth';
import { ApiError } from '@/api/client';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 noise">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />

      <div className="absolute top-5 left-5 z-10">
        <ThemeToggle />
      </div>
      <Link
        to="/"
        className="absolute top-5 right-5 p-2 rounded-xl bg-surface-2 border border-border/50 text-fg-muted hover:text-fg-secondary hover:bg-surface-3 transition-colors z-10"
        title="Back to home"
      >
        <X className="w-5 h-5" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <Logo className="justify-center mb-6" />
          </Link>
          <h1 className="text-2xl font-display font-bold text-fg">Create your account</h1>
          <p className="text-sm text-fg-muted mt-1">Start orchestrating AI agents</p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-1 border border-border/60 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              icon={<Lock className="w-4 h-4" />}
              required
              minLength={6}
            />

            <p className="text-xs text-fg-dimmed">
              By signing up, you agree to the{' '}
              <Link to="/terms" className="text-sick-400 hover:text-sick-300">Terms of Use</Link>
              {' '}and{' '}
              <Link to="/policy" className="text-sick-400 hover:text-sick-300">Privacy Policy</Link>.
            </p>

            <Button type="submit" loading={loading} className="w-full group">
              Create account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-fg-dimmed bg-surface-1">or</span>
            </div>
          </div>

          <a href={googleLoginUrl()} className="block">
            <Button variant="secondary" className="w-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </a>
        </div>

        <p className="text-center text-sm text-fg-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sick-400 hover:text-sick-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
