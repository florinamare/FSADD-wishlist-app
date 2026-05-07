import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../api/authApi';

const TOKEN_KEY = 'wl_token';
const USERNAME_KEY = 'wl_username';
const USER_ID_KEY = 'wl_user_id';
const SHARE_TOKEN_KEY = 'wl_share_token';

export interface User {
  username: string;
  userId: string;
  shareToken: string;
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
  updateUsername: (newUsername: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getToken);
  const [user, setUser] = useState<User | null>(() => {
    const username = localStorage.getItem(USERNAME_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);
    const shareToken = localStorage.getItem(SHARE_TOKEN_KEY);
    return username && userId && shareToken ? { username, userId, shareToken } : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const persist = (t: string, username: string, userId: string, shareToken: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USERNAME_KEY, username);
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(SHARE_TOKEN_KEY, shareToken);
    setToken(t);
    setUser({ username, userId, shareToken });
    setError(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      persist(data.token, data.username, data.userId, data.shareToken);
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
      persist(data.token, data.username, data.userId, data.shareToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = (newUsername: string) => {
    localStorage.setItem(USERNAME_KEY, newUsername);
    setUser((prev) => (prev ? { ...prev, username: newUsername } : null));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(SHARE_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, error, isLoading, login, logout, register, updateUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
