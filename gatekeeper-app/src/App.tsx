import { Outlet, Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/signin">Sign In</Link>
        <Link to="/signup">Sign Up</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <hr />

      <div className="content-area">
        <Outlet />
      </div>
    </>
  );
}

export default App;