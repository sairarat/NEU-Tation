import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'; // Use RouterProvider for createBrowserRouter
import { router } from './router'; // Import your router configuration
import { AuthContextProvider } from './context/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* AuthContextProvider MUST be the top-most wrapper */}
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </StrictMode>
);