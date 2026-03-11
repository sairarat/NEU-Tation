import { useState } from 'react';
import { Book, Search, Monitor, PenTool, Plus, Loader2, CheckCircle } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const reasons = [
  { id: 'Reading',      icon: Book,    color: '#facc15', glow: 'rgba(250,204,21,0.20)',  bg: 'rgba(250,204,21,0.08)' },
  { id: 'Research',     icon: Search,  color: '#60a5fa', glow: 'rgba(96,165,250,0.20)',  bg: 'rgba(96,165,250,0.08)' },
  { id: 'Computer Use', icon: Monitor, color: '#34d399', glow: 'rgba(52,211,153,0.20)',  bg: 'rgba(52,211,153,0.08)' },
  { id: 'Studying',     icon: PenTool, color: '#f87171', glow: 'rgba(248,113,113,0.20)', bg: 'rgba(248,113,113,0.08)' },
  { id: 'Others',       icon: Plus,    color: '#c084fc', glow: 'rgba(192,132,252,0.20)', bg: 'rgba(192,132,252,0.08)' },
];

interface ReasonSelectionProps {
  onComplete?: () => Promise<void>;
}

const ReasonSelection = ({ onComplete }: ReasonSelectionProps) => {
  const { user } = UserAuth();
  const [loading, setLoading]   = useState(false);
  const [status, setStatus]     = useState<'idle' | 'success'>('idle');
  const [selected, setSelected] = useState<string | null>(null);

  const handleLogVisit = async (reason: string) => {
    if (!user || loading) return;
    setSelected(reason);
    setLoading(true);

    const { error } = await supabase.from('logs').insert([{
      user_id:   user.id,
      reason:    reason,
      timestamp: new Date().toISOString(),
    }]);

    if (error) {
      console.error(error);
      alert('Failed to log visit.');
      setLoading(false);
      setSelected(null);
    } else {
      setStatus('success');
      setLoading(false);
      if (onComplete) {
        setTimeout(async () => { await onComplete(); }, 2600);
      }
    }
  };

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px 0 8px',
          animation: 'fadeSlideUp 0.4s ease both',
        }}
      >
        {/* Glowing check */}
        <div
          style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(34,197,94,0.20)',
          }}
        >
          <CheckCircle size={38} color="#22c55e" strokeWidth={2} />
        </div>

        <h2
          style={{
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.4px',
            textAlign: 'center',
          }}
        >
          Visit Logged!
        </h2>
        <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
          Thank you for visiting NEU Library.
          <br />Redirecting you now…
        </p>

        {/* Animated progress bar */}
        <div
          style={{
            width: '100%',
            maxWidth: '200px',
            height: '3px',
            background: '#e2e8f0',
            borderRadius: '2px',
            marginTop: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              borderRadius: '2px',
              animation: 'progressFill 2.5s linear forwards',
            }}
          />
        </div>

        <style>{`
          @keyframes progressFill {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Idle state ── */
  return (
    <div style={{ width: '100%' }}>

      {/* Username line */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 4px' }}>
          Logged in as
        </p>
        <p style={{ color: '#1e293b', fontSize: '14px', fontWeight: 700, margin: 0 }}>
          {user?.email}
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
        {reasons.map((item, index) => {
          const isLastOdd = index === reasons.length - 1 && reasons.length % 2 !== 0;
          const isActive  = selected === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleLogVisit(item.id)}
              disabled={loading}
              style={{
                background: isActive ? item.bg : '#f8fafc',
                border: `1.5px solid ${isActive ? item.color + '66' : '#e2e8f0'}`,
                borderRadius: '16px',
                padding: '20px 12px 18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading && !isActive ? 0.45 : 1,
                transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                ...(isLastOdd ? { gridColumn: 'span 2', maxWidth: '50%', margin: '0 auto' } : {}),
                boxShadow: isActive ? `0 0 0 1px ${item.color}33, 0 8px 24px ${item.glow}` : 'none',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background  = item.bg;
                  e.currentTarget.style.borderColor = item.color + '55';
                  e.currentTarget.style.transform   = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow   = `0 8px 24px ${item.glow}`;
                }
              }}
              onMouseLeave={e => {
                if (!loading && selected !== item.id) {
                  e.currentTarget.style.background  = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform   = '';
                  e.currentTarget.style.boxShadow   = 'none';
                }
              }}
            >
              {/* Icon wrapper */}
              <div
                style={{
                  width: '44px', height: '44px',
                  borderRadius: '12px',
                  background: item.bg,
                  border: `1px solid ${item.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isActive && loading
                  ? <Loader2 size={22} color={item.color} strokeWidth={2.5} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <item.icon size={22} color={item.color} strokeWidth={2.5} />}
              </div>

              <span
                style={{
                  color: isActive ? '#059669' : '#334155',
                  fontSize: 'clamp(0.78rem, 2vw, 0.9rem)',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.1px',
                  lineHeight: 1.3,
                }}
              >
                {item.id}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReasonSelection;