import { Outlet } from 'react-router-dom';
import './styles/base.css'; // Ensure your global styles are imported here

function App() {
  return (
    /* The app-container div ensures that your background image, 
       blur effects, and global layout persist across all pages.
    */
    <div className="app-container">
      {/* The <Outlet /> is a placeholder. 
         React Router will inject the component for the current route 
         (defined in your router.tsx) right here.
      */}
      <Outlet />
    </div>
  );
}

export default App;