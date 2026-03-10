import { useState } from 'react';
import { Book, Search, Monitor, PenTool, Plus, Loader2, CheckCircle } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import '../styles/user-dashboard.css';
import '../styles/reason-selection.css';

const reasons = [
  { id: 'Reading', icon: Book, color: '#facc15' },
  { id: 'Research', icon: Search, color: '#60a5fa' },
  { id: 'Computer Use', icon: Monitor, color: '#4ade80' },
  { id: 'Studying', icon: PenTool, color: '#f87171' },
  { id: 'Others', icon: Plus, color: '#94a3b8' },
];

// Added prop type for the redirect callback
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

      // Trigger the redirect/sign-out after 2.5 seconds to let the user see the success message
      if (onComplete) {
        setTimeout(async () => {
          await onComplete();
        }, 2500);
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="auth-card-modern success-state-container">
        <CheckCircle size={64} color="#22c55e" className="success-icon-center" />
        <h2 className="auth-title">Visit Logged!</h2>
        <p className="auth-subtitle">Thank you for visiting. You are being redirected...</p>
      </div>
    );
  }

  return (
    <div className="auth-card-modern reason-selection-wrapper">
      <h1 className="auth-title">Hi, {user?.email?.split('@')[0]}!</h1>
      <p className="auth-subtitle">What is your reason for visiting today?</p>
      
      <div className="reason-grid-container">
        {reasons.map((item) => (
          <button
            key={item.id}
            onClick={() => handleLogVisit(item.id)}
            disabled={loading}
            className="reason-card-btn"
          >
            <item.icon size={32} color={item.color} strokeWidth={2.5} />
            <span className="reason-btn-text">{item.id}</span>
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="loader-centered">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
    </div>
  );
};

export default ReasonSelection;