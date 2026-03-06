import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ShieldCheck, LogOut, Users, Building2, Search, AlertCircle } from 'lucide-react';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const { signOutUser, user } = UserAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      // RLS will return an error if the user role is not 'admin'
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        setError("Access Denied: Admin permissions required.");
      } else {
        setAllUsers(data || []);
      }
      setLoading(false);
    };

    if (user) fetchAllUsers();
  }, [user]);

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.student_number?.includes(searchTerm) ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <header className="admin-nav">
        <div className="admin-logo-group">
          <ShieldCheck className="admin-icon-blue" size={24} />
          <span className="admin-brand-text">NEU Admin Panel</span>
        </div>
        <button onClick={signOutUser} className="admin-logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <main className="admin-main-content">
        <div className="admin-glass-card">
          <div className="admin-card-accent" />
          <header className="admin-card-header">
            <h1 className="admin-title">User Directory</h1>
            <div className="admin-search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search students/faculty..." 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="admin-table-wrapper">
            {loading ? (
              <div className="admin-loading">Checking permissions...</div>
            ) : error ? (
              <div className="admin-error-msg"><AlertCircle /> {error}</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>College/Office</th>
                    <th>ID</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="td-email">
                        {u.first_name} {u.last_name}
                        <br/><small>{u.email}</small>
                      </td>
                      <td className="td-dept"><Building2 size={14}/> {u.college_office || 'N/A'}</td>
                      <td className="td-id">{u.student_number || '—'}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default AdminDashboard;