import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { X, Lock, Mail, UserCheck } from 'lucide-react';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res && !res.success) {
        setError(res.error || 'Invalid admin credentials.');
      }
    } catch (err) {
      setError('An error occurred while signing in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        position: 'relative',
        background: '#ffffff'
      }}>
        <button
          onClick={() => {
            setError('');
            setShowAuthModal(false);
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            Sign In to Study Hub
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Enter your admin credentials to manage semesters, subjects, and PDFs
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            fontSize: '0.85rem',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="admin@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', opacity: submitting ? 0.7 : 1 }}
          >
            <UserCheck size={18} />
            {submitting ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
