import { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import {
  LogOut, Users, Building2, Search,
  AlertCircle, UserCheck, UserMinus,
  Menu, X, BarChart3, History, Shield,
  ChevronRight,
} from 'lucide-react';

import AdminDashboardAnalytics from './AdminDashboardAnalytics';
import AdminDashboardLogs from './AdminDashboardLogs';
import neuLogo from '../assets/neu_logo_placeholder.png';

/* ─── Design tokens ─────────────────────────────── */
const T = {
  bg:        '#080d1a',
  surface:   '#0e1628',
  surfaceHi: '#131e35',
  border:    'rgba(255,255,255,0.07)',
  blue:      '#3b82f6',
  blueLight: '#93c5fd',
  blueDim:   'rgba(59,130,246,0.12)',
  green:     '#10b981',
  greenDim:  'rgba(16,185,129,0.12)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  text:      '#f1f5f9',
  textMid:   '#94a3b8',
  textDim:   '#475569',
  textFaint: '#1e293b',
};

/* ─── Responsive hook ───────────────────────────── */
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return w;
}

const SIDEBAR_W = 248;

const AdminDashboard = () => {
  const { signOutUser, user } = UserAuth();
  const width = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width < 1024;

  const [allUsers, setAllUsers]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterRole, setFilterRole]       = useState('all');
  const [error, setError]                 = useState<string | null>(null);
  // Auto-close sidebar on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab]         = useState('directory');
  const [hoveredRow, setHoveredRow]       = useState<string | null>(null);
  const [togglingId, setTogglingId]       = useState<string | null>(null);

  // Close sidebar automatically when screen shrinks to mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true); setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles').select('*').order('id', { ascending: true });
      if (fetchError) setError(fetchError.message);
      else setAllUsers(data || []);
      setLoading(false);
    };
    if (user) fetchAllUsers();
  }, [user]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setTogglingId(userId);
    const newStatus = !currentStatus;
    const { error: updateError } = await supabase
      .from('profiles').update({ is_active: newStatus }).eq('id', userId);
    if (!updateError)
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
    setTogglingId(null);
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
    { id: 'analytics', label: 'Analytics',      icon: BarChart3, desc: 'Stats & insights'  },
    { id: 'directory', label: 'User Directory', icon: Users,     desc: 'Manage accounts'   },
    { id: 'logs',      label: 'Activity Logs',  icon: History,   desc: 'Visit history'     },
  ];
  const activeNavItem = navItems.find(n => n.id === activeTab);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) setIsSidebarOpen(false); // auto-close on mobile after nav
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.85); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .nav-btn { transition: all 0.18s ease; }
        .nav-btn:hover { background: rgba(59,130,246,0.08) !important; }
        .dir-row { transition: background 0.12s ease; }
        .dir-row:hover { background: rgba(59,130,246,0.06) !important; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      `}</style>

      <div style={{
        minHeight: '100vh', backgroundColor: T.bg, color: T.text,
        display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif",
        overflow: 'hidden', position: 'relative',
      }}>

        {/* ── Mobile overlay backdrop ── */}
        {isMobile && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 190,
              animation: 'fadeUp 0.15s ease both',
            }}
          />
        )}

        {/* ════════════════════════════
            SIDEBAR
        ════════════════════════════ */}
        <aside style={{
          width: `${SIDEBAR_W}px`,
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, bottom: 0,
          left: isSidebarOpen ? 0 : -SIDEBAR_W,
          zIndex: 200,
          transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}>
          {/* Brand */}
          <div style={{
            padding: '20px 18px 18px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={neuLogo} alt="NEU" style={{
                width: '42px', height: '28px', objectFit: 'contain',
                filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(59,130,246,0.3))',
              }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: T.text }}>NEU Admin</p>
                <p style={{ margin: 0, fontSize: '0.6rem', color: T.textDim, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Control Panel
                </p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer',
                padding: '6px', borderRadius: '8px', display: 'flex', lineHeight: 0 }}
              title="Collapse sidebar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, color: T.textFaint, letterSpacing: '1.4px',
              textTransform: 'uppercase', padding: '6px 10px 8px', margin: 0 }}>
              Menu
            </p>
            {navItems.map(({ id, label, icon: Icon, desc }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} className="nav-btn" onClick={() => handleNavClick(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    border: 'none', width: '100%', textAlign: 'left',
                    background: isActive ? T.blueDim : 'transparent',
                    color: isActive ? T.blueLight : T.textMid,
                    outline: 'none', position: 'relative',
                    fontFamily: 'inherit',
                  }}
                  title={desc}
                >
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '3px', borderRadius: '0 3px 3px 0', background: T.blue,
                    }} />
                  )}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${isActive ? 'rgba(59,130,246,0.25)' : T.border}`,
                  }}>
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, lineHeight: 1.2 }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: T.textDim, lineHeight: 1.3, marginTop: '1px' }}>{desc}</p>
                  </div>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', color: T.blue, flexShrink: 0 }} />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 10px 16px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.14)', marginBottom: '8px',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
              }}>
                <Shield size={14} color="white" strokeWidth={2.5} />
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.7rem', color: T.blueLight, fontWeight: 700 }}>Administrator</p>
                <p style={{ margin: 0, fontSize: '0.63rem', color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button onClick={signOutUser}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: '10px', fontSize: '0.83rem', fontWeight: 600,
                border: '1px solid rgba(239,68,68,0.22)', background: T.redDim, color: '#fca5a5',
                cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = T.red; e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = T.red; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.30)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = T.redDim; e.currentTarget.style.color = '#fca5a5';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.22)'; e.currentTarget.style.boxShadow = '';
              }}
            >
              <LogOut size={15} strokeWidth={2.5} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ════════════════════════════
            MAIN WRAPPER
        ════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          marginLeft: isSidebarOpen && !isMobile ? `${SIDEBAR_W}px` : 0,
          transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
          minWidth: 0, minHeight: '100vh',
        }}>

          {/* Top bar */}
          <header style={{
            height: isMobile ? '52px' : '58px',
            padding: `0 ${isMobile ? '14px' : '24px'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(8,13,26,0.92)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${T.border}`,
            position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              {/* Hamburger — always show when sidebar closed OR on mobile */}
              {(!isSidebarOpen) && (
                <button onClick={() => setIsSidebarOpen(true)}
                  style={{
                    background: T.surfaceHi, border: `1px solid ${T.border}`,
                    borderRadius: '9px', color: T.textMid, cursor: 'pointer',
                    padding: '7px', display: 'flex', alignItems: 'center', lineHeight: 0,
                    flexShrink: 0,
                  }}
                  title="Open sidebar"
                >
                  <Menu size={17} />
                </button>
              )}

              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                {!isMobile && (
                  <>
                    <span style={{ fontSize: '0.72rem', color: T.textFaint, fontWeight: 500, whiteSpace: 'nowrap' }}>NEU Library</span>
                    <span style={{ color: T.textFaint, fontSize: '0.8rem' }}>›</span>
                  </>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeNavItem && <activeNavItem.icon size={13} color={T.blueLight} />}
                  <span style={{ fontSize: '0.82rem', color: T.textMid, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {activeNavItem?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Live pulse */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 8px', borderRadius: '20px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: T.green,
                  display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite',
                  boxShadow: `0 0 6px ${T.green}`,
                }} />
                <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700, letterSpacing: '0.5px' }}>LIVE</span>
              </div>

              {/* User pill — hide email on mobile */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: isMobile ? '4px' : '5px 12px 5px 6px',
                background: T.greenDim, border: '1px solid rgba(16,185,129,0.20)',
                borderRadius: '50px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: 'white',
                }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6ee7b7',
                    maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Page body */}
          <main style={{
            flex: 1, padding: isMobile ? '14px' : isTablet ? '18px' : '24px',
            overflowY: 'auto', animation: 'fadeUp 0.32s ease both',
          }}>
            {activeTab === 'analytics' && <AdminDashboardAnalytics />}
            {activeTab === 'logs'      && <AdminDashboardLogs />}

            {activeTab === 'directory' && (
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: '16px', overflow: 'hidden',
              }}>
                {/* Directory header */}
                <div style={{
                  padding: isMobile ? '14px' : '18px 22px',
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px', background: T.surfaceHi,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      background: T.blueDim, border: '1px solid rgba(59,130,246,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={18} color={T.blueLight} />
                    </div>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.text }}>User Directory</h1>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: T.textDim }}>
                        {loading ? 'Loading…' : `${filteredUsers.length} of ${allUsers.length} user${allUsers.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                      style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        color: T.textMid, padding: '8px 12px', borderRadius: '9px',
                        outline: 'none', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                        flex: isMobile ? '1' : 'unset',
                      }}>
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="staff">Staff / Faculty</option>
                      <option value="admin">Admins</option>
                    </select>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: T.surface, border: `1px solid ${T.border}`,
                      padding: '8px 14px', borderRadius: '9px',
                      flex: isMobile ? '2' : 'unset', minWidth: isMobile ? '0' : '210px',
                    }}>
                      <Search size={14} color={T.textDim} style={{ flexShrink: 0 }} />
                      <input type="text" placeholder="Search users…" onChange={e => setSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: T.text, outline: 'none', width: '100%',
                          fontSize: '0.8rem', fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {loading ? (
                    <div style={{ padding: '64px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', border: `2px solid ${T.border}`,
                          borderTopColor: T.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ color: T.textDim, fontSize: '0.85rem', margin: 0 }}>Syncing NEU Database…</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div style={{ padding: '48px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '10px', color: '#f87171' }}>
                      <AlertCircle size={28} strokeWidth={1.5} />
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>{error}</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '64px', textAlign: 'center' }}>
                      <Users size={36} color={T.textFaint} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ color: T.textDim, fontSize: '0.88rem', margin: '0 0 4px' }}>No users found</p>
                      <p style={{ color: T.textFaint, fontSize: '0.78rem', margin: 0 }}>Try adjusting your search or filter</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isMobile ? '600px' : 'unset' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                          {[
                            { label: 'User',           w: '28%' },
                            { label: 'College / Dept', w: '22%' },
                            { label: 'ID Number',      w: '15%' },
                            { label: 'Status',         w: '12%' },
                            { label: 'Role',           w: '10%' },
                            { label: 'Access',         w: '13%' },
                          ].map(h => (
                            <th key={h.label} style={{
                              padding: isMobile ? '10px 14px' : '11px 20px',
                              fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '1.1px',
                              fontWeight: 700, color: T.textDim,
                              borderBottom: `1px solid ${T.border}`, width: h.w, whiteSpace: 'nowrap',
                            }}>
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => {
                          const isBlocked  = u.is_active === false;
                          const isToggling = togglingId === u.id;
                          const hue        = ((u.first_name?.charCodeAt(0) || 65) * 47) % 360;
                          return (
                            <tr key={u.id} className="dir-row"
                              onMouseEnter={() => setHoveredRow(u.id)}
                              onMouseLeave={() => setHoveredRow(null)}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                opacity: isBlocked ? 0.5 : 1,
                                filter: isBlocked ? 'grayscale(0.5)' : 'none',
                                background: hoveredRow === u.id ? 'rgba(59,130,246,0.05)' : 'transparent',
                                animation: `slideLeft 0.25s ease ${Math.min(i, 30) * 0.02}s both`,
                              }}
                            >
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                                    background: isBlocked ? 'rgba(239,68,68,0.12)' : `hsl(${hue},45%,20%)`,
                                    border: `1px solid ${isBlocked ? 'rgba(239,68,68,0.25)' : `hsl(${hue},45%,30%)`}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: 700,
                                    color: isBlocked ? '#f87171' : `hsl(${hue},70%,75%)`,
                                  }}>
                                    {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 600,
                                      color: isBlocked ? '#f87171' : T.text, lineHeight: 1.3,
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {u.first_name || '—'} {u.last_name || ''}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.7rem',
                                      color: isBlocked ? '#ef4444' : T.textDim, lineHeight: 1.3,
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px',
                                  color: T.textDim, fontSize: '0.78rem' }}>
                                  <Building2 size={11} style={{ flexShrink: 0, color: T.textFaint }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.college_office || '—'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px',
                                color: T.textDim, fontSize: '0.76rem', fontFamily: "'JetBrains Mono', monospace" }}>
                                {u.student_number || '—'}
                              </td>
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '3px 8px', borderRadius: '20px',
                                  fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                                  whiteSpace: 'nowrap',
                                  ...(isBlocked
                                    ? { background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.22)' }
                                    : { background: 'rgba(34,197,94,0.09)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.20)' }),
                                }}>
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                                    background: isBlocked ? '#f87171' : '#4ade80' }} />
                                  {isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px' }}>
                                <span style={{
                                  fontSize: '0.62rem', color: T.blueLight, background: T.blueDim,
                                  border: '1px solid rgba(59,130,246,0.20)',
                                  padding: '2px 7px', borderRadius: '5px',
                                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap',
                                }}>
                                  {u.role || '—'}
                                </span>
                              </td>
                              <td style={{ padding: isMobile ? '11px 14px' : '13px 20px' }}>
                                <button onClick={() => toggleUserStatus(u.id, u.is_active)}
                                  disabled={isToggling}
                                  title={isBlocked ? 'Activate user' : 'Block user'}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    background: 'none', border: 'none', cursor: isToggling ? 'wait' : 'pointer',
                                    padding: 0, opacity: isToggling ? 0.6 : 1,
                                  }}
                                >
                                  <div style={{
                                    position: 'relative', width: '40px', height: '21px',
                                    borderRadius: '11px', flexShrink: 0,
                                    background: isBlocked ? '#1e293b' : '#16a34a',
                                    border: `1px solid ${isBlocked ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.40)'}`,
                                    transition: 'background 0.25s ease',
                                    boxShadow: isBlocked ? 'none' : '0 0 8px rgba(22,163,74,0.3)',
                                  }}>
                                    <div style={{
                                      position: 'absolute', top: '2px',
                                      left: isBlocked ? '2px' : '19px',
                                      width: '15px', height: '15px',
                                      borderRadius: '50%', background: 'white',
                                      transition: 'left 0.25s cubic-bezier(0.34,1.5,0.64,1)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                                    }}>
                                      {isToggling
                                        ? <div style={{ width: '7px', height: '7px', border: '1.5px solid #94a3b8',
                                            borderTopColor: 'transparent', borderRadius: '50%',
                                            animation: 'spin 0.7s linear infinite' }} />
                                        : isBlocked
                                          ? <UserMinus size={8} color="#94a3b8" />
                                          : <UserCheck size={8} color="#16a34a" />}
                                    </div>
                                  </div>
                                  {!isMobile && (
                                    <span style={{ fontSize: '0.7rem', color: isBlocked ? T.textDim : '#4ade80',
                                      fontWeight: 600, whiteSpace: 'nowrap' }}>
                                      {isToggling ? '…' : isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer */}
                {!loading && !error && filteredUsers.length > 0 && (
                  <div style={{
                    padding: isMobile ? '10px 14px' : '12px 22px',
                    borderTop: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: T.surfaceHi, flexWrap: 'wrap', gap: '6px',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: T.textDim }}>
                      <strong style={{ color: T.textMid }}>{filteredUsers.length}</strong> of{' '}
                      <strong style={{ color: T.textMid }}>{allUsers.length}</strong> users
                    </p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: T.textDim }}>
                      <strong style={{ color: '#4ade80' }}>{allUsers.filter(u => u.is_active !== false).length}</strong> active ·{' '}
                      <strong style={{ color: '#f87171' }}>{allUsers.filter(u => u.is_active === false).length}</strong> blocked
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;