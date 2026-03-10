import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthContextProvider } from './context/AuthContext'; // Ensure this path matches your folder exactly

/** * --- GLOBAL STYLES MANIFEST ---
 * Importing these here ensures Vite bundles them for production.
 * The order matters: put global resets first, then specific page styles.
 */
import './index.css'; 
import './auth.css';
import './styles/base.css';
import './styles/admin-dashboard.css';
import './styles/admin-dashboard-analytics.css';
import './styles/admin-dashboard-logs.css';
import './styles/user-dashboard.css';
import './styles/reason-selection.css';
import './styles/profile-setup.css'; // Added this just in case
// ------------------------------

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </StrictMode>
);