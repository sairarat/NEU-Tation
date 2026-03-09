import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, LogIn, Chrome } from "lucide-react"; 
import '../auth.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUpNewUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Names are passed here and handled by the database trigger
    const result = await signUpNewUser(email, password, firstName, lastName);
    
    if (result.success) {
      // Direct navigate to dashboard; the trigger handled profile creation
      navigate("/dashboard"); 
    } else {
      alert(result.error?.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-modern">
        <div className="brand-circle"><BookOpen color="white" size={32} /></div>
        <h1 className="auth-title">Create Account</h1>
        
        <div className="auth-tabs">
          <Link to="/signin" className="tab-link inactive"><LogIn size={18} /> Sign In</Link>
          <div className="tab-link active"><UserPlus size={18} /> Sign Up</div>
        </div>

        <form onSubmit={handleSignup}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group">
              <label>First Name</label>
              <input className="input-modern" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="input-modern" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input-modern" type="email" placeholder="name@neu.edu.ph" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input-modern" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary-neu" disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* <div className="auth-divider"><span>OR</span></div> */}
        {/* <button onClick={signInWithGoogle} className="btn-google-auth" type="button">
          <Chrome size={20} /> Continue with Google
        </button> */}
      </div> 
    </div>
  );
};

export default Signup;