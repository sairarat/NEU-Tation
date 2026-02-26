import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInUser, signInWithGoogle } = UserAuth(); 
  const navigate = useNavigate();

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInUser(email, password);
      if (result.success) {
        navigate('/dashboard'); 
      } else {
        setError(result.error?.message || result.error || "Invalid email or password");
      }
    } catch (err: any) {
      setError("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignin} className="auth-form">
        <h2 className="SignUp">Sign in</h2>
        <p className="auth-subtitle">
          Don't have an account? <Link to="/signup">Sign up!</Link>
        </p>
        
        <div className="Signup-Fields">
          <input 
            type='email' 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            className="auth-input" 
            required
          />
          <input 
            type='password' 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="auth-input" 
            required
          />
          <button type='submit' disabled={loading} id="signup-button">
            {loading ? 'Signing in...' : 'Sign in'}
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
            Continue with Google
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Signin;