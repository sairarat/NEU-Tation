import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { BookOpen, LogIn, UserPlus } from "lucide-react"; 
import '../styles/base.css';
import '../auth.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    first: '',
    last: '',
    email: '',
    pass: '',
    general: ''
  });

  const { signUpNewUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Reset object of errors
    const newErrors = { first: '', last: '', email: '', pass: '', general: '' };
    let hasError = false;

    if (!firstName.trim()) { newErrors.first = "First name is required."; hasError = true; }
    if (!lastName.trim()) { newErrors.last = "Last name is required."; hasError = true; }
    if (!email.toLowerCase().endsWith("@neu.edu.ph")) { newErrors.email = "Must be a @neu.edu.ph email."; hasError = true; }
    if (password.length < 6) { newErrors.pass = "Password must be at least 6 characters."; hasError = true; }

    setErrors(newErrors);

    if (hasError) {
      setLoading(false);
      return;
    }

    const result = await signUpNewUser(email, password);
    if (result.success) { navigate('/complete-profile'); 
    } else {
      setErrors(prev => ({ ...prev, general: result.error?.message || "Error occurred" }));
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-modern">
        <div className="brand-circle"><BookOpen color="white" size={32} /></div>
        <h1 className="auth-title">NEU Library Access</h1>
        <p className="auth-subtitle">Create an account to access resources.</p>
        
        <div className="auth-tabs">
          <Link to="/signin" className="tab-link inactive"><LogIn size={18} /> Sign In</Link>
          <div className="tab-link active"><UserPlus size={18} /> Sign Up</div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="name-row">
            <div className="form-group">
              <label style={{ color: errors.first ? '#ef4444' : 'inherit' }}>First Name</label>
              <input 
                className="input-modern" 
                placeholder="Juan" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
              {errors.first && <p className="field-error">{errors.first}</p>}
            </div>
            <div className="form-group">
              <label style={{ color: errors.last ? '#ef4444' : 'inherit' }}>Last Name</label>
              <input 
                className="input-modern" 
                placeholder="Dela Cruz" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
              {errors.last && <p className="field-error">{errors.last}</p>}
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: errors.email ? '#ef4444' : 'inherit' }}>Email</label>
            <input 
              type="email" 
              className="input-modern" 
              placeholder="your.name@neu.edu.ph" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label style={{ color: errors.pass ? '#ef4444' : 'inherit' }}>Password</label>
            <input 
              type="password" 
              className="input-modern" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            {errors.pass && <p className="field-error">{errors.pass}</p>}
          </div>

          {errors.general && <p className="field-error" style={{textAlign: 'center'}}>{errors.general}</p>}

          <button type="submit" className="btn-primary-neu" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="footer-note">Use your official @neu.edu.ph account.</p>
      </div>
    </div>
  );
};

export default Signup;