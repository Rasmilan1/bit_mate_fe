import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { GraduationCap, User, LogOut, Cloud, HardDrive, Smartphone, Monitor } from 'lucide-react';

export default function Header({ isSupabaseConnected }) {
  const { user, setShowAuthModal, logout } = useAuth();

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 clamp(12px, 3vw, 32px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--glow-primary)',
          flexShrink: 0
        }}>
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 800, background: 'linear-gradient(90deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
            BITMATE
          </h1>
        </div>
      </div>

      {/* User Profile & Auth Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '8px' }}
            >
              <User size={16} />
              {user.name}
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', color: 'var(--text-muted)' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem', gap: '6px' }}>
            <User size={16} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
