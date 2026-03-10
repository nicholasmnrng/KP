import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!nama || !password) {
      setError('Nama dan password harus diisi');
      setIsLoading(false);
      return;
    }

    if (login(nama, password)) {
      navigate('/');
    } else {
      setError('Nama atau password salah');
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '16px',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'var(--accent-blue)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <LogIn size={32} style={{ color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
          }}>
            IPMS SHOREBASE
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-dim)',
            margin: '0',
          }}>
            Sistem Informasi Lemburan
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Nama Input */}
            <div style={{
              marginBottom: '16px',
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Nama Pengguna
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama pengguna"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'var(--transition)',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-blue)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{
              marginBottom: '24px',
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'var(--transition)',
                  boxSizing: 'border-box',
                }}
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-blue)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: isLoading ? 'var(--accent-blue-dim)' : 'var(--accent-blue)',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-blue-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-blue)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <span>⏳</span>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-dim)',
          marginTop: '24px',
          margin: '24px 0 0 0',
        }}>
          © 2026 IPMS SHOREBASE. All rights reserved.
        </p>
      </div>
    </div>
  );
}
