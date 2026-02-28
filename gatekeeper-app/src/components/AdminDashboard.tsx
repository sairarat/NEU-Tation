import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ShieldCheck, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { signOutUser } = UserAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setAllUsers(data);
    };
    fetchAllUsers();
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card-modern" style={{ maxWidth: '800px' }}>
        <div className="brand-circle" style={{ backgroundColor: '#1e40af' }}>
          <ShieldCheck color="white" size={28} />
        </div>
        <h1 className="auth-title">Admin Control Panel</h1>
        
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.college_office}</td>
                  <td style={{ padding: '10px' }}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={() => signOutUser()} className="btn-primary-neu" style={{ marginTop: '30px' }}>
          <LogOut size={18} /> Admin Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;