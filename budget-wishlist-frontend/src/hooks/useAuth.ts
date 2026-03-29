import { useState } from 'react';
import { authApi } from '../api/authApi';

const TOKEN_KEY = 'wl_token';
const USERNAME_KEY = 'wl_username';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(getToken);
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem(USERNAME_KEY)
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const persist = (t: string, u: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USERNAME_KEY, u);
    setToken(t);
    setUsername(u);
    setError(null);
  };

  const register = async (usr: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(usr, email, password);
      persist(data.token, data.username);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      persist(data.token, data.username);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  };

  return { token, username, error, isLoading, register, login, logout };
};
