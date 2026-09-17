import { useState } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import loginBackground from '../../assets/login-background.jpg';

const Login = ({ onLoginSuccess }) => {
  const { login } = useAccessControl();
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'

  // Login state
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        if (response.status === 404) {
          throw new Error('No account found with this email address.');
        } else if (response.status === 403) {
          throw new Error('This account is disabled. Please contact support.');
        } else {
          throw new Error(data.detail || 'Unable to send reset email. Please try again.');
        }
      }

      // Success - show sent view
      setView('sent');
    } catch (err) {
      // Handle network errors
      if (err.message === 'Failed to fetch') {
        setResetError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setResetError(err.message || 'Unable to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .form-panel {
          animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .panel-switch {
          animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .rp-input {
          width: 100%;
          padding: 11px 14px;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 14px;
          color: #111827;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .rp-input::placeholder { color: #9ca3af; }
        .rp-input:hover { border-color: #111; background: #fafafa; }
        .rp-input:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
          background: #fff;
        }
        .rp-input.has-icon { padding-right: 44px; }
        .rp-btn-primary {
          width: 100%;
          padding: 12px;
          background: #111;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .rp-btn-primary:hover:not(:disabled) {
          background: #000;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }
        .rp-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .rp-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .rp-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: 0.005em;
        }
        .rp-error {
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .divider {
          height: 1px;
          background: #f0f0f0;
          margin: 0;
        }
        .success-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          color: #9ca3af;
          transition: color 0.2s;
        }
        .icon-btn:hover { color: #111; }
        .link-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
          color: #111;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .link-btn:hover { opacity: 0.7; }
        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
          margin-bottom: 28px;
        }
        .back-btn:hover { color: #111; }
      `}</style>

      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', background: '#fafafa' }}>
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr', }}>
          <div style={{ display: 'contents' }} className="md-grid">

            {/* ── Left Panel ── */}
            <div style={{
              display: 'none',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0 20px 20px 0',
            }}
              className="left-panel"
            >
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${loginBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '0 20px 20px 0',
              }} />
              {/* subtle gradient overlay — darkens bottom for any caption */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 100%)',
                borderRadius: '0 20px 20px 0',
              }} />



              {/* Bottom caption */}
              <div style={{ position: 'absolute', bottom: 36, left: 36, right: 36 }}>
                <p style={{
                  color: 'rgba(255,255,255,0.9)', fontSize: 22, fontWeight: 600,
                  lineHeight: 1.35, margin: '0 0 8px', letterSpacing: '-0.02em',
                }}>
                  Real-time road intelligence<br />at your fingertips
                </p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0, fontWeight: 400 }}>
                  Powered by Transline Technologies
                </p>
              </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', padding: '40px 24px',
              gridColumn: '1 / -1',
            }}
              className="right-panel"
            >
              <div style={{ width: '100%', maxWidth: 360 }}>

                {/* ════ LOGIN VIEW ════ */}
                {view === 'login' && (
                  <div className="form-panel">
                    {/* Logo */}
                    <div style={{ marginBottom: 36 }}>
                      <h1 className="text-3xl tracking-tight" style={{ fontFamily: "'Audiowide', sans-serif", margin: 0 }}>
                        <span style={{ color: '#111' }}>Road</span>
                        <span style={{ color: '#111', marginLeft: '-6px' }}>Pulse</span>
                      </h1>
                      <div className="text-[9px] font-medium text-gray-400 tracking-wide -mt-1">
                        Powered by Transline Technologies
                      </div>
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                        Welcome back
                      </h2>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 500 }}>
                        Sign in to your dashboard
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="rp-error" style={{ marginBottom: 16 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8" />
                          <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p style={{ fontSize: 13, color: '#b91c1c', margin: 0, fontWeight: 500 }}>{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="rp-label" htmlFor="username">Username</label>
                        <input
                          id="username"
                          className="rp-input"
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          autoComplete="username"
                          placeholder="Enter your username"
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label className="rp-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                          <button type="button" className="link-btn" onClick={() => { setView('forgot'); setError(''); }}>
                            Forgot password?
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="password"
                            className="rp-input has-icon"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <button type="submit" className="rp-btn-primary" disabled={loading}>
                          {loading ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite" />
                                </path>
                              </svg>
                              Signing in…
                            </>
                          ) : 'Sign In'}
                        </button>
                      </div>
                    </form>

                    {/* Footer */}
                    <p style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#ccc', fontWeight: 500, letterSpacing: '0.02em' }}>
                      © 2025 ANPR System · All rights reserved
                    </p>
                  </div>
                )}

                {/* ════ FORGOT PASSWORD VIEW ════ */}
                {view === 'forgot' && (
                  <div className="panel-switch">
                    <button 
                      className="back-btn" 
                      onClick={() => { setView('login'); setResetError(''); setResetEmail(''); }}
                      style={{
                        background: 'none',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        fontSize: 13,
                        color: '#374151',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        marginBottom: 28,
                        borderRadius: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#111';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      Back to sign in
                    </button>

                    {/* Logo */}
                    <div style={{ marginBottom: 28 }}>
                      <h1 className="text-3xl tracking-tight" style={{ fontFamily: "'Audiowide', sans-serif", margin: 0 }}>
                        <span style={{ color: '#111' }}>Road</span>
                        <span style={{ color: '#111', marginLeft: '-6px' }}>Pulse</span>
                      </h1>
                      <div className="text-[9px] font-medium text-gray-400 tracking-wide -mt-1">
                        Powered by Transline Technologies
                      </div>
                    </div>

                    <div style={{ marginBottom: 28 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: '#f5f5f5', border: '1.5px solid #e8e8e8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', margin: '0 0 6px', letterSpacing: '-0.025em' }}>
                        Reset your password
                      </h2>
                      <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.55 }}>
                        Enter your registered email address and we'll send you a reset link.
                      </p>
                    </div>

                    {resetError && (
                      <div className="rp-error" style={{ marginBottom: 16 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8" />
                          <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p style={{ fontSize: 13, color: '#b91c1c', margin: 0, fontWeight: 500 }}>{resetError}</p>
                      </div>
                    )}

                    <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label className="rp-label" htmlFor="reset-email">Email address</label>
                        <input
                          id="reset-email"
                          className="rp-input"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <button type="submit" className="rp-btn-primary" disabled={resetLoading}>
                          {resetLoading ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite" />
                                </path>
                              </svg>
                              Sending…
                            </>
                          ) : 'Send Reset Link'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ════ EMAIL SENT VIEW ════ */}
                {view === 'sent' && (
                  <div className="panel-switch" style={{ textAlign: 'center' }}>
                    <div className="success-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                      Check your inbox
                    </h2>
                    <p style={{ fontSize: 14, color: '#888', margin: '0 0 6px', lineHeight: 1.6 }}>
                      We've sent a password reset link to
                    </p>
                    <p style={{ fontSize: 14, color: '#111', fontWeight: 600, margin: '0 0 28px', wordBreak: 'break-all' }}>
                      {resetEmail}
                    </p>

                    <div className="divider" style={{ marginBottom: 24 }} />

                    <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>
                      Didn't receive it?{' '}
                      <button
                        type="button"
                        className="link-btn"
                        style={{ fontSize: 13, fontWeight: 600 }}
                        onClick={() => { setView('forgot'); setResetEmail(''); }}
                      >
                        Try again
                      </button>
                    </p>

                    <button
                      type="button"
                      className="rp-btn-primary"
                      onClick={() => { setView('login'); setResetEmail(''); }}
                    >
                      Back to sign in
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive grid styles injected via a style tag — avoids Tailwind dependency for the layout */}
      <style>{`
        @media (min-width: 768px) {
          .md-grid {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
            width: 100%;
            height: 100%;
          }
          .left-panel  { display: block !important; }
          .right-panel {
            grid-column: auto !important;
            padding: 40px 48px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Login;