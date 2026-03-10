import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'visitor' | 'student' | 'staff')[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, loading: authLoading } = UserAuth();
  const [role, setRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setRole(data.role);
      }
      setCheckingRole(false);
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  // auth-container loading state
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'white' }}>Verifying Permissions...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" />;
  if (!role) return <Navigate to="/complete-profile" />;

  if (!allowedRoles.includes(role as any)) {
    return <Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />;
  }

  return <>{children}</>;
};

export default RoleGuard;