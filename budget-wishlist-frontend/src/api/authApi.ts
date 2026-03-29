const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
}

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
};

export const authApi = {
  register: (username: string, email: string, password: string): Promise<AuthResponse> =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }).then(handleResponse),

  login: (email: string, password: string): Promise<AuthResponse> =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),
};
