import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, LogIn } from "lucide-react";

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signUpNewUser(email, password, firstName, lastName);

    if (result.success) {
      // FIX: Go to /complete-profile first — the profile row exists but
      // college_office and role haven't been set yet. Sending users directly
      // to /dashboard caused RoleGuard to bounce them around or show errors
      // because the role check returned null.
      navigate('/complete-profile');
    } else {
      alert(result.error?.message || 'Signup failed');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#f1f3f4',
    border: '1.5px solid transparent',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1d21',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#4caf50';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(76,175,80,0.12)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow   = '';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        style={{
          background: '#ffffff',
          padding: '48px 40px',
          borderRadius: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          width: '90%',
          maxWidth: '430px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          margin: '20px auto',
        }}
      >
        <div
          style={{
            background: '#4caf50',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <BookOpen color="white" size={22} strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#1a1d21' }}>
          Create Account
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#f1f3f4',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '16px',
            marginTop: '16px',
          }}
        >
          <Link
            to="/signin"
            style={{
              flex: 1,
              padding: '8px',
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'transparent',
              color: '#6366f1',
              textDecoration: 'none',
              transition: '0.2s',
            }}
          >
            <LogIn size={13} /> Sign In
          </Link>

          <div
            style={{
              flex: 1,
              padding: '8px',
              fontWeight: 600,
              fontSize: '12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#1a1d21',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              cursor: 'default',
              transition: '0.2s',
            }}
          >
            <UserPlus size={13} /> Sign Up
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} style={{ width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <label style={{ fontWeight: 700, fontSize: '12px', color: '#1a1d21' }}>First Name</label>
              <input
                style={inputStyle}
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <label style={{ fontWeight: 700, fontSize: '12px', color: '#1a1d21' }}>Last Name</label>
              <input
                style={inputStyle}
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <label style={{ fontWeight: 700, fontSize: '12px', color: '#1a1d21' }}>Email</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="name@neu.edu.ph"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <label style={{ fontWeight: 700, fontSize: '12px', color: '#1a1d21' }}>Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#4caf50',
              color: 'white',
              padding: '13px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: '0.2s',
              opacity: loading ? 0.65 : 1,
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = '#43a047';
                e.currentTarget.style.transform  = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#4caf50';
              e.currentTarget.style.transform  = '';
            }}
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p style={{ marginTop: '16px', fontSize: '11px', color: '#70757a' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: '#4caf50', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;