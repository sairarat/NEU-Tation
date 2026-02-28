import { useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";
import { BookOpen, LogOut, User, Book } from "lucide-react"; 
import '../styles/base.css';
import '../styles/dashboard.css';

const Dashboard = () => {
  // Use 'user' instead of 'session' for consistency with your other files
  const { user, signOutUser } = UserAuth(); 
  const navigate = useNavigate();

  // FIX: Define userInitial so the code knows what it is
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOutUser();
    navigate("/signin");
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen style={{ color: 'var(--neu-green)' }} size={24} />
          <span style={{ fontWeight: 'bold' }}>NEU Library</span>
        </div>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>
      <main className="dashboard-main">
        <div className="auth-card-modern" style={{ maxWidth: '600px' }}>
          <div className="user-avatar">{userInitial}</div>
          <h1>Student Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <Book size={20} color="var(--neu-green)" /> 
              <div style={{ fontWeight: 'bold' }}>My Books</div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <User size={20} color="var(--neu-green)" /> 
              <div style={{ fontWeight: 'bold' }}>Profile</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;