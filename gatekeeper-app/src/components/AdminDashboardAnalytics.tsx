import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Clock, Users, GraduationCap, Briefcase, Activity,
  Book, Search, Monitor, PenTool, Plus,
} from 'lucide-react';

/* ── Reason config — mirrors ReasonSelection.tsx ── */
const reasonConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  'Reading':      { color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.22)',  icon: Book    },
  'Research':     { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)',  icon: Search  },
  'Computer Use': { color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)',  icon: Monitor },
  'Studying':     { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)', icon: PenTool },
  'Others':       { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.22)', icon: Plus    },
};

const AdminDashboardAnalytics = () => {
  const [loading, setLoading]       = useState(true);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  const [stats, setStats]           = useState({ total: 0, students: 0, faculty: 0, admins: 0, activeToday: 0 });
  const [deptStats, setDeptStats]   = useState<{ name: string; count: number }[]>([]);
  const [reasonStats, setReasonStats] = useState<{ reason: string; count: number }[]>([]);
  const [peakStats, setPeakStats]   = useState({
    buckets: Array(24).fill(0),
    peakTime: '---',
    maxCount: 0,
  });

  useEffect(() => {
    const fetchComprehensiveAnalytics = async () => {
      try {
        setLoading(true);
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
        if (pError) throw pError;

        // Fetch logs with reason field for frequency analysis
        const { data: logs, error: lError } = await supabase
          .from('logs')
          .select('timestamp, reason');
        if (lError) throw lError;

        if (profiles && logs) {
          const now = new Date();

          const filteredProfiles = profiles.filter(u => {
            const d = new Date(u.created_at || now);
            if (timeFilter === 'today') return d.toDateString() === now.toDateString();
            if (timeFilter === 'custom' && startDate && endDate)
              return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
            return true;
          });

          // Filter logs by time range too
          const filteredLogs = logs.filter(log => {
            const d = new Date(log.timestamp);
            if (timeFilter === 'today') return d.toDateString() === now.toDateString();
            if (timeFilter === 'weekly') {
              const weekAgo = new Date(now);
              weekAgo.setDate(now.getDate() - 7);
              return d >= weekAgo;
            }
            if (timeFilter === 'custom' && startDate && endDate)
              return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
            return true;
          });

          // Hourly buckets
          const hourlyBuckets = Array(24).fill(0);
          filteredLogs.forEach(log => { hourlyBuckets[new Date(log.timestamp).getHours()]++; });
          const maxVisits   = Math.max(...hourlyBuckets);
          const peakHourIdx = hourlyBuckets.indexOf(maxVisits);
          const peakLabel   = peakHourIdx === 0 ? '12 AM'
            : peakHourIdx < 12  ? `${peakHourIdx} AM`
            : peakHourIdx === 12 ? '12 PM'
            : `${peakHourIdx - 12} PM`;
          setPeakStats({ buckets: hourlyBuckets, peakTime: peakLabel, maxCount: maxVisits });

          // Department breakdown
          const depts: Record<string, number> = {};
          filteredProfiles.forEach(u => {
            const name = u.college_office || 'Unspecified';
            depts[name] = (depts[name] || 0) + 1;
          });
          setDeptStats(Object.entries(depts).map(([name, count]) => ({ name, count })));

          // ── Reason frequency ──
          const reasons: Record<string, number> = {};
          filteredLogs.forEach(log => {
            if (log.reason) reasons[log.reason] = (reasons[log.reason] || 0) + 1;
          });
          // Sort by count descending
          setReasonStats(
            Object.entries(reasons)
              .map(([reason, count]) => ({ reason, count }))
              .sort((a, b) => b.count - a.count)
          );

          setStats({
            total:       filteredProfiles.length,
            students:    filteredProfiles.filter(u => u.role === 'student').length,
            faculty:     filteredProfiles.filter(u => u.role === 'staff').length,
            admins:      filteredProfiles.filter(u => u.role === 'admin').length,
            activeToday: profiles.filter(u => u.is_active !== false).length,
          });
        }
      } catch (err) {
        console.error('Intelligence Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComprehensiveAnalytics();
  }, [timeFilter, startDate, endDate]);

  const total       = stats.total || 1;
  const sPerc       = (stats.students / total) * 100;
  const fPerc       = (stats.faculty  / total) * 100;
  const aPerc       = (stats.admins   / total) * 100;
  const maxDept     = Math.max(...deptStats.map(d => d.count), 1);
  const totalVisits = reasonStats.reduce((sum, r) => sum + r.count, 0) || 1;
  const maxReason   = Math.max(...reasonStats.map(r => r.count), 1);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#334155', fontSize: '0.88rem' }}>
        Calculating Library Intelligence…
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users',     value: stats.total,      icon: Users,        color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.18)'  },
    { label: 'Students',        value: stats.students,   icon: GraduationCap,color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.18)'  },
    { label: 'Staff / Faculty', value: stats.faculty,    icon: Briefcase,    color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.18)' },
    { label: 'Active Accounts', value: stats.activeToday,icon: Activity,     color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.18)'  },
  ];

  const panelStyle: React.CSSProperties = {
    flex: 1,
    padding: '22px',
    background: 'rgba(13,21,38,0.80)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  };

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    padding: '5px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    outline: 'none',
    cursor: 'pointer',
  };

  const deptColors = ['#60a5fa', '#34d399', '#c084fc', '#fb923c', '#f87171'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '960px' }}>

      {/* ══════════════════════════════
          STAT CARDS
      ══════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <div
            key={label}
            style={{
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: '14px',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform  = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow  = `0 8px 24px ${border}`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform  = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow  = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {label}
              </p>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: `${color}20`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} color={color} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-1px' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════
          TOP ROW — User Breakdown + Dept Engagement
      ══════════════════════════════ */}
      <div style={{ display: 'flex', gap: '18px' }}>

        {/* LEFT — User Breakdown (donut) */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '3px', height: '18px', background: '#60a5fa', borderRadius: '2px' }} />
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>User Breakdown</h2>
            </div>
            <select style={selectStyle} value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {timeFilter === 'custom' && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {[['From', startDate, setStartDate], ['To', endDate, setEndDate]].map(([label, val, setter]: any) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                  <input
                    type="date" value={val} onChange={e => setter(e.target.value)}
                    style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px', outline: 'none', colorScheme: 'dark' } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '6px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <div style={{
                width: '130px', height: '130px', borderRadius: '50%',
                background: `conic-gradient(#60a5fa 0% ${sPerc}%, #34d399 ${sPerc}% ${sPerc + fPerc}%, #c084fc ${sPerc + fPerc}% ${sPerc + fPerc + aPerc}%, rgba(255,255,255,0.05) ${sPerc + fPerc + aPerc}% 100%)`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '72px', height: '72px', borderRadius: '50%', background: '#0d1526',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{stats.total}</p>
                <p style={{ margin: 0, fontSize: '0.55rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Users</p>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                { color: '#60a5fa', label: 'Students', perc: sPerc, count: stats.students },
                { color: '#34d399', label: 'Faculty',  perc: fPerc, count: stats.faculty  },
                { color: '#c084fc', label: 'Admins',   perc: aPerc, count: stats.admins   },
              ].map(({ color, label, perc, count }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{count}</span>
                    <span style={{ fontSize: '0.7rem', color: '#334155' }}>{perc.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Dept Engagement + Hourly heatmap */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '18px', background: '#c084fc', borderRadius: '2px' }} />
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Dept. Engagement</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '0.62rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              Top Departments
            </p>
            {deptStats.sort((a, b) => b.count - a.count).slice(0, 4).map((dept, i) => (
              <div key={dept.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {dept.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#475569', flexShrink: 0, marginLeft: '8px', fontWeight: 600 }}>
                    {dept.count}
                  </span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: deptColors[i % deptColors.length], borderRadius: '10px',
                    width: `${(dept.count / maxDept) * 100}%`, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)', opacity: 0.85,
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '0.62rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} /> Hourly Activity
              </p>
              <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>
                Peak: {peakStats.peakTime}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px', height: '50px', alignItems: 'flex-end' }}>
              {peakStats.buckets.map((count, hr) => {
                const ratio = count / (peakStats.maxCount || 1);
                return (
                  <div key={hr} title={`${hr}:00 — ${count} visits`} style={{
                    borderRadius: '2px 2px 0 0', width: '100%',
                    height: `${Math.max(ratio * 100, count === 0 ? 6 : 0)}%`,
                    background: count === 0 ? 'rgba(255,255,255,0.04)' : `rgba(96,165,250,${0.25 + ratio * 0.75})`,
                    transition: 'height 0.4s ease, background 0.2s',
                  }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.6rem', color: '#1e293b' }}>
              <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          BOTTOM ROW — Visit Reason Frequency (full width)
      ══════════════════════════════ */}
      <div style={{
        ...panelStyle,
        flex: 'unset',
        gap: '20px',
      }}>
        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '18px', background: '#fb923c', borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
                Visit Reason Frequency
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#475569' }}>
                {totalVisits} total visits logged
              </p>
            </div>
          </div>
          {/* Total visits badge */}
          <div style={{
            background: 'rgba(251,146,60,0.10)',
            border: '1px solid rgba(251,146,60,0.22)',
            borderRadius: '8px',
            padding: '5px 12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fb923c',
          }}>
            {timeFilter === 'today' ? 'Today' : timeFilter === 'weekly' ? 'This Week' : timeFilter === 'custom' ? 'Custom Range' : 'All Time'}
          </div>
        </div>

        {reasonStats.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.85rem', padding: '20px 0', margin: 0 }}>
            No visit logs recorded for this period.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

            {/* Left: horizontal bar chart */}
            <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reasonStats.map((r, i) => {
                const cfg      = reasonConfig[r.reason] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.22)', icon: Plus };
                const IconComp = cfg.icon;
                const pct      = ((r.count / totalVisits) * 100).toFixed(1);
                const barWidth = (r.count / maxReason) * 100;

                return (
                  <div
                    key={r.reason}
                    style={{ animation: `fadeUp 0.35s ease ${i * 0.07}s both` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Icon chip */}
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <IconComp size={13} color={cfg.color} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500 }}>{r.reason}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{r.count}</span>
                        <span style={{ fontSize: '0.7rem', color: '#475569', minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    {/* Bar */}
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        background: cfg.color,
                        borderRadius: '10px',
                        opacity: 0.85,
                        transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch' }} />

            {/* Right: donut + rank cards */}
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>

              {/* Mini donut for reasons */}
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                {(() => {
                  let cursor = 0;
                  const segments = reasonStats.map(r => {
                    const cfg  = reasonConfig[r.reason] || { color: '#94a3b8' };
                    const pct  = (r.count / totalVisits) * 100;
                    const seg  = { color: cfg.color, from: cursor, to: cursor + pct };
                    cursor += pct;
                    return seg;
                  });
                  const gradient = segments.map(s => `${s.color} ${s.from.toFixed(1)}% ${s.to.toFixed(1)}%`).join(', ');
                  return (
                    <>
                      <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: `conic-gradient(${gradient})`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        width: '64px', height: '64px', borderRadius: '50%', background: '#0d1526',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{totalVisits}</p>
                        <p style={{ margin: 0, fontSize: '0.5rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>visits</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Rank list */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {reasonStats.map((r, i) => {
                  const cfg = reasonConfig[r.reason] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' };
                  return (
                    <div key={r.reason} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: '8px',
                      background: i === 0 ? cfg.bg : 'transparent',
                      border: i === 0 ? `1px solid ${cfg.color}30` : '1px solid transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 800, color: i === 0 ? cfg.color : '#334155',
                          minWidth: '14px', textAlign: 'center',
                        }}>
                          #{i + 1}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: i === 0 ? '#e2e8f0' : '#64748b' }}>{r.reason}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? cfg.color : '#475569' }}>
                        {((r.count / totalVisits) * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardAnalytics;