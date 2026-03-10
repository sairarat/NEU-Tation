import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { BookOpen, LogIn, UserPlus, Chrome } from "lucide-react";

/*
 * CSS variable reference (base.css):
 *   --neu-green:       #4caf50
 *   --neu-green-hover: #43a047
 *   --bg-white:        #ffffff
 *   --input-fill:      #f1f3f4
 *   --text-dark:       #1a1d21
 *   --text-muted:      #70757a
 *   --shadow:          0 4px 20px rgba(0,0,0,0.08)
 *   --radius-md:       8px   → calc(--radius-md - 2px) = 6px for inner tab
 */

const Signin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { signInUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signInUser(email, password);

    if (result.success && result.user) {
      await new Promise(res => setTimeout(res, 500));

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
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  /* Shared .input-modern style */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#f1f3f4',           /* --input-fill */
    border: '1.5px solid transparent',
    borderRadius: '8px',             /* --radius-md */
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
    /*
     * .auth-container
     * min-height:100vh; display:flex; align-items:center;
     * justify-content:center; padding:20px;
     */
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      {/*
       * .auth-card-modern
       * background:#ffffff; padding:48px 40px; border-radius:40px;
       * box-shadow:0 4px 20px rgba(0,0,0,0.08);
       * width:90%; max-width:430px; text-align:center;
       * position:relative; z-index:1; margin:20px auto;
       */}
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

        {/*
         * .brand-circle
         * background:#4caf50; width:48px; height:48px; border-radius:50%;
         * display:flex; align-items:center; justify-content:center;
         * margin:0 auto 12px;
         */}
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

        {/*
         * .auth-title
         * font-size:20px; font-weight:800; margin:0 0 4px; color:#1a1d21;
         */}
        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#1a1d21' }}>
          NEU Library
        </h1>

        {/*
         * .auth-tabs
         * display:flex; background:#f1f3f4; padding:4px;
         * border-radius:8px; margin-bottom:16px;
         */}
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
          {/*
           * .tab-link (active — Sign In)
           * flex:1; padding:8px; font-weight:600; font-size:12px;
           * border-radius:6px; (calc(8px - 2px))
           * display:flex; align-items:center; justify-content:center; gap:6px;
           * Active: background:white; color:#1a1d21; box-shadow:0 1px 4px rgba(0,0,0,0.1)
           */}
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
            <LogIn size={13} /> Sign In
          </div>

          {/*
           * .tab-link (inactive — Sign Up)
           * background:transparent; color:#6366f1 (indigo, per screenshot);
           */}
          <Link
            to="/signup"
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
            <UserPlus size={13} /> Sign Up
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSignin} style={{ width: '100%' }}>

          {/*
           * .form-group
           * text-align:left; margin-bottom:15px;
           * display:flex; flex-direction:column; gap:1px;
           * label: font-weight:700; font-size:12px; color:#1a1d21;
           */}
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

          {error && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {/*
           * .btn-primary-neu
           * width:100%; background:#4caf50; color:white; padding:13px;
           * border:none; border-radius:8px; font-size:14px; font-weight:700;
           * cursor:pointer; margin-top:8px; transition:0.2s;
           * :hover → background:#43a047; transform:translateY(-1px);
           */}
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
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/*
         * .auth-divider
         * display:flex; align-items:center; margin:20px 0;
         * color:#94a3b8; font-size:12px;
         * ::before/::after → flex:1; height:1px; background:#e2e8f0; margin:0 10px;
         */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#94a3b8', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0', marginRight: '10px' }} />
          OR
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0', marginLeft: '10px' }} />
        </div>

        {/*
         * .btn-google-auth
         * width:100%; padding:12px; background:white;
         * border:1.5px solid #e2e8f0; border-radius:12px;
         * display:flex; align-items:center; justify-content:center;
         * gap:10px; font-weight:700; color:#1e293b; cursor:pointer; transition:0.2s;
         * :hover → background:#f8fafc;
         */}
        <button
          type="button"
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '14px',
            color: '#1e293b',
            cursor: 'pointer',
            transition: '0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
        >
          <Chrome size={18} /> Continue with Google
        </button>

      </div>
    </div>
  );
};

export default Signin;