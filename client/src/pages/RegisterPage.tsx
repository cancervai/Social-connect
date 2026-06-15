import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Zap } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.workspaceName);
      navigate('/onboarding');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? 'Registration failed. Please try again.');
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

        <div className="bg-surface border border-border rounded-xl p-6 shadow-surface">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary mb-6">Start your free workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="Jane Smith" value={form.name} onChange={set('name')} icon={<User size={14} />} required />
            <Input label="Workspace name" placeholder="Acme Corp" value={form.workspaceName} onChange={set('workspaceName')} icon={<Building2 size={14} />} required />
            <Input label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} icon={<Mail size={14} />} required />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
              icon={<Lock size={14} />}
              error={error || undefined}
              hint="At least 8 characters"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-purple-light hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
