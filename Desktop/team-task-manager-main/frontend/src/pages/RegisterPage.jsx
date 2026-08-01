import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell d-flex align-items-center justify-content-center px-3 py-5">
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '460px' }}>
        <div className="card-body p-4 p-lg-5">
          <div className="text-center mb-4">
            <div className="brand-badge mx-auto mb-3" style={{ width: '58px', height: '58px', fontSize: '1.1rem' }}>TM</div>
            <h1 className="h3 fw-bold mb-2">Create account</h1>
            <p className="text-muted-soft mb-0">Join your team workspace</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
            <div>
              <label className="form-label fw-semibold small">Full name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="form-label fw-semibold small">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="form-label fw-semibold small">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="form-label fw-semibold small">Role</label>
              <select
                className="form-select form-select-lg"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted-soft">
            Already have an account?{' '}
            <Link to="/login" className="fw-semibold text-primary">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}