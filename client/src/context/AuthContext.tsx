import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, workspaceName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'sc_demo_user';

const DEMO_ADMIN: User = {
  id: 'demo-admin-001',
  email: 'admin@socialconnect.demo',
  name: 'Demo Admin',
  role: 'ADMIN',
  avatarUrl: undefined,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  };

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (email === DEMO_ADMIN.email) {
      persist(DEMO_ADMIN);
    } else {
      persist({ ...DEMO_ADMIN, id: `demo-${Date.now()}`, email, name: email.split('@')[0] });
    }
  }, []);

  const register = useCallback(async (email: string, _password: string, name: string, _workspaceName: string) => {
    await new Promise((r) => setTimeout(r, 800));
    persist({ id: `demo-${Date.now()}`, email, name, role: 'ADMIN' });
  }, []);

  const logout = useCallback(async () => {
    persist(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
