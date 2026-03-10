import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { 
  ShieldCheck, LogOut, Users, Building2, Search, 
  AlertCircle, UserCheck, UserMinus,
  Menu, X, BarChart3, History
} from 'lucide-react';

// Import your sub-components
import AdminDashboardAnalytics from './AdminDashboardAnalytics'; 
import AdminDashboardLogs from './AdminDashboardLogs'; 
import '../styles/admin-dashboard.css';
import neuLogo from '../assets/neu_logo_placeholder.png';

const AdminDashboard = () => {
  const { signOutUser, user } = UserAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('directory'); // Options: 'analytics', 'directory', 'logs'

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });
      
      if (fetchError) {
        setError(fetchError.message); 
      } else {
        setAllUsers(data || []);
      }
      setLoading(false);
    };

    if (user) fetchAllUsers();
  }, [user]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);
    
    if (!updateError) {
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: newStatus } : u
      ));
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.student_number?.includes(searchTerm) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo-group">
            <img src={neuLogo} alt="NEU Logo" className="admin-custom-logo" />
            <span className="admin-brand-text">NEU Admin</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} /> <span>Analytics</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`} 
            onClick={() => setActiveTab('directory')}
          >
            <Users size={20} /> <span>User Directory</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('logs')}
          >
            <History size={20} /> <span>Activity Logs</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={signOutUser} className="admin-logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-nav">
          <div className="nav-left">
            {!isSidebarOpen && (
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
            )}
            <div className="admin-logo-group">
              <span className="admin-brand-text">NEU Library Intelligence</span>
            </div>
          </div>
          <div className="nav-right">
            <span className="user-email-tag">{user?.email}</span>
          </div>
        </header>

        <main className="admin-main-content">
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && <AdminDashboardAnalytics />}

          {/* TAB 2: ACTIVITY LOGS */}
          {activeTab === 'logs' && <AdminDashboardLogs />}

          {/* TAB 3: USER DIRECTORY (Default) */}
          {activeTab === 'directory' && (
            <div className="admin-glass-card animate-fade-in">
              <header className="admin-card-header">
                <h1 className="admin-title">User Management</h1>
                <div className="admin-controls">
                  <select 
                    className="admin-filter-select" 
                    value={filterRole} 
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="staff">Staff/Faculty</option>
                  </select>
                  <div className="admin-search-bar">
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                  </div>
                </div>
              </header>

              <div className="admin-table-wrapper">
                {loading ? (
                  <div className="admin-loading">Syncing NEU Database...</div>
                ) : error ? (
                  <div className="admin-error-msg"><AlertCircle /> <span>{error}</span></div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>College/Office</th>
                        <th>ID Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className={u.is_active === false ? 'row-blocked' : ''}>
                          <td className="td-user">
                            <div className="user-info">
                              <span className="user-name">{u.first_name} {u.last_name}</span>
                              <span className="user-email">{u.email}</span>
                            </div>
                          </td>
                          <td className="td-dept"><Building2 size={14} className="inline-icon" /> {u.college_office || 'N/A'}</td>
                          <td className="td-id">{u.student_number || '—'}</td>
                          <td>
                            <span className={`status-pill ${u.is_active !== false ? 'status-active' : 'status-blocked'}`}>
                              {u.is_active !== false ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td>
                            <div className="action-cell">
                              <span className="role-badge-small">{u.role}</span>
                              <label className="switch-toggle">
                                <input 
                                  type="checkbox" 
                                  checked={u.is_active !== false} 
                                  onChange={() => toggleUserStatus(u.id, u.is_active)} 
                                />
                                <span className="slider-round">
                                  {u.is_active !== false ? <UserCheck size={14} /> : <UserMinus size={14} />}
                                </span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;