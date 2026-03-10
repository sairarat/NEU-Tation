import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart3, Clock, ShieldCheck } from 'lucide-react';

const AdminDashboardAnalytics = () => {
  const [loading, setLoading]       = useState(true);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  const [stats, setStats]         = useState({ total: 0, students: 0, faculty: 0, admins: 0, activeToday: 0 });
  const [deptStats, setDeptStats] = useState<{ name: string; count: number }[]>([]);
  const [peakStats, setPeakStats] = useState({
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

        const { data: logs, error: lError } = await supabase.from('logs').select('timestamp');
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

          const hourlyBuckets = Array(24).fill(0);
          logs.forEach(log => { hourlyBuckets[new Date(log.timestamp).getHours()]++; });

          const maxVisits   = Math.max(...hourlyBuckets);
          const peakHourIdx = hourlyBuckets.indexOf(maxVisits);
          const peakLabel   = peakHourIdx === 0 ? "12 AM"
            : peakHourIdx < 12  ? `${peakHourIdx} AM`
            : peakHourIdx === 12 ? "12 PM"
            : `${peakHourIdx - 12} PM`;

          setPeakStats({ buckets: hourlyBuckets, peakTime: peakLabel, maxCount: maxVisits });

          const depts: any = {};
          filteredProfiles.forEach(u => {
            const name = u.college_office || 'Unspecified';
            depts[name] = (depts[name] || 0) + 1;
          });

          setDeptStats(Object.entries(depts).map(([name, count]) => ({ name, count: count as number })));
          setStats({
            total:       filteredProfiles.length,
            students:    filteredProfiles.filter(u => u.role === 'student').length,
            faculty:     filteredProfiles.filter(u => u.role === 'staff').length,
            admins:      filteredProfiles.filter(u => u.role === 'admin').length,
            activeToday: profiles.filter(u => u.is_active !== false).length,
          });
        }
      } catch (err) {
        console.error("Intelligence Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComprehensiveAnalytics();
  }, [timeFilter, startDate, endDate]);

  const total  = stats.total || 1;
  const sPerc  = (stats.students / total) * 100;
  const fPerc  = (stats.faculty  / total) * 100;
  const maxDept = Math.max(...deptStats.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 text-slate-400">
        Calculating Library Intelligence...
      </div>
    );
  }

  // ── analytics-vertical-container shared style ──
  const vertContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: '24px',
    background: 'rgba(30,41,59,0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  return (
    // dual-analytics-wrapper (final override: flex-row, gap 30px, max-width 800px)
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '30px',
        width: '100%',
        maxWidth: '800px',
      }}
    >

      {/* ── LEFT: Library Intelligence ── */}
      <div style={vertContainerStyle}>

        {/* analytics-v-header */}
        <header
          className="flex justify-between items-center"
          style={{ color: 'rgb(221,219,219)' }}
        >
          {/* header-title */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            <BarChart3 size={20} color="#60a5fa" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Library Intelligence
            </h2>
          </div>

          {/* time-filter-select */}
          <select
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
            }}
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </header>

        {/* v-custom-date-stack */}
        {timeFilter === 'custom' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(15,23,42,0.4)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* v-date-field */}
            <div className="flex justify-between items-center">
              <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  background: 'rgba(30,41,59,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  outline: 'none',
                  colorScheme: 'dark',
                } as React.CSSProperties}
              />
            </div>
            {/* v-date-field */}
            <div className="flex justify-between items-center">
              <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  background: 'rgba(30,41,59,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  outline: 'none',
                  colorScheme: 'dark',
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* v-chart-container */}
        <div
          className="flex flex-col items-center"
          style={{
            gap: '15px',
            padding: '15px 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* css-pie-chart-small */}
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              margin: '0 auto',
              background: `conic-gradient(#60a5fa 0% ${sPerc}%, #4ade80 ${sPerc}% ${sPerc + fPerc}%, #f43f5e ${sPerc + fPerc}% 100%)`,
            }}
          />

          {/* v-legend-stack */}
          <div className="w-full flex flex-col" style={{ gap: '8px' }}>
            {[
              { dotClass: 'bg-[#60a5fa]', dotColor: '#60a5fa', label: `Students (${sPerc.toFixed(0)}%)` },
              { dotClass: 'bg-[#4ade80]', dotColor: '#4ade80', label: `Faculty (${fPerc.toFixed(0)}%)` },
              { dotClass: 'bg-[#f43f5e]', dotColor: '#f43f5e', label: `Admins (${(100 - sPerc - fPerc).toFixed(0)}%)` },
            ].map(({ dotColor, label }) => (
              // v-legend-item
              <div key={label} className="flex items-center" style={{ gap: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                {/* dot */}
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Library Engagement ── */}
      <div style={vertContainerStyle}>

        {/* analytics-v-header */}
        <header
          className="flex justify-between items-center"
          style={{ color: 'rgb(221,219,219)' }}
        >
          {/* header-title */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            <ShieldCheck size={20} color="#c084fc" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Library Engagement
            </h2>
          </div>
        </header>

        {/* dept-distribution-stack */}
        <div style={{ marginBottom: '10px' }}>
          {/* v-section-label */}
          <p
            className="flex items-center"
            style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', gap: '8px' }}
          >
            Active Departments
          </p>

          {deptStats.sort((a, b) => b.count - a.count).slice(0, 3).map(dept => (
            // dept-bar-row
            <div key={dept.name} style={{ marginBottom: '12px' }}>
              {/* dept-name */}
              <span
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: '#cbd5e1',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dept.name}
              </span>
              {/* dept-bar-bg */}
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                {/* dept-bar-fill */}
                <div
                  style={{
                    height: '100%',
                    background: '#a855f7',
                    borderRadius: '10px',
                    width: `${(dept.count / maxDept) * 100}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Peak hour section */}
        <div>
          {/* v-section-label */}
          <p
            className="flex items-center"
            style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', gap: '8px' }}
          >
            <Clock size={14} />
            Peak Visit: <strong style={{ color: '#60a5fa', marginLeft: '4px' }}>{peakStats.peakTime}</strong>
          </p>

          {/* hourly-heatmap-container */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(24, 1fr)',
              gap: '2px',
              height: '45px',
              alignItems: 'flex-end',
              paddingTop: '10px',
            }}
          >
            {peakStats.buckets.map((count, hr) => (
              // heatmap-bar
              <div
                key={hr}
                title={`${hr}:00 - ${count} activities`}
                style={{
                  background: '#60a5fa',
                  borderRadius: '2px 2px 0 0',
                  width: '100%',
                  height: `${(count / (peakStats.maxCount || 1)) * 100}%`,
                  opacity: count === 0 ? 0.1 : 0.3 + (count / peakStats.maxCount) * 0.7,
                  transition: 'height 0.3s ease, opacity 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* hour-labels-row */}
          <div
            className="flex justify-between"
            style={{ marginTop: '6px', fontSize: '0.65rem', color: '#475569' }}
          >
            <span>12am</span><span>12pm</span><span>11pm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAnalytics;