import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell d-flex align-items-center justify-content-center px-3 py-5">
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '430px' }}>
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <div className="brand-badge mx-auto mb-3" style={{ width: '58px', height: '58px', fontSize: '1.1rem' }}>TM</div>
            <h1 className="h3 fw-bold mb-2">Welcome back</h1>
            <p className="text-muted-soft mb-0">Sign in to your workspace</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label className="form-label fw-semibold small">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="form-label fw-semibold small">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted-soft">
            Don’t have an account?{' '}
            <Link to="/register" className="fw-semibold text-primary">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}