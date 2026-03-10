import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { UserCircle, LogOut, Save, BookOpen, X } from 'lucide-react';
import ReasonSelection from './ReasonSelection';

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

  // FIX: After a visit reason is logged, ReasonSelection calls onComplete.
  // Previously this was wired to signOutUser, which signed the user out
  // entirely instead of just moving them along. Now we navigate back to
  // /signin (log-out flow) or you can change this to wherever makes sense
  // post-visit (e.g. a "thank you" page or back to dashboard).
  const handleVisitComplete = async () => {
    await signOutUser();
    navigate('/signin');
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
  const onInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#4caf50';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(76,175,80,0.12)';
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow   = '';
  };

  // Standardised department options — must match CompleteProfile.tsx exactly
  // so that college_office values are consistent throughout the app.
  const departmentOptions = [
    { value: 'CAS',  label: 'College of Arts and Sciences' },
    { value: 'ICS',  label: 'Institute of Computer Studies' },
    { value: 'COE',  label: 'College of Engineering' },
    { value: 'CBA',  label: 'College of Business Administration' },
    { value: 'CED',  label: 'College of Education' },
  ];

  return (
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
      {/* Navigation */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 12px)', flexShrink: 0 }}>
          <BookOpen style={{ color: '#10b981' }} size={24} />
          <span style={{ fontWeight: 800, fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)', letterSpacing: '-0.5px', color: 'white', whiteSpace: 'nowrap' }}>
            NEU Library
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isUltraSmall ? '8px' : '6px clamp(8px, 2vw, 16px)',
              background: 'rgba(20,83,45,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              transition: '0.2s',
              maxWidth: 'clamp(120px, 30vw, 250px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,83,45,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,83,45,0.6)'; }}
          >
            <UserCircle size={18} />
            {!isUltraSmall && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.first_name || user?.email?.split('@')[0] || 'Profile'}
              </span>
            )}
          </button>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239,68,68,0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '8px 12px',
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

      {/* Profile Edit Overlay */}
      {isEditing && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white', padding: '40px', borderRadius: '32px',
              width: '90%', maxWidth: '500px', textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Update Profile
              </h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

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
              {/*
                FIX: Department values now match CompleteProfile.tsx exactly
                (short codes: CAS, ICS, COE, CBA, CED).
                Previously this used full names like "College of Informatics and
                Computing Studies" which didn't match the codes saved during
                profile setup, corrupting college_office in the database.
              */}
              <select
                style={{ ...inputStyle, background: '#f1f5f9', color: '#1e293b', height: '42px' }}
                value={profile.college_office}
                onChange={e => setProfile({ ...profile, college_office: e.target.value })}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              >
                <option value="">Select Department</option>
                {departmentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                onClick={handleSave}
                style={{
                  width: '100%', background: '#4caf50', color: 'white',
                  padding: '13px', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  marginTop: '8px', transition: '0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
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

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          padding: isMobile ? '30px 10px 10px' : '40px 20px',
          width: '100%',
        }}
      >
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
          <div
            style={{
              position: 'absolute', left: '12px', right: '12px', top: 0,
              height: '6px', background: '#10b981',
              borderRadius: '40px 40px 0 0', zIndex: 10,
            }}
          />
          <section style={{ width: '100%' }}>
            {/*
              FIX: onComplete now calls handleVisitComplete which signs the
              user out and navigates to /signin — NOT the raw signOutUser
              function, which previously signed out without any navigation,
              leaving the user stuck on the dashboard in a logged-out state.
            */}
            <ReasonSelection onComplete={handleVisitComplete} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;