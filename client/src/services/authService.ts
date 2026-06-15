import { api } from './api';
import type { User } from '../types';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  workspaceName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const res = await api.post<{ success: true; data: AuthResponse }>('/auth/register', input);
  return res.data.data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const res = await api.post<{ success: true; data: AuthResponse }>('/auth/login', input);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshToken(): Promise<string> {
  const res = await api.post<{ success: true; data: { accessToken: string } }>('/auth/refresh');
  return res.data.data.accessToken;
}
