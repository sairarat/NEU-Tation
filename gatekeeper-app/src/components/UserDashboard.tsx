import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { UserCircle, LogOut, Save, BookOpen, X } from 'lucide-react';
import ReasonSelection from './ReasonSelection';

/*
 * user-dashboard.css value reference:
 *
 * .dashboard-page-container
 *   min-height:100vh; display:flex; flex-direction:column;
 *   background:transparent; font-family:'Inter',sans-serif; overflow-x:hidden;
 *
 * .dashboard-nav  (final padding override)
 *   padding: 16px clamp(15px,5vw,40px);
 *   background: rgba(255,255,255,0.1); -webkit-backdrop-filter:blur(12px);
 *   border-bottom:1px solid rgba(255,255,255,0.1); color:white; width:100%;
 *
 * .nav-logo-group
 *   display:flex; align-items:center; gap:clamp(6px,2vw,12px); flex-shrink:0;
 *
 * .nav-icon-green     color:#10b981;
 * .nav-brand-text     font-weight:800; font-size:clamp(0.9rem,2.5vw,1.25rem);
 *                     letter-spacing:-0.5px; color:white; white-space:nowrap;
 *
 * .nav-actions-group  display:flex; align-items:center; gap:clamp(8px,2vw,16px);
 *
 * .user-profile-pill
 *   display:flex; align-items:center; gap:8px;
 *   padding:6px clamp(8px,2vw,16px);
 *   background:rgba(20,83,45,0.6); border:1px solid rgba(255,255,255,0.1);
 *   border-radius:50px; font-size:0.85rem; font-weight:600; color:white;
 *   cursor:pointer; transition:0.2s; max-width:clamp(120px,30vw,250px);
 *   span → white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
 *   :hover → background:rgba(20,83,45,0.8);
 *   @media(max-width:380px) → padding:8px; border-radius:50%; span{display:none}
 *
 * .nav-logout-btn
 *   display:flex; align-items:center; gap:8px;
 *   background:rgba(239,68,68,0.2); color:#fca5a5;
 *   border:1px solid rgba(239,68,68,0.3);
 *   padding:8px 12px;  ← final override
 *   border-radius:12px; font-weight:600; cursor:pointer;
 *   transition:all 0.3s ease; white-space:nowrap;
 *   :hover → background:#ef4444; color:white; transform:translateY(-1px);
 *
 * .profile-overlay
 *   position:fixed; top:0; left:0; width:100%; height:100%;
 *   background:rgba(15,23,42,0.9); backdrop-filter:blur(10px);
 *   display:flex; align-items:center; justify-content:center; z-index:9999;
 *
 * .overlay-content
 *   background:white; padding:40px; border-radius:32px;
 *   width:90%; max-width:500px; text-align:center;
 *   box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);
 *
 * .dashboard-main-content  (final override)
 *   flex:1; display:flex; align-items:center; justify-content:center;
 *   padding:40px 20px;
 *   @media(max-width:640px) → padding:10px; padding-top:30px; align-items:flex-start;
 *
 * .glass-card-container
 *   width:100%; max-width:650px; min-height:450px; height:auto;
 *   background:rgba(255,255,255,0.1); backdrop-filter:blur(25px);
 *   border:1px solid rgba(255,255,255,0.2); border-radius:32px;
 *   padding:clamp(20px,5vw,40px);
 *   display:flex; flex-direction:column; align-items:center; justify-content:center;
 *   position:relative;
 *   @media(max-width:640px) → border-radius:24px; padding:25px 15px;
 *
 * .card-top-accent  (final override)
 *   position:absolute; left:12px; right:12px; top:0; height:6px;
 *   background:#10b981; border-radius:40px 40px 0 0; z-index:10;
 */

const UserDashboard = () => {
  const { user, signOutUser } = UserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', student_number: '', college_office: '',
  });

  /* Responsive breakpoint detection for media-query-only CSS rules */
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile     = windowWidth <= 640;   /* @media(max-width:640px) */
  const isUltraSmall = windowWidth <= 380;   /* @media(max-width:380px) */

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

  /*
   * input-modern (auth.css)
   * width:100%; padding:10px 12px; background:#f1f3f4;
   * border:1.5px solid transparent; border-radius:8px; font-size:14px;
   */
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
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#4caf50';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(76,175,80,0.12)';
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow   = '';
  };

  return (
    /*
     * .dashboard-page-container
     * min-height:100vh; flex-direction:column; background:transparent;
     * font-family:'Inter',sans-serif; overflow-x:hidden;
     */
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >

      {/* ── Navigation Bar (.dashboard-nav) ── */}
      <header
        style={{
          padding: '16px clamp(15px, 5vw, 40px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.1)',
          WebkitBackdropFilter: 'blur(12px)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          width: '100%',
        }}
      >
        {/* .nav-logo-group */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 2vw, 12px)',
            flexShrink: 0,
          }}
        >
          {/* .nav-icon-green */}
          <BookOpen style={{ color: '#10b981' }} size={24} />

          {/* .nav-brand-text */}
          <span
            style={{
              fontWeight: 800,
              fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)',
              letterSpacing: '-0.5px',
              color: 'white',
              whiteSpace: 'nowrap',
            }}
          >
            NEU Library
          </span>
        </div>

        {/* .nav-actions-group */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 2vw, 16px)',
          }}
        >
          {/*
           * .user-profile-pill
           * @media(max-width:380px) → padding:8px; border-radius:50%; span hidden
           */}
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isUltraSmall ? '8px' : '6px clamp(8px, 2vw, 16px)',
              background: 'rgba(20,83,45,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: isUltraSmall ? '50%' : '50px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              transition: '0.2s',
              maxWidth: isUltraSmall ? 'none' : 'clamp(120px, 30vw, 250px)',
              overflow: 'hidden',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(20,83,45,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(20,83,45,0.6)')}
          >
            <UserCircle size={18} />
            {/* span hidden on ultra-small (@media max-width:380px) */}
            {!isUltraSmall && (
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </span>
            )}
          </button>

          {/* .nav-logout-btn */}
          <button
            onClick={signOutUser}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239,68,68,0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '8px 12px',          /* final override in CSS */
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color      = 'white';
              e.currentTarget.style.transform  = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.color      = '#fca5a5';
              e.currentTarget.style.transform  = '';
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* ── Profile Overlay Modal (.profile-overlay) ── */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15,23,42,0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          {/* .overlay-content */}
          <div
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: '32px',
              width: '90%',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Update Profile
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                style={inputStyle}
                value={profile.first_name}
                onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                placeholder="First Name"
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
              <input
                style={inputStyle}
                value={profile.last_name}
                onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                placeholder="Last Name"
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
              <input
                style={inputStyle}
                value={profile.student_number}
                onChange={e => setProfile({ ...profile, student_number: e.target.value })}
                placeholder="Student ID"
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
              <select
                style={{ ...inputStyle, background: '#f1f5f9', color: '#1e293b', height: '42px' }}
                value={profile.college_office}
                onChange={e => setProfile({ ...profile, college_office: e.target.value })}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              >
                <option value="">Select Department</option>
                <option value="College of Informatics and Computing Studies">CICS</option>
                <option value="College of Engineering and Architecture">CEA</option>
                <option value="College of Accountancy">Accountancy</option>
                <option value="College of Arts and Sciences">CAS</option>
              </select>

              {/* .btn-primary-neu */}
              <button
                onClick={handleSave}
                style={{
                  width: '100%',
                  background: '#4caf50',
                  color: 'white',
                  padding: '13px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#43a047';
                  e.currentTarget.style.transform  = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#4caf50';
                  e.currentTarget.style.transform  = '';
                }}
              >
                <Save size={16} /> Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content (.dashboard-main-content — final override) ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          /*
           * @media(max-width:640px) → align-items:flex-start
           * default               → align-items:center
           */
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          /*
           * @media(max-width:640px) → padding:10px; padding-top:30px;
           * default (final override) → padding:40px 20px
           */
          padding: isMobile ? '30px 10px 10px' : '40px 20px',
          width: '100%',
        }}
      >
        {/*
         * .glass-card-container
         * width:100%; max-width:650px; min-height:450px; height:auto;
         * background:rgba(255,255,255,0.1); backdrop-filter:blur(25px);
         * border:1px solid rgba(255,255,255,0.2);
         * border-radius:32px (640px+) → 24px (≤640px);
         * padding:clamp(20px,5vw,40px) (640px+) → 25px 15px (≤640px);
         * position:relative;
         */}
        <div
          style={{
            width: '100%',
            maxWidth: '650px',
            minHeight: '450px',
            height: 'auto',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: isMobile ? '24px' : '32px',
            padding: isMobile ? '25px 15px' : 'clamp(20px, 5vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/*
           * .card-top-accent (final override)
           * position:absolute; left:12px; right:12px; top:0; height:6px;
           * background:#10b981; border-radius:40px 40px 0 0; z-index:10;
           */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              right: '12px',
              top: 0,
              height: '6px',
              background: '#10b981',
              borderRadius: '40px 40px 0 0',
              zIndex: 10,
            }}
          />

          <section style={{ width: '100%' }}>
            <ReasonSelection onComplete={signOutUser} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;