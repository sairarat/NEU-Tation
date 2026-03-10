import { useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";
import { BookOpen, LogOut, User, Book } from "lucide-react";

const Dashboard = () => {
  const { user, signOutUser } = UserAuth();
  const navigate = useNavigate();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOutUser();
    navigate("/signin");
  };

  return (
    // dashboard-layout
    <div className="flex flex-col min-h-screen">

      {/* dashboard-header */}
      <header
        className="flex justify-between items-center px-8 py-4"
        style={{ borderBottom: '1px solid #e8eaed' }}
      >
        <div className="flex items-center gap-2.5">
          <BookOpen style={{ color: '#4caf50' }} size={24} />
          <span className="font-bold">NEU Library</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 cursor-pointer"
          style={{ background: 'none', border: 'none' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* dashboard-main */}
      <main className="flex-1 flex items-center justify-center p-8">

        {/* auth-card-modern  (maxWidth kept via style since 600px isn't a default Tailwind value) */}
        <div
          className="w-full bg-white text-center"
          style={{
            maxWidth: '600px',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {/* user-avatar */}
          <div
            className="flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold"
            style={{
              width: '64px',
              height: '64px',
              background: '#4caf50',
              borderRadius: '50%',
            }}
          >
            {userInitial}
          </div>

          <h1 className="text-2xl font-bold mb-1">Student Portal</h1>
          <p style={{ color: '#70757a' }}>{user?.email}</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <div style={{ padding: '1rem', border: '1px solid #e8eaed', borderRadius: '8px' }}>
              <Book size={20} color="#4caf50" />
              <div style={{ fontWeight: 'bold' }}>My Books</div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #e8eaed', borderRadius: '8px' }}>
              <User size={20} color="#4caf50" />
              <div style={{ fontWeight: 'bold' }}>Profile</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;