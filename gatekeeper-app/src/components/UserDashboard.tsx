import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { UserCircle, LogOut, Save, BookOpen, X } from 'lucide-react';
import ReasonSelection from './ReasonSelection';
import '../styles/user-dashboard.css';

const UserDashboard = () => {
  const { user, signOutUser } = UserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', student_number: '', college_office: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (data) setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        student_number: data.student_number || '',
        college_office: data.college_office || ''
      });
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);
    if (!error) setIsEditing(false);
    else alert("Failed to save updates.");
  };

  return (
    <div className="dashboard-page-container">
      {/* 1. Navigation Header with Email Pill */}
      <header className="dashboard-nav">
        <div className="nav-logo-group">
          <BookOpen className="nav-icon-green" size={24} />
          <span className="nav-brand-text">NEU Library</span>
        </div>
        <div className="nav-actions-group">
          <button className="user-profile-pill" onClick={() => setIsEditing(true)}>
            <UserCircle size={18} />
            <span>{user?.email}</span>
          </button>
          <button onClick={signOutUser} className="nav-logout-btn"><LogOut size={18} /> Logout</button>
        </div>
      </header>

      {/* 2. Fullscreen Overlay for Profile Editing */}
      {isEditing && (
        <div className="profile-overlay">
          <div className="overlay-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h2 style={{ color: '#1e293b', margin: 0 }}>Update Profile</h2>
               <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input className="input-modern" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} placeholder="First Name" />
              <input className="input-modern" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} placeholder="Last Name" />
              <input className="input-modern" value={profile.student_number} onChange={e => setProfile({...profile, student_number: e.target.value})} placeholder="Student ID" />
              
              <select className="input-modern" value={profile.college_office} onChange={e => setProfile({...profile, college_office: e.target.value})} style={{ background: '#f1f5f9', color: '#1e293b' }}>
                <option value="">Select Department</option>
                <option value="College of Informatics and Computing Studies">CICS</option>
                <option value="College of Engineering and Architecture">CEA</option>
                <option value="College of Accountancy">Accountancy</option>
                <option value="College of Arts and Sciences">CAS</option>
              </select>

              <button className="btn-primary-neu" onClick={handleSave} style={{ width: '100%' }}>
                <Save size={18} /> Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content with Clean Glass Card */}
      <main className="dashboard-main-content">
        <div className="glass-card-container">
          <div className="card-top-accent" />
          <section style={{ width: '100%' }}>
             {/* Added onComplete prop to handle redirect after logging visit */}
             <ReasonSelection onComplete={signOutUser} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;