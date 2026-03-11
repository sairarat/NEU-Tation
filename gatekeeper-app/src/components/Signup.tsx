import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import neuLogo from '../assets/neu_logo_placeholder.png';

const Signup = () => {
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUpNewUser(email, password, firstName, lastName);

      if (result.success) {
        // FIX: Navigate to /complete-profile — role & college_office are not set yet.
        // Sending users to /dashboard directly caused RoleGuard bounce / error page.
        navigate('/complete-profile');
      } else {
        setError(result.error?.message || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: '#f4f6f8',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1a1d21',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#4caf50';
    e.currentTarget.style.background  = '#ffffff';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(76,175,80,0.13)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.background  = '#f4f6f8';
    e.currentTarget.style.boxShadow   = '';
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 700,
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '6px',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        style={{
          background: '#ffffff',
          padding: '40px 38px 36px',
          borderRadius: '28px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)',
          width: '90%',
          maxWidth: '420px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          margin: '20px auto',
        }}
      >

        {/* ── Green accent bar ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            width: '80%',
            height: '3px',
            background: 'linear-gradient(90deg, #4caf50, #81c784)',
            borderRadius: '0 0 6px 6px',
          }}
        />

        {/* ── NEU Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px auto 10px' }}>
          <img
            src={neuLogo}
            alt="New Era University Logo"
            style={{ width: '70px', height: '70px', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* ── Title ── */}
        <h1 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 3px', color: '#111827', letterSpacing: '-0.4px' }}>
          Create Account
        </h1>
        <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 20px', fontWeight: 500 }}>
          Join the NEU Library system
        </p>

        {/* ── Tab switcher ── */}
        <div
          style={{
            display: 'flex',
            background: '#f1f3f4',
            padding: '4px',
            borderRadius: '11px',
            marginBottom: '24px',
          }}
        >
          {/* INACTIVE — Sign In */}
          <Link
            to="/signin"
            style={{
              flex: 1, padding: '9px 8px',
              fontWeight: 600, fontSize: '12px',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: 'transparent',
              color: '#6366f1',
              textDecoration: 'none',
              letterSpacing: '0.1px',
            }}
          >
            <LogIn size={13} strokeWidth={2.5} /> Sign In
          </Link>
          {/* ACTIVE — Sign Up */}
          <div
            style={{
              flex: 1, padding: '9px 8px',
              fontWeight: 700, fontSize: '12px',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: '#ffffff',
              color: '#111827',
              boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
              cursor: 'default',
              letterSpacing: '0.1px',
            }}
          >
            <UserPlus size={13} strokeWidth={2.5} /> Sign Up
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSignup} style={{ width: '100%', textAlign: 'left' }}>

          {/* First / Last name row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <label style={labelStyle}>First Name</label>
              <input
                style={inputBase}
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                style={inputBase}
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              style={inputBase}
              type="email"
              placeholder="name@neu.edu.ph"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          {/* Password with toggle */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputBase, paddingRight: '46px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
              {/* Eye toggle */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: 0,
                  borderRadius: '4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#4caf50'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
              >
                {showPassword
                  ? <EyeOff size={17} strokeWidth={2} />
                  : <Eye    size={17} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Password hint */}
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.5 }}>
            Use at least 8 characters with a mix of letters and numbers.
          </p>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: '9px',
                padding: '9px 12px',
                margin: '10px 0 4px',
              }}
            >
              <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, textAlign: 'center', fontWeight: 500 }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#a5d6a7' : '#4caf50',
              color: 'white',
              padding: '13px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '16px',
              letterSpacing: '0.2px',
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
              boxShadow: loading ? 'none' : '0 3px 10px rgba(76,175,80,0.28)',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background  = '#43a047';
                e.currentTarget.style.transform   = 'translateY(-1px)';
                e.currentTarget.style.boxShadow   = '0 6px 18px rgba(76,175,80,0.32)';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.currentTarget.style.background  = '#4caf50';
                e.currentTarget.style.transform   = '';
                e.currentTarget.style.boxShadow   = '0 3px 10px rgba(76,175,80,0.28)';
              }
            }}
          >
            {loading ? 'Creating Account…' : 'Register Now'}
          </button>
        </form>

        {/* ── Footer ── */}
        <p style={{ marginTop: '20px', fontSize: '11.5px', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: '#4caf50', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;