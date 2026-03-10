import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
  LogOut, Users, Building2, Search,
  AlertCircle, UserCheck, UserMinus,
  Menu, X, BarChart3, History
} from 'lucide-react';

import AdminDashboardAnalytics from './AdminDashboardAnalytics';
import AdminDashboardLogs from './AdminDashboardLogs';
import neuLogo from '../assets/neu_logo_placeholder.png';

const AdminDashboard = () => {
  const { signOutUser, user } = UserAuth();
  const [allUsers, setAllUsers]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError]         = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('id', { ascending: true });

      if (fetchError) setError(fetchError.message);
      else setAllUsers(data || []);
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
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
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
    /*
     * admin-layout + sidebar-open class handled via inline conditional margin/left.
     * We use a wrapper div that conditionally applies sidebar-open behaviour.
     */
    <div
      className="flex overflow-x-hidden"
      style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white' }}
    >
      {/* ── Sidebar ── */}
      {/* admin-sidebar: fixed, left = -260px by default; left = 0 when open */}
      <aside
        style={{
          width: '260px',
          background: '#1e293b',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isSidebarOpen ? '0' : '-260px',
          zIndex: 1000,
          transition: 'left 0.3s ease',
        }}
      >
        {/* sidebar-header */}
        <div
          className="flex justify-between items-center"
          style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* admin-logo-group */}
          <div className="flex items-center" style={{ gap: '10px' }}>
            {/* admin-custom-logo */}
            <img
              src={neuLogo}
              alt="NEU Logo"
              style={{
                width: '50px',
                height: '32px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.3))',
              }}
            />
            {/* admin-brand-text */}
            <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'rgb(221,219,219)' }}>
              NEU Admin
            </span>
          </div>
          {/* sidebar-close-btn */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* sidebar-nav */}
        <nav className="flex-1" style={{ padding: '20px 12px' }}>
          {[
            { id: 'analytics', label: 'Analytics',      icon: BarChart3 },
            { id: 'directory', label: 'User Directory', icon: Users },
            { id: 'logs',      label: 'Activity Logs',  icon: History },
          ].map(({ id, label, icon: Icon }) => (
            // nav-item  /  nav-item active
            <div
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center cursor-pointer transition-all duration-200"
              style={{
                gap: '12px',
                padding: '12px 16px',
                color: activeTab === id ? '#60a5fa' : '#94a3b8',
                background: activeTab === id ? 'rgba(59,130,246,0.1)' : 'transparent',
                borderRadius: '10px',
                marginBottom: '4px',
              }}
              onMouseEnter={e => {
                if (activeTab !== id) {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                  e.currentTarget.style.color = '#60a5fa';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <Icon size={20} /> <span>{label}</span>
            </div>
          ))}
        </nav>

        {/* sidebar-footer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* admin-logout-btn */}
          <button
            onClick={signOutUser}
            className="flex items-center cursor-pointer transition-all duration-200"
            style={{
              padding: '8px 18px',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: 700,
              border: 'none',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              background: '#dc2626',
              color: 'white',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Wrapper ── */}
      {/* admin-main-wrapper: margin-left 260px when sidebar open */}
      <div
        className="flex flex-col flex-1"
        style={{
          marginLeft: isSidebarOpen ? '260px' : '0',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* ── Top Nav (admin-nav) ── */}
        <header
          className="flex justify-between items-center"
          style={{
            padding: '1rem 2rem',
            background: 'rgba(30,41,59,0.5)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* nav-left */}
          <div className="flex items-center" style={{ gap: '20px' }}>
            {!isSidebarOpen && (
              // hamburger-btn
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <Menu size={24} />
              </button>
            )}
            {/* admin-logo-group / admin-brand-text */}
            <div className="flex items-center" style={{ gap: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'rgb(221,219,219)' }}>
                NEU Library Intelligence
              </span>
            </div>
          </div>

          {/* nav-right */}
          <div className="flex items-center" style={{ gap: '20px' }}>
            {/* user-email-tag */}
            <span
              className="flex items-center justify-center"
              style={{
                background: 'rgba(4,107,45,0.85)',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 700,
                justifyContent: 'center',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {user?.email}
            </span>
          </div>
        </header>

        {/* ── Page Content (admin-main-content) ── */}
        <main style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>

          {/* TAB: Analytics */}
          {activeTab === 'analytics' && <AdminDashboardAnalytics />}

          {/* TAB: Logs */}
          {activeTab === 'logs' && <AdminDashboardLogs />}

          {/* TAB: User Directory */}
          {activeTab === 'directory' && (
            // admin-glass-card
            <div
              style={{
                background: 'rgba(30,41,59,0.4)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}
            >
              {/* admin-card-header */}
              <header
                className="flex justify-between items-center flex-wrap"
                style={{ padding: '24px', gap: '15px', color: 'rgb(221,219,219)' }}
              >
                <h1 className="text-xl font-bold">User Management</h1>

                {/* admin-controls */}
                <div className="flex" style={{ gap: '15px' }}>
                  {/* admin-filter-select */}
                  <select
                    style={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      outline: 'none',
                    }}
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="staff">Staff/Faculty</option>
                  </select>

                  {/* admin-search-bar */}
                  <div
                    className="flex items-center"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      minWidth: '250px',
                    }}
                  >
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        marginLeft: '10px',
                        outline: 'none',
                        width: '100%',
                      }}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </header>

              {/* admin-table-wrapper */}
              <div style={{ width: '100%', overflowX: 'auto' }}>
                {loading ? (
                  <div className="flex justify-center items-center p-10 text-slate-400">
                    Syncing NEU Database...
                  </div>
                ) : error ? (
                  // admin-error-msg
                  <div
                    className="flex items-center justify-center"
                    style={{ gap: '10px', padding: '40px', color: '#fb7185' }}
                  >
                    <AlertCircle /> <span>{error}</span>
                  </div>
                ) : (
                  // admin-table
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        {['User', 'College/Office', 'ID Number', 'Status', 'Actions'].map(h => (
                          <th
                            key={h}
                            style={{
                              background: 'rgba(15,23,42,0.3)',
                              padding: '16px 24px',
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              color: 'rgb(225,221,221)',
                              letterSpacing: '1px',
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            ...(u.is_active === false
                              ? { opacity: 0.5, filter: 'grayscale(0.3)', background: 'rgba(239,68,68,0.02)' }
                              : {}),
                          }}
                        >
                          {/* user-info */}
                          <td style={{ padding: '16px 24px' }}>
                            <div className="flex flex-col">
                              {/* user-name / blocked override */}
                              <span
                                style={{
                                  fontWeight: 400,
                                  fontSize: '1rem',
                                  color: u.is_active === false ? '#ff0000' : 'rgb(225,221,221)',
                                }}
                              >
                                {u.first_name} {u.last_name}
                              </span>
                              {/* user-email / blocked override */}
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  color: u.is_active === false ? '#ff0000' : 'rgb(225,221,221)',
                                }}
                              >
                                {u.email}
                              </span>
                            </div>
                          </td>

                          {/* td-dept */}
                          <td style={{ padding: '16px 24px', color: 'rgb(221,219,219)' }}>
                            <Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {u.college_office || 'N/A'}
                          </td>

                          {/* td-id */}
                          <td style={{ padding: '16px 24px', color: 'rgb(221,219,219)' }}>
                            {u.student_number || '—'}
                          </td>

                          {/* status-pill */}
                          <td style={{ padding: '16px 24px' }}>
                            <span
                              style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                ...(u.is_active !== false
                                  ? {
                                      background: 'rgba(34,197,94,0.1)',
                                      color: '#4ade80',
                                      border: '1px solid rgba(34,197,94,0.2)',
                                    }
                                  : {
                                      background: 'rgba(239,68,68,0.1)',
                                      color: '#f87171',
                                      border: '1px solid rgba(239,68,68,0.2)',
                                    }),
                              }}
                            >
                              {u.is_active !== false ? 'Active' : 'Blocked'}
                            </span>
                          </td>

                          {/* action-cell */}
                          <td style={{ padding: '16px 24px' }}>
                            <div className="flex items-center" style={{ gap: '12px' }}>
                              {/* role-badge-small */}
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  color: '#64748b',
                                  background: 'rgba(255,255,255,0.05)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                {u.role}
                              </span>

                              {/* switch-toggle */}
                              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '22px' }}>
                                <input
                                  type="checkbox"
                                  style={{ opacity: 0, width: 0, height: 0 }}
                                  checked={u.is_active !== false}
                                  onChange={() => toggleUserStatus(u.id, u.is_active)}
                                />
                                {/* slider-round */}
                                <span
                                  style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: u.is_active !== false ? '#22c55e' : '#334155',
                                    transition: '.4s',
                                    borderRadius: '34px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                  }}
                                >
                                  {/* slider knob */}
                                  <span
                                    style={{
                                      position: 'absolute',
                                      height: '16px',
                                      width: '16px',
                                      left: u.is_active !== false ? 'auto' : '3px',
                                      right: u.is_active !== false ? '3px' : 'auto',
                                      bottom: '3px',
                                      backgroundColor: 'white',
                                      transition: '.4s',
                                      borderRadius: '50%',
                                      zIndex: 2,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {u.is_active !== false
                                      ? <UserCheck size={10} color="#22c55e" />
                                      : <UserMinus size={10} color="#94a3b8" />}
                                  </span>
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