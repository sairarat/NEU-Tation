import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'visitor';
}

const RoleGuard = ({ children, allowedRole }: RoleGuardProps) => {
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

  // Show nothing or a spinner while checking authentication and database role
  if (authLoading || checkingRole) {
    return <div className="auth-container"><p style={{color: 'white'}}>Verifying Permissions...</p></div>;
  }

  // If not logged in, boot to signin
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // If role doesn't match, redirect to their appropriate home
  if (role !== allowedRole) {
    return <Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />;
  }

  return <>{children}</>;
};

export default RoleGuard;