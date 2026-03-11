import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Search, Clock, Calendar,
  AlertCircle, RefreshCw, FileText
} from 'lucide-react';

const reasonConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Reading':      { color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)' },
  'Research':     { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)' },
  'Computer Use': { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)' },
  'Studying':     { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)' },
  'Others':       { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)' },
};

const AdminDashboardLogs = () => {
  const [logs, setLogs]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [error, setError]               = useState<string | null>(null);
  const [hoveredRow, setHoveredRow]     = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('logs')
      .select(`
        id, timestamp, reason, user_id,
        profiles ( first_name, last_name, email, college_office, student_number )
      `)
      .order('timestamp', { ascending: false });

    if (fetchError) setError(fetchError.message);
    else setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    const u        = log.profiles;
    const fullName = `${u?.first_name} ${u?.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.student_number?.includes(searchTerm);
    const matchesReason = filterReason === 'all' || log.reason === filterReason;
    return matchesSearch && matchesReason;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getInitials = (log: any) => {
    const f = log.profiles?.first_name?.[0] || '';
    const l = log.profiles?.last_name?.[0]  || '';
    return (f + l).toUpperCase() || log.profiles?.email?.[0]?.toUpperCase() || '?';
  };

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    padding: '8px 12px',
    borderRadius: '9px',
    outline: 'none',
    fontSize: '0.82rem',
    cursor: 'pointer',
  };

  return (
    <div style={{
      background: 'rgba(13,21,38,0.80)',
      backdropFilter: 'blur(10px)',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      marginBottom: '2rem',
    }}>

      {/* ── Card header ── */}
      <div style={{
        padding: '20px 26px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(96,165,250,0.10)',
            border: '1px solid rgba(96,165,250,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={17} color="#60a5fa" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              Activity History
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#475569' }}>
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} • Real-time visit records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Refresh */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569',
              padding: '8px',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.10)'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#475569'; }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>

          {/* Reason filter */}
          <select style={selectStyle} value={filterReason} onChange={e => setFilterReason(e.target.value)}>
            <option value="all">All Activities</option>
            <option value="Reading">Reading</option>
            <option value="Research">Research</option>
            <option value="Computer Use">Computer Use</option>
            <option value="Studying">Studying</option>
            <option value="Others">Others</option>
          </select>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '8px 14px', borderRadius: '9px',
            minWidth: '220px',
          }}>
            <Search size={15} color="#334155" />
            <input
              type="text"
              placeholder="Search by name or ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent', border: 'none',
                color: '#e2e8f0', outline: 'none', width: '100%',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#334155', fontSize: '0.88rem' }}>
            Accessing Log Archives…
          </div>
        ) : error ? (
          <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fb7185' }}>
            <AlertCircle size={18} /> <span style={{ fontSize: '0.88rem' }}>{error}</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                {['Timestamp', 'User', 'Department', 'Activity', 'ID Number'].map(h => (
                  <th key={h} style={{
                    padding: '11px 22px',
                    fontSize: '0.62rem',
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
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => {
                  const { date, time } = formatDate(log.timestamp);
                  const rc             = reasonConfig[log.reason] || reasonConfig['Others'];
                  const isHovered      = hoveredRow === log.id;

                  return (
                    <tr
                      key={log.id}
                      onMouseEnter={() => setHoveredRow(log.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: isHovered ? 'rgba(96,165,250,0.03)' : 'transparent',
                        transition: 'background 0.15s ease',
                        animation: `fadeUp 0.3s ease ${Math.min(i, 20) * 0.025}s both`,
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            <Calendar size={11} color="#475569" /> {date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#475569' }}>
                            <Clock size={11} /> {time}
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Avatar */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                            background: `hsl(${((log.profiles?.first_name?.charCodeAt(0) || 65) * 5) % 360}, 50%, 22%)`,
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                          }}>
                            {getInitials(log)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0' }}>
                              {log.profiles?.first_name} {log.profiles?.last_name}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569' }}>
                              {log.profiles?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px 22px', color: '#64748b', fontSize: '0.8rem' }}>
                        {log.profiles?.college_office || '—'}
                      </td>

                      {/* Activity tag */}
                      <td style={{ padding: '14px 22px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          background: rc.bg,
                          color: rc.color,
                          border: `1px solid ${rc.border}`,
                          letterSpacing: '0.2px',
                        }}>
                          {log.reason}
                        </span>
                      </td>

                      {/* ID */}
                      <td style={{ padding: '14px 22px', color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {log.profiles?.student_number || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{
                    padding: '60px',
                    textAlign: 'center',
                    color: '#334155',
                    fontSize: '0.85rem',
                  }}>
                    No matching activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardLogs;