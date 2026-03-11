import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { LogOut, Save, X, ChevronDown } from 'lucide-react';
import ReasonSelection from './ReasonSelection';
import neuLogo from '../assets/neu_logo_placeholder.png';
import { departmentOptions } from './constants/departmentOptions';

const UserDashboard = () => {
  const { user, signOutUser } = UserAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', student_number: '', college_office: '',
  });

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile     = windowWidth <= 640;
  const isUltraSmall = windowWidth <= 380;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (data) setProfile({
        first_name:     data.first_name     || '',
        last_name:      data.last_name      || '',
        student_number: data.student_number || '',
        college_office: data.college_office || '',
      });
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);
    if (!error) setIsEditing(false);
    else alert('Failed to save updates.');
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/signin');
  };

  const handleVisitComplete = async () => {
    await signOutUser();
    navigate('/signin');
  };

  const modalInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#10b981';
    e.currentTarget.style.background  = '#ffffff';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(16,185,129,0.12)';
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.background  = '#f8fafc';
    e.currentTarget.style.boxShadow   = '';
  };

  const displayName = profile.first_name
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : user?.email?.split('@')[0] || 'User';

  const initials = profile.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  const today = new Date();

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          overflowX: 'hidden',
        }}
      >

        {/* ══════════ NAV ══════════ */}
        <header
          style={{
            padding: '13px clamp(16px, 5vw, 44px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img
              src={neuLogo}
              alt="NEU Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
              }}
            />
            {!isUltraSmall && (
              <span style={{ fontWeight: 800, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', letterSpacing: '-0.4px', color: 'white' }}>
                NEU Library
              </span>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Profile pill */}
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '8px',
                padding: isUltraSmall ? '7px' : '6px 13px 6px 7px',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.30)',
                borderRadius: '50px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(16,185,129,0.25)';
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.50)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(16,185,129,0.15)';
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.30)';
              }}
            >
              <div
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10.5px', fontWeight: 800, color: 'white', flexShrink: 0,
                }}
              >
                {initials}
              </div>
              {!isUltraSmall && (
                <>
                  <span style={{ fontSize: '13px', fontWeight: 600, maxWidth: 'clamp(60px, 20vw, 150px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                  <ChevronDown size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
                </>
              )}
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.12)',
                color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.22)',
                padding: '8px 13px',
                borderRadius: '50px',
                fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = '#ef4444';
                e.currentTarget.style.color       = 'white';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.transform   = 'translateY(-1px)';
                e.currentTarget.style.boxShadow   = '0 4px 14px rgba(239,68,68,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(239,68,68,0.12)';
                e.currentTarget.style.color       = '#fca5a5';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.22)';
                e.currentTarget.style.transform   = '';
                e.currentTarget.style.boxShadow   = '';
              }}
            >
              <LogOut size={15} strokeWidth={2.5} />
              {!isMobile && 'Sign Out'}
            </button>
          </div>
        </header>

        {/* ══════════ EDIT PROFILE MODAL ══════════ */}
        {isEditing && (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(2,8,23,0.80)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '20px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '36px',
                borderRadius: '28px',
                width: '100%', maxWidth: '460px',
                boxShadow: '0 40px 80px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)',
                animation: 'scaleIn 0.22s cubic-bezier(0.34,1.4,0.64,1)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.4px' }}>
                    Edit Profile
                  </h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '13px' }}>
                    Keep your details up to date
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b', transition: 'all 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>First Name</label>
                    <input style={modalInputStyle} value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} placeholder="John" onFocus={onInputFocus} onBlur={onInputBlur} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>Last Name</label>
                    <input style={modalInputStyle} value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} placeholder="Doe" onFocus={onInputFocus} onBlur={onInputBlur} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>Student / Staff ID</label>
                  <input style={modalInputStyle} value={profile.student_number} onChange={e => setProfile({ ...profile, student_number: e.target.value })} placeholder="##-#####-###" onFocus={onInputFocus} onBlur={onInputBlur} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '6px' }}>Department</label>
                  <select
                    style={{ ...modalInputStyle, height: '46px', cursor: 'pointer' }}
                    value={profile.college_office}
                    onChange={e => setProfile({ ...profile, college_office: e.target.value })}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                  >
                    <option value="">Select your department</option>
                    {departmentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', padding: '14px', border: 'none',
                    borderRadius: '14px', fontSize: '14px', fontWeight: 700,
                    cursor: 'pointer', marginTop: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    letterSpacing: '0.2px',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.30)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 22px rgba(16,185,129,0.38)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.30)';
                  }}
                >
                  <Save size={16} strokeWidth={2.5} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ MAIN ══════════ */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '24px 14px 24px' : '48px 24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              animation: 'fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            {/* ── Greeting ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingLeft: '2px' }}>
              <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg, #10b981, #34d399)', borderRadius: '2px', flexShrink: 0 }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span style={{ color: 'white', fontWeight: 800 }}>
                  {profile.first_name || user?.email?.split('@')[0]}
                </span>
              </p>
            </div>

            {/* ── Main card (white) ── */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: isMobile ? '22px' : '28px',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Gradient accent bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #10b981 0%, #34d399 60%, #6ee7b7 100%)' }} />

              <div style={{ padding: isMobile ? '26px 20px 30px' : '36px 36px 40px' }}>

                {/* Card header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
                  <div>
                    <h2
                      style={{
                        color: '#0f172a', margin: 0,
                        fontSize: isMobile ? '1.1rem' : '1.25rem',
                        fontWeight: 800, letterSpacing: '-0.4px',
                      }}
                    >
                      Log Your Visit
                    </h2>
                    <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '13px', lineHeight: 1.4 }}>
                      Select your reason for visiting the library today
                    </p>
                  </div>

                  {/* Date badge */}
                  <div
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.20)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      textAlign: 'center',
                      flexShrink: 0,
                      minWidth: '52px',
                    }}
                  >
                    <p style={{ color: '#059669', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: 0 }}>
                      {today.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p style={{ color: '#0f172a', fontSize: '20px', fontWeight: 900, margin: '1px 0', lineHeight: 1 }}>
                      {today.getDate()}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '9.5px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {today.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                </div>

                {/* Thin divider */}
                <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '28px' }} />

                {/* Reason selection */}
                <ReasonSelection onComplete={handleVisitComplete} />
              </div>
            </div>

            {/* Footer note */}
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '11px', marginTop: '14px', letterSpacing: '0.1px' }}>
              Visit data is recorded for library analytics and management.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboard;