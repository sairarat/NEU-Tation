import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
  LogOut, Users, Building2, Search,
  AlertCircle, UserCheck, UserMinus,
  Menu, X, BarChart3, History, Shield
} from 'lucide-react';

import AdminDashboardAnalytics from './AdminDashboardAnalytics';
import AdminDashboardLogs from './AdminDashboardLogs';
import neuLogo from '../assets/neu_logo_placeholder.png';

const AdminDashboard = () => {
  const { signOutUser, user } = UserAuth();
  const [allUsers, setAllUsers]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [error, setError]           = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]   = useState('directory');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

  const navItems = [
    { id: 'analytics', label: 'Analytics',      icon: BarChart3 },
    { id: 'directory', label: 'User Directory', icon: Users },
    { id: 'logs',      label: 'Activity Logs',  icon: History },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .admin-table-row:hover td {
          background: rgba(59,130,246,0.04) !important;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#080e1a',
        color: 'white',
        display: 'flex',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
        <aside style={{
          width: '240px',
          background: 'linear-gradient(180deg, #0d1526 0%, #0a1020 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, bottom: 0,
          left: isSidebarOpen ? '0' : '-240px',
          zIndex: 1000,
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Sidebar header */}
          <div style={{
            padding: '22px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={neuLogo}
                alt="NEU Logo"
                style={{
                  width: '46px', height: '30px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.25))',
                }}
              />
              <div>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
                  NEU Admin
                </p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Control Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                color: '#475569',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav section label */}
          <div style={{ padding: '20px 20px 8px' }}>
            <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, color: '#334155', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Navigation
            </p>
          </div>

          {/* Nav items */}
          <nav style={{ padding: '0 12px', flex: 1 }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <div
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    marginBottom: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    color: isActive ? '#93c5fd' : '#64748b',
                    background: isActive ? 'rgba(59,130,246,0.10)' : 'transparent',
                    borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            margin: '0 4px 4px',
          }}>
            {/* Admin user chip */}
            <div style={{
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={14} color="white" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700 }}>Administrator</p>
                <p style={{
                  margin: 0, fontSize: '0.65rem', color: '#475569',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={signOutUser}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid rgba(239,68,68,0.20)',
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.30)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.20)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <LogOut size={15} strokeWidth={2.5} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════════
            MAIN WRAPPER
        ══════════════════════════════════════ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          marginLeft: isSidebarOpen ? '240px' : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
          minWidth: 0,
        }}>

          {/* Top nav bar */}
          <header style={{
            padding: '0 28px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(8,14,26,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <Menu size={18} />
                </button>
              )}

              {/* Breadcrumb-style title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>NEU Library</span>
                <span style={{ color: '#1e293b', fontSize: '0.75rem' }}>›</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px #22c55e',
                  display: 'inline-block',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 600, letterSpacing: '0.3px' }}>LIVE</span>
              </div>

              {/* Email pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'rgba(16,185,129,0.10)',
                border: '1px solid rgba(16,185,129,0.22)',
                padding: '6px 12px',
                borderRadius: '50px',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6ee7b7', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{
            padding: '28px',
            flex: 1,
            overflowY: 'auto',
            animation: 'fadeUp 0.35s ease both',
          }}>

            {activeTab === 'analytics' && <AdminDashboardAnalytics />}
            {activeTab === 'logs'      && <AdminDashboardLogs />}

            {activeTab === 'directory' && (
              <div style={{
                background: 'rgba(13,21,38,0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                {/* Card header */}
                <div style={{
                  padding: '22px 26px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  background: 'rgba(255,255,255,0.015)',
                }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
                      User Directory
                    </h1>
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                      {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Role filter */}
                    <select
                      value={filterRole}
                      onChange={e => setFilterRole(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8',
                        padding: '8px 12px',
                        borderRadius: '9px',
                        outline: 'none',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="staff">Staff / Faculty</option>
                    </select>

                    {/* Search */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '8px 14px',
                      borderRadius: '9px',
                      minWidth: '220px',
                      transition: 'border-color 0.2s',
                    }}>
                      <Search size={15} color="#475569" />
                      <input
                        type="text"
                        placeholder="Search users…"
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#e2e8f0',
                          outline: 'none',
                          width: '100%',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#334155', fontSize: '0.88rem' }}>
                      Syncing NEU Database…
                    </div>
                  ) : error ? (
                    <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fb7185' }}>
                      <AlertCircle size={18} /> <span style={{ fontSize: '0.88rem' }}>{error}</span>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                          {['User', 'College / Office', 'ID Number', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{
                              padding: '12px 22px',
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: 700,
                              color: '#334155',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              whiteSpace: 'nowrap',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => {
                          const isBlocked = u.is_active === false;
                          const isHovered = hoveredRow === u.id;
                          return (
                            <tr
                              key={u.id}
                              className="admin-table-row"
                              onMouseEnter={() => setHoveredRow(u.id)}
                              onMouseLeave={() => setHoveredRow(null)}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                opacity: isBlocked ? 0.55 : 1,
                                filter: isBlocked ? 'grayscale(0.4)' : 'none',
                                transition: 'all 0.15s ease',
                                background: isHovered ? 'rgba(59,130,246,0.04)' : 'transparent',
                                animation: `slideInLeft 0.3s ease ${i * 0.03}s both`,
                              }}
                            >
                              {/* User */}
                              <td style={{ padding: '14px 22px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  {/* Avatar */}
                                  <div style={{
                                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                                    background: isBlocked
                                      ? 'rgba(239,68,68,0.12)'
                                      : `hsl(${(u.first_name?.charCodeAt(0) || 65) * 5}, 60%, 25%)`,
                                    border: `1px solid ${isBlocked ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 700,
                                    color: isBlocked ? '#f87171' : '#94a3b8',
                                  }}>
                                    {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                                  </div>
                                  <div>
                                    <p style={{
                                      margin: 0, fontSize: '0.875rem', fontWeight: 500,
                                      color: isBlocked ? '#f87171' : '#e2e8f0',
                                    }}>
                                      {u.first_name} {u.last_name}
                                    </p>
                                    <p style={{
                                      margin: 0, fontSize: '0.75rem',
                                      color: isBlocked ? '#ef4444' : '#475569',
                                    }}>
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Dept */}
                              <td style={{ padding: '14px 22px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem' }}>
                                  <Building2 size={13} />
                                  {u.college_office || '—'}
                                </div>
                              </td>

                              {/* ID */}
                              <td style={{ padding: '14px 22px', color: '#475569', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                                {u.student_number || '—'}
                              </td>

                              {/* Status */}
                              <td style={{ padding: '14px 22px' }}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.6px',
                                  ...(isBlocked
                                    ? { background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.20)' }
                                    : { background: 'rgba(34,197,94,0.10)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.20)' }),
                                }}>
                                  {isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '14px 22px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {/* Role badge */}
                                  <span style={{
                                    fontSize: '0.62rem',
                                    color: '#3b82f6',
                                    background: 'rgba(59,130,246,0.10)',
                                    border: '1px solid rgba(59,130,246,0.18)',
                                    padding: '2px 8px',
                                    borderRadius: '5px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.4px',
                                  }}>
                                    {u.role}
                                  </span>

                                  {/* Toggle */}
                                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '23px', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      style={{ opacity: 0, width: 0, height: 0 }}
                                      checked={u.is_active !== false}
                                      onChange={() => toggleUserStatus(u.id, u.is_active)}
                                    />
                                    <span style={{
                                      position: 'absolute', inset: 0,
                                      backgroundColor: u.is_active !== false ? '#16a34a' : '#1e293b',
                                      border: `1px solid ${u.is_active !== false ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                      transition: '0.3s',
                                      borderRadius: '34px',
                                    }}>
                                      <span style={{
                                        position: 'absolute',
                                        height: '17px', width: '17px',
                                        left: u.is_active !== false ? 'auto' : '2px',
                                        right: u.is_active !== false ? '2px' : 'auto',
                                        top: '2px',
                                        backgroundColor: 'white',
                                        transition: '0.3s',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                      }}>
                                        {u.is_active !== false
                                          ? <UserCheck size={9} color="#16a34a" />
                                          : <UserMinus size={9} color="#94a3b8" />}
                                      </span>
                                    </span>
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;