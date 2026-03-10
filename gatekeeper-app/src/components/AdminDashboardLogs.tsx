import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Search, Clock, Calendar,
  AlertCircle, RefreshCw
} from 'lucide-react';

const AdminDashboardLogs = () => {
  const [logs, setLogs]             = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [error, setError]           = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

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

    if (fetchError) setError(fetchError.message);
    else setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    const user     = log.profiles;
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
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // reason-tag colour map
  const reasonTagStyle = (reason: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Reading':      { background: 'rgba(250,204,21,0.15)',  color: '#facc15' },
      'Research':     { background: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
      'Computer Use': { background: 'rgba(74,222,128,0.15)',  color: '#4ade80' },
      'Studying':     { background: 'rgba(248,113,113,0.15)', color: '#f87171' },
      'Others':       { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    };
    return map[reason] ?? { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
  };

  return (
    // admin-glass-card
    <div
      style={{
        margin: '0 0 2rem 0',           // admin-glass-card has margin 0 2rem 2rem 2rem in the CSS,
        background: 'rgba(30,41,59,0.4)', // but inside admin-main-content (padding 30px) it looks right without extra margin
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
        {/* header-title-stack */}
        <div className="flex flex-col" style={{ gap: '4px' }}>
          <h1 className="text-xl font-bold">Activity History</h1>
          {/* admin-subtitle */}
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Real-time library visit logs
          </p>
        </div>

        {/* admin-controls */}
        <div className="flex items-center" style={{ gap: '15px' }}>

          {/* refresh-btn */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '10px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
              e.currentTarget.style.color = '#60a5fa';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {/* animate-spin via Tailwind class when loading */}
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

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
            value={filterReason}
            onChange={e => setFilterReason(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="Reading">Reading</option>
            <option value="Research">Research</option>
            <option value="Computer Use">Computer Use</option>
            <option value="Studying">Studying</option>
            <option value="Others">Others</option>
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
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                marginLeft: '10px',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>
      </header>

      {/* admin-table-wrapper */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {loading ? (
          <div className="flex justify-center items-center p-10 text-slate-400">
            Accessing Log Archives...
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
                {['Timestamp', 'User Details', 'Department', 'Activity', 'ID Number'].map(h => (
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
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const { date, time } = formatDate(log.timestamp);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>

                      {/* Timestamp cell */}
                      <td style={{ padding: '16px 24px' }}>
                        {/* timestamp-group */}
                        <div className="flex flex-col" style={{ gap: '4px' }}>
                          {/* ts-date */}
                          <span
                            className="flex items-center"
                            style={{ fontSize: '0.85rem', color: '#e2e8f0', gap: '6px' }}
                          >
                            <Calendar size={12} /> {date}
                          </span>
                          {/* ts-time */}
                          <span
                            className="flex items-center"
                            style={{ fontSize: '0.75rem', color: '#64748b', gap: '6px' }}
                          >
                            <Clock size={12} /> {time}
                          </span>
                        </div>
                      </td>

                      {/* User Details */}
                      <td style={{ padding: '16px 24px' }}>
                        {/* user-info */}
                        <div className="flex flex-col">
                          {/* user-name */}
                          <span style={{ fontWeight: 400, fontSize: '1rem', color: 'rgb(225,221,221)' }}>
                            {log.profiles?.first_name} {log.profiles?.last_name}
                          </span>
                          {/* user-email */}
                          <span style={{ fontSize: '0.8rem', color: 'rgb(225,221,221)' }}>
                            {log.profiles?.email}
                          </span>
                        </div>
                      </td>

                      {/* td-dept */}
                      <td style={{ padding: '16px 24px', color: 'rgb(221,219,219)' }}>
                        {log.profiles?.college_office || 'Unspecified'}
                      </td>

                      {/* reason-tag */}
                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-block',
                            ...reasonTagStyle(log.reason),
                          }}
                        >
                          {log.reason}
                        </span>
                      </td>

                      {/* td-id */}
                      <td style={{ padding: '16px 24px', color: 'rgb(221,219,219)' }}>
                        {log.profiles?.student_number || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  {/* empty-logs */}
                  <td
                    colSpan={5}
                    style={{
                      padding: '60px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontStyle: 'italic',
                    }}
                  >
                    No matching activity records found.
                  </td>
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