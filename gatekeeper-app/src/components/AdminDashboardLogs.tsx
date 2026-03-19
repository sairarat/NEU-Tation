import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Search, Clock, Calendar,
  AlertCircle, RefreshCw, FileText, Inbox,
} from 'lucide-react';

/* ─── Design tokens ────────────────────────────── */
const T = {
  bg:        '#080d1a',
  surface:   '#0e1628',
  surfaceHi: '#131e35',
  border:    'rgba(255,255,255,0.07)',
  blue:      '#3b82f6',
  blueLight: '#93c5fd',
  blueDim:   'rgba(59,130,246,0.10)',
  text:      '#f1f5f9',
  textMid:   '#94a3b8',
  textDim:   '#475569',
  textFaint: '#1e2940',
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

const reasonConfig: Record<string, { color: string; bg: string; border: string }> = {
  'Reading':      { color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)'  },
  'Research':     { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)'  },
  'Computer Use': { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)'  },
  'Studying':     { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)' },
  'Others':       { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.22)' },
};

const REASONS   = ['Reading', 'Research', 'Computer Use', 'Studying', 'Others'];
const PAGE_SIZE = 20;

const AdminDashboardLogs = () => {
  const width    = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width < 900;

  const [logs, setLogs]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [error, setError]               = useState<string | null>(null);
  const [hoveredRow, setHoveredRow]     = useState<string | null>(null);
  const [page, setPage]                 = useState(1);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('logs')
      .select(`id, timestamp, reason, user_id,
        profiles ( first_name, last_name, email, college_office, student_number )`)
      .order('timestamp', { ascending: false });
    if (fetchError) setError(fetchError.message);
    else { setLogs(data || []); setLastUpdated(new Date()); setPage(1); }
    setLoading(false); setRefreshing(false);
  };

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => { setPage(1); }, [searchTerm, filterReason]);

  const filteredLogs = logs.filter(log => {
    const u        = log.profiles;
    const fullName = `${u?.first_name || ''} ${u?.last_name || ''}`.toLowerCase();
    const matchSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u?.student_number || '').includes(searchTerm);
    const matchReason = filterReason === 'all' || log.reason === filterReason;
    return matchSearch && matchReason;
  });

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const pagedLogs  = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(d),
    };
  };

  const getRelativeTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getInitials = (log: any) => {
    const f = log.profiles?.first_name?.[0] || '';
    const l = log.profiles?.last_name?.[0]  || '';
    return (f + l).toUpperCase() || log.profiles?.email?.[0]?.toUpperCase() || '?';
  };

  const getAvatarColor = (log: any) => {
    const code = log.profiles?.first_name?.charCodeAt(0) || 65;
    return { bg: `hsl(${(code * 47) % 360},45%,18%)`, fg: `hsl(${(code * 47) % 360},60%,70%)` };
  };

  /* On mobile render cards instead of a table */
  const renderMobileCard = (log: any, i: number) => {
    const { date, time, relative } = formatDate(log.timestamp);
    const rc = reasonConfig[log.reason] || reasonConfig['Others'];
    const av = getAvatarColor(log);
    return (
      <div key={log.id} style={{
        padding: '14px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', gap: '10px',
        animation: `fadeUp 0.28s ease ${Math.min(i, 15) * 0.025}s both`,
      }}>
        {/* Row 1: user + activity tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
              background: av.bg, border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: av.fg,
            }}>
              {getInitials(log)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: T.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.profiles?.first_name || '—'} {log.profiles?.last_name || ''}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: T.textDim,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.profiles?.email}
              </p>
            </div>
          </div>
          <span style={{
            padding: '3px 9px', borderRadius: '6px', fontSize: '0.68rem',
            fontWeight: 700, display: 'inline-block', flexShrink: 0,
            background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
          }}>
            {log.reason}
          </span>
        </div>

        {/* Row 2: meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: T.textDim }}>
            <Calendar size={10} color={T.textDim} /> {date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: T.textDim }}>
            <Clock size={10} /> {time}
            <span style={{ color: T.textFaint, marginLeft: '2px' }}>· {relative}</span>
          </span>
          {log.profiles?.college_office && (
            <span style={{ fontSize: '0.7rem', color: T.textDim }}>
              {log.profiles.college_office}
            </span>
          )}
          {log.profiles?.student_number && (
            <span style={{ fontSize: '0.7rem', color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              {log.profiles.student_number}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: '16px', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: isMobile ? '14px' : '18px 22px',
          borderBottom: `1px solid ${T.border}`, background: T.surfaceHi,
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: T.blueDim, border: '1px solid rgba(59,130,246,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={16} color={T.blueLight} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: T.text }}>Activity History</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: T.textDim }}>
                  {loading ? 'Loading…'
                    : `${filteredLogs.length} record${filteredLogs.length !== 1 ? 's' : ''}`
                    + (lastUpdated ? ` · ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '')}
                </p>
              </div>
            </div>

            {/* Refresh + search on same row (top right) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => fetchLogs(true)} disabled={loading || refreshing}
                title="Refresh logs"
                style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: '9px', color: refreshing ? T.blue : T.textDim,
                  cursor: 'pointer', padding: '7px', display: 'flex', alignItems: 'center', lineHeight: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.blueLight; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                onMouseLeave={e => { if (!refreshing) { e.currentTarget.style.color = T.textDim; e.currentTarget.style.borderColor = T.border; } }}
              >
                <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: T.surface, border: `1px solid ${T.border}`,
                padding: '7px 12px', borderRadius: '9px',
                flex: 1, minWidth: isMobile ? '0' : '190px',
              }}>
                <Search size={13} color={T.textDim} style={{ flexShrink: 0 }} />
                <input type="text" placeholder={isMobile ? 'Search…' : 'Search name, email or ID…'}
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: T.text,
                    outline: 'none', width: '100%', fontSize: '0.78rem', fontFamily: 'inherit' }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')}
                    style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: '0', lineHeight: 0 }}>
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reason filter pills — scroll horizontally on mobile */}
          <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
            <div style={{
              display: 'flex', gap: '4px',
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: '10px', padding: '3px',
              width: 'fit-content', minWidth: '100%',
            }}>
              <button onClick={() => setFilterReason('all')}
                style={{
                  padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap',
                  background: filterReason === 'all' ? T.blue : 'transparent',
                  color: filterReason === 'all' ? 'white' : T.textDim, transition: 'all 0.15s',
                }}>
                All
              </button>
              {REASONS.map(r => {
                const rc = reasonConfig[r];
                const isActive = filterReason === r;
                return (
                  <button key={r} onClick={() => setFilterReason(r)}
                    style={{
                      padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap',
                      background: isActive ? rc.bg : 'transparent',
                      color: isActive ? rc.color : T.textDim,
                      border: isActive ? `1px solid ${rc.border}` : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content: cards on mobile, table on tablet/desktop ── */}
        {loading ? (
          <div style={{ padding: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '30px', height: '30px', border: `2px solid ${T.border}`,
              borderTopColor: T.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: T.textDim, fontSize: '0.85rem', margin: 0 }}>Loading visit records…</p>
          </div>
        ) : error ? (
          <div style={{ padding: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#f87171' }}>
            <AlertCircle size={26} strokeWidth={1.5} />
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{error}</p>
            <button onClick={() => fetchLogs()}
              style={{ marginTop: '4px', fontSize: '0.75rem', color: T.blueLight, background: 'none',
                border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Try again
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Inbox size={32} color={T.textFaint} strokeWidth={1.5} />
            <p style={{ color: T.textDim, fontSize: '0.85rem', margin: '0 0 2px' }}>
              {searchTerm || filterReason !== 'all' ? 'No matching records' : 'No visit logs yet'}
            </p>
            <p style={{ color: T.textFaint, fontSize: '0.75rem', margin: 0 }}>
              {searchTerm || filterReason !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Logs will appear here once users visit'}
            </p>
          </div>
        ) : isMobile ? (
          /* Mobile: card list */
          <div>
            {pagedLogs.map((log, i) => renderMobileCard(log, i))}
          </div>
        ) : (
          /* Tablet / Desktop: table */
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isTablet ? '580px' : 'unset' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {[
                    { label: 'Timestamp',                w: '18%' },
                    { label: 'User',                     w: '28%' },
                    { label: isTablet ? 'Dept' : 'Department', w: '20%' },
                    { label: 'Activity',                 w: '14%' },
                    { label: isTablet ? 'ID' : 'ID Number', w: '20%' },
                  ].map(h => (
                    <th key={h.label} style={{
                      padding: '10px 18px', fontSize: '0.58rem', textTransform: 'uppercase',
                      letterSpacing: '1px', fontWeight: 700, color: T.textDim,
                      borderBottom: `1px solid ${T.border}`, width: h.w, whiteSpace: 'nowrap',
                    }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedLogs.map((log, i) => {
                  const { date, time, relative } = formatDate(log.timestamp);
                  const rc    = reasonConfig[log.reason] || reasonConfig['Others'];
                  const av    = getAvatarColor(log);
                  const isHov = hoveredRow === log.id;
                  return (
                    <tr key={log.id}
                      onMouseEnter={() => setHoveredRow(log.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: isHov ? 'rgba(59,130,246,0.04)' : 'transparent',
                        transition: 'background 0.12s ease',
                        animation: `fadeUp 0.28s ease ${Math.min(i, 15) * 0.025}s both`,
                      }}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '0.76rem', color: T.text, fontWeight: 500 }}>
                            <Calendar size={10} color={T.textDim} style={{ flexShrink: 0 }} /> {date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: T.textDim }}>
                            <Clock size={9} style={{ flexShrink: 0 }} /> {time}
                            {!isTablet && (
                              <span style={{ color: T.textFaint, fontSize: '0.62rem', marginLeft: '2px' }}>· {relative}</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                            background: av.bg, border: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, color: av.fg,
                          }}>
                            {getInitials(log)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: T.text,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.profiles?.first_name || '—'} {log.profiles?.last_name || ''}
                            </p>
                            {!isTablet && (
                              <p style={{ margin: 0, fontSize: '0.68rem', color: T.textDim,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {log.profiles?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dept */}
                      <td style={{ padding: '12px 18px', color: T.textDim, fontSize: '0.76rem' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '140px' }}>
                          {log.profiles?.college_office || '—'}
                        </span>
                      </td>

                      {/* Activity */}
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: '6px', fontSize: '0.68rem',
                          fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap',
                          background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                        }}>
                          {log.reason}
                        </span>
                      </td>

                      {/* ID */}
                      <td style={{ padding: '12px 18px', color: T.textDim, fontSize: '0.73rem',
                        fontFamily: "'JetBrains Mono', monospace" }}>
                        {log.profiles?.student_number || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && filteredLogs.length > PAGE_SIZE && (
          <div style={{
            padding: isMobile ? '10px 14px' : '12px 22px',
            borderTop: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: T.surfaceHi, flexWrap: 'wrap', gap: '8px',
          }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: T.textDim }}>
              <strong style={{ color: T.textMid }}>{page}</strong> / <strong style={{ color: T.textMid }}>{totalPages}</strong>
              {' '}· <strong style={{ color: T.textMid }}>{filteredLogs.length}</strong> records
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: '← Prev', fn: () => setPage(p => Math.max(1, p - 1)),          disabled: page === 1          },
                { label: 'Next →', fn: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
              ].map(btn => (
                <button key={btn.label} onClick={btn.fn} disabled={btn.disabled}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.73rem', fontWeight: 600,
                    fontFamily: 'inherit', cursor: btn.disabled ? 'not-allowed' : 'pointer',
                    background: btn.disabled ? 'transparent' : T.blueDim,
                    color: btn.disabled ? T.textFaint : T.blueLight,
                    border: `1px solid ${btn.disabled ? T.border : 'rgba(59,130,246,0.25)'}`,
                    transition: 'all 0.15s',
                  }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Non-paginated footer */}
        {!loading && !error && filteredLogs.length > 0 && filteredLogs.length <= PAGE_SIZE && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}`,
            background: T.surfaceHi, display: 'flex', justifyContent: 'flex-end' }}>
            <p style={{ margin: 0, fontSize: '0.68rem', color: T.textDim }}>
              {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to   { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboardLogs;