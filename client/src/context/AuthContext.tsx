import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '../types';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../services/authService';
import { setAccessToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, workspaceName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('../services/authService').then(({ refreshToken }) =>
      refreshToken()
        .then((token) => {
          setAccessToken(token);
          import('../services/api').then(({ api }) =>
            api.get('/auth/me').then((res) => setUser(res.data.data.user)).catch(() => null)
          );
        })
        .catch(() => null)
        .finally(() => setIsLoading(false))
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, workspaceName: string) => {
    const data = await registerApi({ email, password, name, workspaceName });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setAccessToken(null);
    setUser(null);
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
