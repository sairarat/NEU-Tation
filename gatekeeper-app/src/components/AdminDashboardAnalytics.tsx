import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Clock, Users, GraduationCap, Briefcase, Activity,
  Book, Search, Monitor, PenTool, Plus, TrendingUp,
  CalendarDays, RefreshCw,
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

const reasonConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  'Reading':      { color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)',  icon: Book,    label: 'Reading'      },
  'Research':     { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)',  icon: Search,  label: 'Research'     },
  'Computer Use': { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)',  icon: Monitor, label: 'Computer Use' },
  'Studying':     { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)', icon: PenTool, label: 'Studying'     },
  'Others':       { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.22)', icon: Plus,    label: 'Others'       },
};

const deptColors = ['#60a5fa', '#34d399', '#c084fc', '#fb923c', '#f87171', '#38bdf8', '#a78bfa'];

const AdminDashboardAnalytics = () => {
  const width    = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width < 900;

  const [loading, setLoading]         = useState(true);
  const [timeFilter, setTimeFilter]   = useState('monthly');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [stats, setStats]             = useState({ total: 0, students: 0, faculty: 0, admins: 0, activeToday: 0 });
  const [deptStats, setDeptStats]     = useState<{ name: string; count: number }[]>([]);
  const [reasonStats, setReasonStats] = useState<{ reason: string; count: number }[]>([]);
  const [peakStats, setPeakStats]     = useState({ buckets: Array(24).fill(0), peakTime: '---', maxCount: 0 });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;
      const { data: logs, error: lError } = await supabase.from('logs').select('timestamp, reason');
      if (lError) throw lError;

      if (profiles && logs) {
        const now = new Date();

        const fp = profiles.filter(u => {
          const d = new Date(u.created_at || now);
          if (timeFilter === 'today') return d.toDateString() === now.toDateString();
          if (timeFilter === 'custom' && startDate && endDate)
            return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
          return true;
        });

        const fl = logs.filter(log => {
          const d = new Date(log.timestamp);
          if (timeFilter === 'today') return d.toDateString() === now.toDateString();
          if (timeFilter === 'weekly') { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
          if (timeFilter === 'custom' && startDate && endDate)
            return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
          return true;
        });

        const hb = Array(24).fill(0);
        fl.forEach(l => { hb[new Date(l.timestamp).getHours()]++; });
        const mx  = Math.max(...hb);
        const idx = hb.indexOf(mx);
        const lbl = idx === 0 ? '12 AM' : idx < 12 ? `${idx} AM` : idx === 12 ? '12 PM' : `${idx - 12} PM`;
        setPeakStats({ buckets: hb, peakTime: lbl, maxCount: mx });

        const depts: Record<string, number> = {};
        fp.forEach(u => { const n = u.college_office || 'Unspecified'; depts[n] = (depts[n] || 0) + 1; });
        setDeptStats(Object.entries(depts).map(([name, count]) => ({ name, count })));

        const reasons: Record<string, number> = {};
        fl.forEach(l => { if (l.reason) reasons[l.reason] = (reasons[l.reason] || 0) + 1; });
        setReasonStats(Object.entries(reasons).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count));

        setStats({
          total:       fp.length,
          students:    fp.filter(u => u.role === 'student').length,
          faculty:     fp.filter(u => u.role === 'staff').length,
          admins:      fp.filter(u => u.role === 'admin').length,
          activeToday: profiles.filter(u => u.is_active !== false).length,
        });
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [timeFilter, startDate, endDate]);

  const total       = stats.total || 1;
  const sPerc       = (stats.students / total) * 100;
  const fPerc       = (stats.faculty  / total) * 100;
  const aPerc       = (stats.admins   / total) * 100;
  const maxDept     = Math.max(...deptStats.map(d => d.count), 1);
  const totalVisits = reasonStats.reduce((s, r) => s + r.count, 0) || 1;
  const maxReason   = Math.max(...reasonStats.map(r => r.count), 1);

  const statCards = [
    { label: 'Total Users',     value: stats.total,       icon: Users,        color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.18)'  },
    { label: 'Students',        value: stats.students,    icon: GraduationCap,color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)'  },
    { label: 'Staff / Faculty', value: stats.faculty,     icon: Briefcase,    color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.18)' },
    { label: 'Active Accounts', value: stats.activeToday, icon: Activity,     color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.18)'  },
  ];

  const panelStyle: React.CSSProperties = {
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '14px', padding: isMobile ? '16px' : '20px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  };

  const filterOptions = [
    { value: 'today',   label: isMobile ? 'Today'  : 'Today'     },
    { value: 'weekly',  label: isMobile ? 'Week'   : 'This Week' },
    { value: 'monthly', label: isMobile ? 'All'    : 'All Time'  },
    { value: 'custom',  label: isMobile ? 'Custom' : 'Custom'    },
  ];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '80px' }}>
      <div style={{ width: '36px', height: '36px', border: `2px solid ${T.border}`,
        borderTopColor: T.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: T.textDim, fontSize: '0.88rem', margin: 0 }}>Calculating Library Intelligence…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: T.blueDim, border: '1px solid rgba(59,130,246,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} color={T.blueLight} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: T.text }}>Library Analytics</h1>
            {lastUpdated && (
              <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: T.textDim }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', background: T.surfaceHi, border: `1px solid ${T.border}`,
            borderRadius: '10px', overflow: 'hidden', padding: '3px', gap: '2px',
          }}>
            {filterOptions.map(opt => (
              <button key={opt.value} onClick={() => setTimeFilter(opt.value)}
                style={{
                  padding: isMobile ? '5px 8px' : '6px 12px',
                  borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 600, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: timeFilter === opt.value ? T.blue : 'transparent',
                  color: timeFilter === opt.value ? 'white' : T.textDim,
                  transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                }}>
                {opt.value === 'custom' && <CalendarDays size={11} />}
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchAll}
            style={{
              background: T.surfaceHi, border: `1px solid ${T.border}`,
              borderRadius: '9px', color: T.textDim, cursor: 'pointer',
              padding: '8px', display: 'flex', alignItems: 'center', lineHeight: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.blueLight; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textDim; e.currentTarget.style.borderColor = T.border; }}
            title="Refresh data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Custom date range */}
      {timeFilter === 'custom' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
          flexWrap: 'wrap',
        }}>
          <CalendarDays size={15} color={T.blueLight} style={{ flexShrink: 0 }} />
          {[['From', startDate, setStartDate], ['To', endDate, setEndDate]].map(([label, val, setter]: any) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.68rem', color: T.textDim, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                {label}
              </label>
              <input type="date" value={val} onChange={e => setter(e.target.value)}
                style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  color: T.text, fontSize: '0.78rem', padding: '5px 8px',
                  borderRadius: '8px', outline: 'none', colorScheme: 'dark', fontFamily: 'inherit',
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Stat cards — 2 cols on mobile, 4 on desktop ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '10px',
      }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <div key={label} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: '13px',
            padding: isMobile ? '14px 12px' : '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            animation: `fadeUp 0.38s ease ${i * 0.06}s both`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 28px ${border}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '0.6rem', color: T.textDim, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1.3 }}>{label}</p>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                background: `${color}22`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800,
              color: T.text, lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Donut + Dept — stack on mobile ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
        gap: '14px',
      }}>
        {/* User Breakdown */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '16px', background: T.blue, borderRadius: '2px', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: T.text }}>User Breakdown</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: `conic-gradient(
                  #60a5fa 0% ${sPerc}%,
                  #34d399 ${sPerc}% ${sPerc + fPerc}%,
                  #c084fc ${sPerc + fPerc}% ${sPerc + fPerc + aPerc}%,
                  ${T.textFaint} ${sPerc + fPerc + aPerc}% 100%
                )`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: '58px', height: '58px', borderRadius: '50%', background: T.surface,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{stats.total}</p>
                <p style={{ margin: 0, fontSize: '0.48rem', color: T.textDim, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.5px' }}>total</p>
              </div>
            </div>
            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[
                { color: '#60a5fa', label: 'Students', count: stats.students, perc: sPerc },
                { color: '#34d399', label: 'Faculty',  count: stats.faculty,  perc: fPerc },
                { color: '#c084fc', label: 'Admins',   count: stats.admins,   perc: aPerc },
              ].map(({ color, label, count, perc }) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '2px',
                        background: color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: T.textMid }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.text }}>{count}</span>
                      <span style={{ fontSize: '0.65rem', color: T.textDim }}>{perc.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${perc}%`, background: color,
                      borderRadius: '10px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dept Engagement */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '16px', background: '#c084fc', borderRadius: '2px', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: T.text }}>Dept. Engagement</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {deptStats.sort((a, b) => b.count - a.count).slice(0, 5).map((dept, i) => (
              <div key={dept.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '2px', flexShrink: 0,
                      background: deptColors[i % deptColors.length], display: 'inline-block' }} />
                    <span style={{ fontSize: '0.75rem', color: T.textMid,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dept.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: T.textDim, flexShrink: 0, marginLeft: '8px', fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace" }}>
                    {dept.count}
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: deptColors[i % deptColors.length], borderRadius: '10px',
                    width: `${(dept.count / maxDept) * 100}%`, transition: 'width 0.65s cubic-bezier(0.22,1,0.36,1)', opacity: 0.85 }} />
                </div>
              </div>
            ))}
            {deptStats.length === 0 && (
              <p style={{ color: T.textDim, fontSize: '0.82rem', margin: 0, textAlign: 'center', padding: '16px 0' }}>
                No department data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Hourly heatmap ── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '16px', background: '#fb923c', borderRadius: '2px', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: T.text }}>Hourly Visit Activity</h2>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)',
            padding: '4px 10px', borderRadius: '20px',
          }}>
            <Clock size={11} color={T.blueLight} />
            <span style={{ fontSize: '0.7rem', color: T.blueLight, fontWeight: 700 }}>
              Peak: {peakStats.peakTime}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px',
          height: isMobile ? '42px' : '56px', alignItems: 'flex-end' }}>
          {peakStats.buckets.map((count, hr) => {
            const ratio  = count / (peakStats.maxCount || 1);
            const isPeak = count === peakStats.maxCount && count > 0;
            return (
              <div key={hr} title={`${hr}:00 — ${count} visits`} style={{
                borderRadius: '2px 2px 0 0', width: '100%',
                height: `${Math.max(ratio * 100, count === 0 ? 8 : 0)}%`,
                background: isPeak ? '#fb923c' : count === 0 ? 'rgba(255,255,255,0.04)' : `rgba(96,165,250,${0.2 + ratio * 0.75})`,
                transition: 'height 0.4s ease',
                boxShadow: isPeak ? '0 0 6px rgba(251,146,60,0.4)' : 'none',
              }} />
            );
          })}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: isMobile ? '0.55rem' : '0.6rem', color: T.textFaint, marginTop: '-4px',
        }}>
          {(isMobile
            ? ['12A','6A','12P','6P','11P']
            : ['12 AM','3 AM','6 AM','9 AM','12 PM','3 PM','6 PM','9 PM','11 PM']
          ).map(t => <span key={t}>{t}</span>)}
        </div>
      </div>

      {/* ── Visit Reason Frequency ── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '16px', background: '#34d399', borderRadius: '2px', flexShrink: 0 }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: T.text }}>Visit Reason Frequency</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: T.textDim }}>
                {totalVisits.toLocaleString()} logged visits
              </p>
            </div>
          </div>
          <div style={{
            background: 'rgba(251,146,60,0.09)', border: '1px solid rgba(251,146,60,0.20)',
            borderRadius: '8px', padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#fb923c',
          }}>
            {timeFilter === 'today' ? 'Today' : timeFilter === 'weekly' ? 'This Week' : timeFilter === 'custom' ? 'Custom' : 'All Time'}
          </div>
        </div>

        {reasonStats.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ color: T.textDim, fontSize: '0.85rem', margin: '0 0 4px' }}>No visit logs for this period</p>
            <p style={{ color: T.textFaint, fontSize: '0.75rem', margin: 0 }}>Try selecting a different time range</p>
          </div>
        ) : (
          /* Stack vertically on mobile */
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
            gap: '20px', alignItems: 'start',
          }}>
            {/* Bar chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {reasonStats.map((r, i) => {
                const cfg      = reasonConfig[r.reason] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', icon: Plus, label: r.reason };
                const IconComp = cfg.icon;
                const pct      = (r.count / totalVisits) * 100;
                return (
                  <div key={r.reason} style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <IconComp size={13} color={cfg.color} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: T.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.reason}
                        </span>
                        {i === 0 && (
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: cfg.color,
                            background: cfg.bg, border: `1px solid ${cfg.border}`,
                            padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase',
                            letterSpacing: '0.5px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Top
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color,
                          fontFamily: "'JetBrains Mono', monospace" }}>{r.count}</span>
                        <span style={{ fontSize: '0.7rem', color: T.textDim, minWidth: '34px', textAlign: 'right' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(r.count / maxReason) * 100}%`,
                        background: cfg.color, borderRadius: '10px', opacity: 0.85,
                        transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Donut + rank — hidden on mobile to save space */}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', minWidth: '150px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                  {(() => {
                    let c = 0;
                    const segs = reasonStats.map(r => {
                      const cfg = reasonConfig[r.reason] || { color: '#94a3b8' };
                      const p   = (r.count / totalVisits) * 100;
                      const s   = { color: cfg.color, from: c, to: c + p };
                      c += p;
                      return s;
                    });
                    const grad = segs.map(s => `${s.color} ${s.from.toFixed(1)}% ${s.to.toFixed(1)}%`).join(', ');
                    return (
                      <>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%',
                          background: `conic-gradient(${grad})`, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} />
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                          width: '56px', height: '56px', borderRadius: '50%', background: T.surface,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: T.text, lineHeight: 1 }}>{totalVisits}</p>
                          <p style={{ margin: 0, fontSize: '0.46rem', color: T.textDim, textTransform: 'uppercase',
                            letterSpacing: '0.5px', fontWeight: 600 }}>visits</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {reasonStats.map((r, i) => {
                    const cfg = reasonConfig[r.reason] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' };
                    return (
                      <div key={r.reason} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '4px 8px', borderRadius: '7px',
                        background: i === 0 ? cfg.bg : 'transparent',
                        border: i === 0 ? `1px solid ${cfg.color}28` : '1px solid transparent',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.57rem', fontWeight: 800,
                            color: i === 0 ? cfg.color : T.textDim, minWidth: '14px' }}>
                            #{i + 1}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: i === 0 ? T.text : T.textDim }}>{r.reason}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? cfg.color : T.textDim }}>
                          {((r.count / totalVisits) * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboardAnalytics;