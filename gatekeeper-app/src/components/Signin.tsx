import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { BookOpen, LogIn, UserPlus, Chrome } from "lucide-react"; 
import '../styles/base.css';
import '../auth.css';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInUser(email, password);

    if (result.success && result.user) {
      // Small delay to allow SQL Trigger to finish profile creation
      await new Promise(res => setTimeout(res, 500));

      const { data: profile } = await supabase
        .from("profiles")
        .select("college_office, role")
        .eq("id", result.user.id)
        .single();

      if (!profile?.college_office) {
        navigate("/complete-profile");
      } else {
        navigate(profile.role === "admin" ? "/admin-dashboard" : "/dashboard");
      }
    } else {
      setError(result.error || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-modern">
        <div className="brand-circle"><BookOpen color="white" size={28} /></div>
        <h1 className="auth-title">NEU Library</h1>
        
        <div className="auth-tabs">
          <div className="tab-link active"><LogIn size={18} /> Sign In</div>
          <Link to="/signup" className="tab-link"><UserPlus size={18} /> Sign Up</Link>
        </div>

        <form onSubmit={handleSignin}>
          <div className="form-group">
            <label>Email</label>
            <input className="input-modern" type="email" placeholder="name@neu.edu.ph" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input-modern" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="field-error" style={{textAlign: 'center', color: '#ef4444'}}>{error}</p>}
          <button type="submit" className="btn-primary-neu" disabled={loading}>
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>
        <button onClick={signInWithGoogle} className="btn-google-auth" type="button">
          <Chrome size={20} /> Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Signin;