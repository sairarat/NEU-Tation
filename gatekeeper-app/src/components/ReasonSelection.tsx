import { useState } from 'react';
import { Book, Search, Monitor, PenTool, Plus, Loader2, CheckCircle } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const reasons = [
  { id: 'Reading',      icon: Book,    color: '#facc15' },
  { id: 'Research',     icon: Search,  color: '#60a5fa' },
  { id: 'Computer Use', icon: Monitor, color: '#4ade80' },
  { id: 'Studying',     icon: PenTool, color: '#f87171' },
  { id: 'Others',       icon: Plus,    color: '#94a3b8' },
];

interface ReasonSelectionProps {
  onComplete?: () => Promise<void>;
}

const ReasonSelection = ({ onComplete }: ReasonSelectionProps) => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleLogVisit = async (reason: string) => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('logs').insert([
      {
        user_id: user.id,
        reason: reason,
        timestamp: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error(error);
      alert("Failed to log visit.");
      setLoading(false);
    } else {
      setStatus('success');
      setLoading(false);
      if (onComplete) {
        setTimeout(async () => {
          await onComplete();
        }, 2500);
      }
    }
  };

  if (status === 'success') {
    // auth-card-modern success-state-container
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        {/* success-icon-center */}
        <CheckCircle size={64} color="#22c55e" className="block mx-auto" />
        {/* auth-title */}
        <h2
          className="font-extrabold text-slate-800 text-center mb-1"
          style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}
        >
          Visit Logged!
        </h2>
        {/* auth-subtitle */}
        <p className="text-center mb-5" style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Thank you for visiting. You are being redirected...
        </p>
      </div>
    );
  }

  return (
    // reason-selection-wrapper
    <div className="w-full flex flex-col items-center justify-center">

      {/* auth-title */}
      <h1
        className="font-extrabold text-slate-800 text-center mb-1"
        style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}
      >
        Hi, {user?.email?.split('@')[0]}!
      </h1>

      {/* auth-subtitle */}
      <p className="text-center mb-5" style={{ color: '#64748b', fontSize: '0.9rem' }}>
        What is your reason for visiting today?
      </p>

      {/* reason-grid-container */}
      <div
        className="w-full mt-6"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          justifyItems: 'center',
        }}
      >
        {reasons.map((item, index) => {
          // On mobile (<= 480px) last odd child spans 2 columns with row layout
          // We handle the "last odd" case via a data attribute + CSS-in-JS style
          const isLastOdd = index === reasons.length - 1 && reasons.length % 2 !== 0;

          return (
            <button
              key={item.id}
              onClick={() => handleLogVisit(item.id)}
              disabled={loading}
              className="transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '18px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                // Last odd item on small screens handled via inline media not possible;
                // grid-column span handled by the parent grid on small screens
                ...(isLastOdd ? { gridColumn: 'span 2' } : {}),
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }}
            >
              <item.icon size={32} color={item.color} strokeWidth={2.5} style={{ width: '32px', height: '32px' }} />
              {/* reason-btn-text */}
              <span
                className="font-semibold text-center"
                style={{
                  color: '#334155',
                  fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                }}
              >
                {item.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* loader-centered */}
      {loading && (
        <div className="flex justify-center mt-4">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
    </div>
  );
};

export default ReasonSelection;