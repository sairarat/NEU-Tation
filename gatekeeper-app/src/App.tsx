import { Outlet } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import './styles/base.css';

function App() {
  return (
    // AuthContextProvider must live INSIDE the router tree so that all
    // child routes (Signin, Signup, Dashboard, etc.) can safely call
    // UserAuth(). Wrapping RouterProvider with it in main.tsx is not
    // reliable with createBrowserRouter because RouterProvider itself
    // creates a separate React subtree.
    <AuthContextProvider>
      <div className="app-container">
        <Outlet />
      </div>
    </AuthContextProvider>
  );
}

export default App;