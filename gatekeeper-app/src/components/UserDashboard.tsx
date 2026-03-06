import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { UserCircle, LogOut, Edit, Save, BookOpen } from 'lucide-react';
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
    else alert("Failed to save. Ensure database columns exist."); //
  };

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-nav">
        <div className="nav-logo-group">
          <BookOpen className="nav-icon-green" size={24} />
          <span className="nav-brand-text">NEU Library</span>
        </div>
        <button onClick={signOutUser} className="nav-logout-btn"><LogOut size={18} /> Logout</button>
      </header>

      <main className="dashboard-main-content">
        <div className="glass-card-container">
          <div className="card-top-accent" />
          <section className="profile-management-section">
            <div className="glass-avatar-icon"><UserCircle color="white" size={48} /></div>
            
            {isEditing ? (
              <div className="edit-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input className="input-modern" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} placeholder="First Name" />
                <input className="input-modern" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} placeholder="Last Name" />
                <input className="input-modern" value={profile.student_number} onChange={e => setProfile({...profile, student_number: e.target.value})} placeholder="Student ID" />
                <select className="input-modern" value={profile.college_office} onChange={e => setProfile({...profile, college_office: e.target.value})} style={{ background: '#1e293b', color: 'white' }}>
                  <option value="">Select Department</option>
                  <option value="College of Informatics and Computing Studies">College of Informatics and Computing Studies</option>
                  <option value="College of Engineering and Architecture">College of Engineering and Architecture</option>
                  <option value="College of Accountancy">College of Accountancy</option>
                  <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                  <option value="College of Medical Technology">College of Medical Technology</option>
                  <option value="College of Nursing">College of Nursing</option>
                  <option value="College of Communication">College of Communication</option>
                </select>
                <button className="btn-primary-neu" onClick={handleSave}><Save size={18} /> Save Changes</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h1 className="glass-card-title">{profile.first_name || "Welcome"}</h1>
                <p className="glass-card-subtitle">{profile.college_office || "Incomplete Profile"}</p>
                <button className="edit-pill" onClick={() => setIsEditing(true)}>
                  <Edit size={14} /> Edit Profile
                </button>
              </div>
            )}
          </section>
          <section style={{ marginTop: '40px' }}><ReasonSelection /></section>
        </div>
      </main>
    </div>
  );
};
export default UserDashboard;