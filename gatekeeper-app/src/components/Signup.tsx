import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUpNewUser, signInWithGoogle } = UserAuth(); // Added signInWithGoogle
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUpNewUser(email, password);
      
      if (result.success) {
        alert("Check your email for the confirmation link!");
        navigate('/dashboard'); 
      } else {
        setError(result.error?.message || "An error occurred during signup");
      }
    } catch (err: any) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2 className="SignUp">Sign up</h2>
        <p className="auth-subtitle">
          Already have an account? <Link to="/signin" className="auth-link">Sign in!</Link>
        </p>
        
        <div className="Signup-Fields">
          <input 
            type='email' 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            className="auth-input" 
            id="field-input"
            required
          />
          <input 
            type='password' 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="auth-input" 
            id="field-input"
            required
          />
          <button type='submit' disabled={loading} id="signup-button">
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>

          {/* Added Google Auth Option */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            type="button" 
            onClick={signInWithGoogle} 
            className="google-btn"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Sign up with Google
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Signup;