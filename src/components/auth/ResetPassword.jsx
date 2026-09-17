import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import loginBackground from '../../assets/login-background.jpg';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid or expired reset token. Please request a new password reset.');
        } else if (response.status === 404) {
          throw new Error('User not found. Please contact support.');
        } else {
          throw new Error(data.detail || 'Failed to reset password. Please try again.');
        }
      }

      // Success
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .form-panel {
          animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
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
        .rp-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
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
      `}</style>

      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', background: '#fafafa' }}>
        <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr' }}>
          <div style={{ display: 'contents' }} className="md-grid">

            {/* Left Panel */}
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
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.52) 100%)',
                borderRadius: '0 20px 20px 0',
              }} />

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

            {/* Right Panel */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', padding: '40px 24px',
              gridColumn: '1 / -1',
            }}
              className="right-panel"
            >
              <div style={{ width: '100%', maxWidth: 360 }}>

                {success ? (
                  <div className="form-panel" style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f0f0f', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                      Password Reset Successful!
                    </h2>
                    <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px', lineHeight: 1.6 }}>
                      Your password has been reset successfully. You can now login with your new password.
                    </p>

                    <div className="rp-success" style={{ marginBottom: 16 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="1.8" />
                        <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p style={{ fontSize: 13, color: '#15803d', margin: 0, fontWeight: 500 }}>
                        Redirecting to login page...
                      </p>
                    </div>
                  </div>
                ) : (
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
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: '#f5f5f5', border: '1.5px solid #e8e8e8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                        Reset your password
                      </h2>
                      <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontWeight: 500 }}>
                        Enter your new password below
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
                      {/* New Password */}
                      <div>
                        <label className="rp-label" htmlFor="password">New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="password"
                            className="rp-input has-icon"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter new password"
                            disabled={!token}
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

                      {/* Confirm Password */}
                      <div>
                        <label className="rp-label" htmlFor="confirmPassword">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="confirmPassword"
                            className="rp-input has-icon"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm new password"
                            disabled={!token}
                          />
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
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
                        <button type="submit" className="rp-btn-primary" disabled={loading || !token}>
                          {loading ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite" />
                                </path>
                              </svg>
                              Resetting...
                            </>
                          ) : 'Reset Password'}
                        </button>
                      </div>
                    </form>

                    {/* Footer */}
                    <p style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#ccc', fontWeight: 500, letterSpacing: '0.02em' }}>
                      © 2025 ANPR System · All rights reserved
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

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

export default ResetPassword;
