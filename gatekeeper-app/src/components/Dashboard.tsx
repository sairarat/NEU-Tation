import { useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signup'); // Send user back to sign in after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-header">Dashboard</h2>
        <p className="dashboard-welcome">
          Welcome, <span className="user-email">{session?.user?.email}</span>
        </p>
        
        <div className="dashboard-actions">
          {/* Sign out button with vanilla CSS classes */}
          <button onClick={handleSignOut} className="signout-button">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;