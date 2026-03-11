import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import neuLogo from '../assets/neu_logo_placeholder.png';

const Signin = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signInUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInUser(email, password);

      if (result.success && result.user) {
        await new Promise(res => setTimeout(res, 400));

        const { data: profile } = await supabase
          .from('profiles')
          .select('college_office, role')
          .eq('id', result.user.id)
          .single();

        if (!profile?.college_office) {
          navigate('/complete-profile');
        } else {
          navigate(profile.role === 'admin' ? '/admin-dashboard' : '/dashboard');
        }
      } else {
        setError(result.error || 'Invalid email or password.');
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

        {/* ── Green accent bar at top ── */}
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

        {/* ── Title & subtitle ── */}
        <h1 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 3px', color: '#111827', letterSpacing: '-0.4px' }}>
          NEU Library
        </h1>
        <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 20px', fontWeight: 500 }}>
          Sign in to your account
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
          {/* ACTIVE — Sign In */}
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
            <LogIn size={13} strokeWidth={2.5} /> Sign In
          </div>
          {/* INACTIVE — Sign Up */}
          <Link
            to="/signup"
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
            <UserPlus size={13} strokeWidth={2.5} /> Sign Up
          </Link>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSignin} style={{ width: '100%', textAlign: 'left' }}>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontWeight: 700, fontSize: '11px',
              color: '#6b7280', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase',
            }}>
              Email Address
            </label>
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

          {/* Password */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block', fontWeight: 700, fontSize: '11px',
              color: '#6b7280', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputBase, paddingRight: '46px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e8eaed' }} />
          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.4px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e8eaed' }} />
        </div>

        {/* ── Google ── */}
        <button
          type="button"
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            border: '1.5px solid #e8eaed',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '13.5px',
            color: '#1e293b',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background   = '#f8fafc';
            e.currentTarget.style.borderColor  = '#c7d2de';
            e.currentTarget.style.transform    = 'translateY(-1px)';
            e.currentTarget.style.boxShadow    = '0 3px 8px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background   = 'white';
            e.currentTarget.style.borderColor  = '#e8eaed';
            e.currentTarget.style.transform    = '';
            e.currentTarget.style.boxShadow    = '';
          }}
        >
          {/* Real Google G logo */}
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* ── Footer ── */}
        <p style={{ marginTop: '20px', fontSize: '11.5px', color: '#94a3b8' }}>
          New here?{' '}
          <Link to="/signup" style={{ color: '#4caf50', fontWeight: 700, textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signin;