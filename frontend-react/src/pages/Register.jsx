import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, Mail, Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel p-5 animate-fade-in" style={{ width: '100%', maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-4 mb-3 text-white justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>
            <Activity size={32} />
          </div>
          <h2 className="text-gradient-purple mb-1">Create Account</h2>
          <p className="text-secondary small">Begin tracking physical & mental health early</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 d-flex align-items-center gap-2 py-3 px-3 mb-4 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
            <AlertCircle size={18} className="flex-shrink-0" />
            <div className="small fw-semibold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-bold font-title">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary" style={{ opacity: 0.5, borderColor: 'var(--glass-border) !important', color: 'var(--text-primary)' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                className="form-control form-control-premium border-start-0"
                placeholder="Pick a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-bold font-title">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary" style={{ opacity: 0.5, borderColor: 'var(--glass-border) !important', color: 'var(--text-primary)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control form-control-premium border-start-0"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-bold font-title">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary" style={{ opacity: 0.5, borderColor: 'var(--glass-border) !important', color: 'var(--text-primary)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control form-control-premium border-start-0"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small fw-bold font-title">Account Role</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary" style={{ opacity: 0.5, borderColor: 'var(--glass-border) !important', color: 'var(--text-primary)' }}>
                <Shield size={18} />
              </span>
              <select
                className="form-select form-select-premium border-start-0"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">Standard User (Dashboard & Predictor)</option>
                <option value="ADMIN">System Administrator (Full Analytics)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-premium-primary w-100 py-3 mb-3 d-flex justify-content-center align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-secondary small mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-bold text-decoration-none" style={{ color: 'var(--accent-purple)' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
