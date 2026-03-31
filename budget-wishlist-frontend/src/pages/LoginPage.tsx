import { FormEvent, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <main className="app">
      <div className="form" style={{ marginTop: '4rem' }}>
        <div className="budget-title-row" style={{ marginBottom: '1.25rem' }}>
          <span className="budget-title">Sign in</span>
          <Link to="/register" className="btn-edit-budget" style={{ textDecoration: 'none' }}>
            Register instead
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className="error-msg" style={{ marginTop: '10px' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button className="btn-add" type="submit" disabled={isLoading}>
              {isLoading ? 'Please wait...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
