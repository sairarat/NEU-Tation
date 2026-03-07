import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Users, BarChart3, Activity, Clock, Building, ShieldCheck } from 'lucide-react';
import '../styles/admin-dashboard-analytics.css';

const AdminDashboardAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // States for Analytics
  const [stats, setStats] = useState({ total: 0, students: 0, faculty: 0, admins: 0, activeToday: 0 });
  const [deptStats, setDeptStats] = useState<{name: string, count: number}[]>([]);
  
  // Improved Peak Stats State
  const [peakStats, setPeakStats] = useState({
    buckets: Array(24).fill(0),
    peakTime: '---',
    maxCount: 0
  });

  useEffect(() => {
    const fetchComprehensiveAnalytics = async () => {
      try {
        setLoading(true);

        // 1. Fetch User Profiles for Role & Dept Distribution
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
        if (pError) throw pError;

        // 2. Fetch Logs for ACTUAL Visit Peak Hours
        const { data: logs, error: lError } = await supabase.from('logs').select('timestamp');
        if (lError) throw lError;

        if (profiles && logs) {
          const now = new Date();
          
          // Filter Profiles for the Left Container
          const filteredProfiles = profiles.filter(u => {
            const d = new Date(u.created_at || now); // Fallback if column missing
            if (timeFilter === 'today') return d.toDateString() === now.toDateString();
            if (timeFilter === 'custom' && startDate && endDate) {
                return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59');
            }
            return true; 
          });

          // Process Peak Hours from logs table
          const hourlyBuckets = Array(24).fill(0);
          logs.forEach(log => {
            const logDate = new Date(log.timestamp);
            const hour = logDate.getHours();
            hourlyBuckets[hour]++;
          });

          const maxVisits = Math.max(...hourlyBuckets);
          const peakHourIdx = hourlyBuckets.indexOf(maxVisits);
          const peakLabel = peakHourIdx === 0 ? "12 AM" : 
                           peakHourIdx < 12 ? `${peakHourIdx} AM` : 
                           peakHourIdx === 12 ? "12 PM" : `${peakHourIdx - 12} PM`;

          setPeakStats({
            buckets: hourlyBuckets,
            peakTime: peakLabel,
            maxCount: maxVisits
          });

          // Process Department Stats
          const depts: any = {};
          filteredProfiles.forEach(u => {
            const name = u.college_office || 'Unspecified';
            depts[name] = (depts[name] || 0) + 1;
          });

          setDeptStats(Object.entries(depts).map(([name, count]) => ({ name, count: count as number })));
          setStats({
            total: filteredProfiles.length,
            students: filteredProfiles.filter(u => u.role === 'student').length,
            faculty: filteredProfiles.filter(u => u.role === 'staff').length,
            admins: filteredProfiles.filter(u => u.role === 'admin').length,
            activeToday: profiles.filter(u => u.is_active !== false).length
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

  const total = stats.total || 1;
  const sPerc = (stats.students / total) * 100;
  const fPerc = (stats.faculty / total) * 100;
  const maxDept = Math.max(...deptStats.map(d => d.count), 1);

  if (loading) return <div className="analytics-loading">Calculating Library Intelligence...</div>;

  return (
    <div className="dual-analytics-wrapper animate-fade-in">
      
      {/* LEFT: User Intelligence */}
      <div className="analytics-vertical-container">
        <header className="analytics-v-header">
          <div className="header-title">
            <BarChart3 size={20} className="text-blue" />
            <h2>Library Intelligence</h2>
          </div>
          <select className="time-filter-select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="today">Today</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </header>

        {timeFilter === 'custom' && (
          <div className="v-custom-date-stack">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        )}

        <div className="v-chart-container">
          <div className="css-pie-chart-small" style={{
            background: `conic-gradient(#60a5fa 0% ${sPerc}%, #4ade80 ${sPerc}% ${sPerc + fPerc}%, #f43f5e ${sPerc + fPerc}% 100%)`
          }}></div>
          <div className="v-legend-stack">
            <div className="v-legend-item"><span className="dot s"></span> Students ({sPerc.toFixed(0)}%)</div>
            <div className="v-legend-item"><span className="dot f"></span> Faculty ({fPerc.toFixed(0)}%)</div>
            <div className="v-legend-item"><span className="dot a"></span> Admins ({(100-sPerc-fPerc).toFixed(0)}%)</div>
          </div>
        </div>
      </div>

      {/* RIGHT: Visit Engagement */}
      <div className="analytics-vertical-container">
        <header className="analytics-v-header">
          <div className="header-title">
            <ShieldCheck size={20} className="text-purple" />
            <h2>Library Engagement</h2>
          </div>
        </header>

        <div className="dept-distribution-stack">
          <p className="v-section-label">Active Departments</p>
          {deptStats.sort((a,b) => b.count - a.count).slice(0, 3).map(dept => (
            <div key={dept.name} className="dept-bar-row">
              <span className="dept-name">{dept.name}</span>
              <div className="dept-bar-bg"><div className="dept-bar-fill" style={{ width: `${(dept.count/maxDept)*100}%` }}></div></div>
            </div>
          ))}
        </div>

        {/* Improved Peak Activity Visualization */}
        <div className="v-insights-list">
          <p className="v-section-label"><Clock size={14} /> Peak Visit: <strong>{peakStats.peakTime}</strong></p>
          
          <div className="hourly-heatmap-container">
            {peakStats.buckets.map((count, hr) => (
              <div 
                key={hr} 
                className="heatmap-bar" 
                style={{ 
                  height: `${(count / (peakStats.maxCount || 1)) * 100}%`,
                  opacity: count === 0 ? 0.1 : 0.3 + (count / peakStats.maxCount) * 0.7 
                }}
                title={`${hr}:00 - ${count} activities`}
              />
            ))}
          </div>
          <div className="hour-labels-row">
            <span>12am</span><span>12pm</span><span>11pm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAnalytics;