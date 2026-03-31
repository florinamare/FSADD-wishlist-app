import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../api/authApi';

const TOKEN_KEY = 'wl_token';
const USERNAME_KEY = 'wl_username';
const USER_ID_KEY = 'wl_user_id';

export interface User {
  username: string;
  userId: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken);
  const [user, setUser] = useState<User | null>(() => {
    const username = localStorage.getItem(USERNAME_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);
    return username && userId ? { username, userId } : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const persist = (t: string, username: string, userId: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(USER_ID_KEY, userId);
    setToken(t);
    setUser({ username, userId });
    setError(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      persist(data.token, data.username, data.userId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(username, email, password);
      persist(data.token, data.username, data.userId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, error, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
