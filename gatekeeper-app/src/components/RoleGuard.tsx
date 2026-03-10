import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'visitor' | 'student' | 'staff')[];
}

type CheckState = 'pending' | 'done' | 'error';

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, loading: authLoading } = UserAuth();
  const [role, setRole]               = useState<string | null>(null);
  const [checkState, setCheckState]   = useState<CheckState>('pending');
  // FIX: Track whether the profile is complete (college_office filled in).
  // Previously we only checked role === null, but a fetch *error* also left
  // role as null, silently bouncing users to /complete-profile on any
  // network hiccup. Now we distinguish three outcomes: pending / done / error.
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setCheckState('done');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, college_office')
        .eq('id', user.id)
        .single();

      if (error) {
        // Don't silently redirect on a fetch failure — show an error state
        // so the user isn't dumped on /complete-profile just because of a
        // momentary network issue or an RLS policy misconfiguration.
        console.error('RoleGuard profile fetch error:', error.message);
        setCheckState('error');
        return;
      }

      // Profile exists but the user hasn't finished the setup wizard yet
      if (!data?.college_office) {
        setProfileComplete(false);
      }

      setRole(data?.role ?? null);
      setCheckState('done');
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  // Still loading auth or role check
  if (authLoading || checkState === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'white' }}>Verifying Permissions...</p>
      </div>
    );
  }

  // Supabase fetch failed — show a recoverable error rather than a silent
  // redirect that would confuse the user
  if (checkState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#fca5a5', fontSize: '1rem' }}>
          Could not verify your permissions. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Not logged in at all
  if (!user) return <Navigate to="/signin" />;

  // Logged in but profile setup not finished
  if (!profileComplete) return <Navigate to="/complete-profile" />;

  // Logged in but trying to access a route their role doesn't allow
  if (!role || !allowedRoles.includes(role as any)) {
    return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/dashboard'} />;
  }

  return <>{children}</>;
};

export default RoleGuard;