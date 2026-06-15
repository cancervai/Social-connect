import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('admin@socialconnect.demo', 'demo');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent-purple flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Social Connect</span>
        </div>

        {/* Demo banner */}
        <div className="mb-4 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-3">
          <p className="text-xs text-accent-cyan font-medium mb-2">Demo Preview — no backend required</p>
          <Button
            type="button"
            variant="secondary"
            className="w-full text-sm"
            loading={loading}
            onClick={handleDemoLogin}
          >
            <Zap size={14} className="mr-2" />
            Enter as Demo Admin
          </Button>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-surface">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-6">Sign in with any email &amp; password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="any password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={14} />}
              error={error || undefined}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-purple-light hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
