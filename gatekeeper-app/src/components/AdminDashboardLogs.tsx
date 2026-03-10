import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Clock, Calendar, 
  AlertCircle, RefreshCw 
} from 'lucide-react';
import '../styles/admin-dashboard-logs.css';

const AdminDashboardLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    // Fetch logs and join with profiles to get user details
    const { data, error: fetchError } = await supabase
      .from('logs')
      .select(`
        id,
        timestamp,
        reason,
        user_id,
        profiles (
          first_name,
          last_name,
          email,
          college_office,
          student_number
        )
      `)
      .order('timestamp', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const user = log.profiles;
    const fullName = `${user?.first_name} ${user?.last_name}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.student_number?.includes(searchTerm);
    
    const matchesReason = filterReason === 'all' || log.reason === filterReason;
    
    return matchesSearch && matchesReason;
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="admin-glass-card animate-fade-in">
      <header className="admin-card-header">
        <div className="header-title-stack">
          <h1 className="admin-title">Activity History</h1>
          <p className="admin-subtitle">Real-time library visit logs</p>
        </div>
        
        <div className="admin-controls">
          <button className="refresh-btn" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <select 
            className="admin-filter-select" 
            value={filterReason} 
            onChange={(e) => setFilterReason(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="Reading">Reading</option>
            <option value="Research">Research</option>
            <option value="Computer Use">Computer Use</option>
            <option value="Studying">Studying</option>
            <option value="Others">Others</option>
          </select>

          <div className="admin-search-bar">
            <Search size={18} color="rgba(255,255,255,0.4)" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Accessing Log Archives...</div>
        ) : error ? (
          <div className="admin-error-msg"><AlertCircle /> <span>{error}</span></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Details</th>
                <th>Department</th>
                <th>Activity</th>
                <th>ID Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const { date, time } = formatDate(log.timestamp);
                  return (
                    <tr key={log.id}>
                      <td className="td-timestamp">
                        <div className="timestamp-group">
                          <span className="ts-date"><Calendar size={12} /> {date}</span>
                          <span className="ts-time"><Clock size={12} /> {time}</span>
                        </div>
                      </td>
                      <td className="td-user">
                        <div className="user-info">
                          <span className="user-name">{log.profiles?.first_name} {log.profiles?.last_name}</span>
                          <span className="user-email">{log.profiles?.email}</span>
                        </div>
                      </td>
                      <td className="td-dept">{log.profiles?.college_office || 'Unspecified'}</td>
                      <td>
                        <span className={`reason-tag reason-${log.reason?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {log.reason}
                        </span>
                      </td>
                      <td className="td-id">{log.profiles?.student_number || '—'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="empty-logs">No matching activity records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardLogs;