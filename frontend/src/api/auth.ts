import { apiClient, setAuthToken } from './client';

const TOKEN_KEY = 'pharma_dms_token';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  departmentId: string | null;
  fullName: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
  }
}

export function clearAuth() {
  setStoredToken(null);
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
}
