import { Routes, Route, Navigate } from 'react-router-dom';
import Signin from './components/Signin';
import Signup from './components/Signup';
import CompleteProfile from './components/CompleteProfile';
import VisitorDashboard from './components/VisitorDashboard';
import AdminDashboard from './components/AdminDashboard';
import RoleGuard from './components/RoleGuard';

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
      {/* Protected Visitor Route */}
      <Route 
        path="/dashboard" 
        element={
          <RoleGuard allowedRole="visitor">
            <VisitorDashboard />
          </RoleGuard>
        } 
      />

      {/* Protected Admin Route */}
      <Route 
        path="/admin-dashboard" 
        element={
          <RoleGuard allowedRole="admin">
            <AdminDashboard />
          </RoleGuard>
        } 
      />
      
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/signin" />} />
      
      {/* Catch-all for 404s */}
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;