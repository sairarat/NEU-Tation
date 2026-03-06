import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface RoleGuardProps {
  children: React.ReactNode;
  // We change this to an array to support multiple user types (e.g., student, staff, visitor)
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

  // Show a loading state while checking authentication and database role
  if (authLoading || checkingRole) {
    return (
      <div className="auth-container">
        <p style={{ color: 'white' }}>Verifying Permissions...</p>
      </div>
    );
  }

  // 1. If not logged in, boot to signin
  if (!user) {
    return <Navigate to="/signin" />;
  }

  // 2. If the user hasn't finished their profile (role is null/empty), send to complete-profile
  if (!role) {
    return <Navigate to="/complete-profile" />;
  }

  // 3. If the user's role is NOT in the allowedRoles array, redirect them
  if (!allowedRoles.includes(role as any)) {
    // If an admin tries to enter a visitor/student page, send them to admin-dashboard
    // Otherwise, send everyone else to the standard dashboard
    return <Navigate to={role === 'admin' ? "/admin-dashboard" : "/dashboard"} />;
  }

  return <>{children}</>;
};

export default RoleGuard;