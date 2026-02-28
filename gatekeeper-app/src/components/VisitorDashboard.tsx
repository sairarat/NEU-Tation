import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { LogOut, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VisitorDashboard = () => {
  const { user, signOutUser } = UserAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOutUser();
    navigate('/signin');
  };

  return (
    <div className="auth-container">
      <div className="auth-card-modern" style={{ maxWidth: '600px' }}>
        <div className="brand-circle"><BookOpen color="white" size={28} /></div>
        <h1 className="auth-title">Welcome, {profile?.email?.split('@')[0]}</h1>
        <p className="auth-subtitle">Library Access Dashboard</p>
        
        <div style={{ marginTop: '20px', textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <p><strong>Department:</strong> {profile?.college_office || 'Not Set'}</p>
          <p><strong>Account Type:</strong> {profile?.role?.toUpperCase() || 'VISITOR'}</p>
        </div>

        <button onClick={handleLogout} className="btn-primary-neu" style={{ marginTop: '20px', backgroundColor: '#ef4444' }}>
          <LogOut size={18} style={{ marginRight: '8px' }} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default VisitorDashboard;