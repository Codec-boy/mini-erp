import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ShieldCheck, ShoppingBag, Truck, Receipt } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Login failed. Could not reach backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
    setLoading(true);
    setError(null);
    try {
      await login(userEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Quick login failed. Could not connect to backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#f1f5f9',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-badge" style={{ margin: '0 auto 1rem', width: '52px', height: '52px' }}>
            <Building2 size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Operations Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Mini ERP + CRM Enterprise Suite
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              border: '1px solid var(--color-danger-border)',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@minierp.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating Session...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo 1-Click Role Login
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickLogin('admin@minierp.com')}>
              <ShieldCheck size={14} color="#dc2626" /> Admin
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickLogin('sales@minierp.com')}>
              <ShoppingBag size={14} color="#2563eb" /> Sales
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickLogin('warehouse@minierp.com')}>
              <Truck size={14} color="#b45309" /> Warehouse
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleQuickLogin('accounts@minierp.com')}>
              <Receipt size={14} color="#16a34a" /> Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
