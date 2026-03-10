import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// AuthContextProvider has been moved into App.tsx so it lives inside the
// router tree. Keeping it here (wrapping RouterProvider) causes the
// "UserAuth must be used within AuthContextProvider" error because
// createBrowserRouter renders into its own React subtree that doesn't
// see providers placed above RouterProvider.

import './index.css';
import './auth.css';
import './styles/base.css';
import './styles/admin-dashboard.css';
import './styles/admin-dashboard-analytics.css';
import './styles/admin-dashboard-logs.css';
import './styles/user-dashboard.css';
import './styles/reason-selection.css';
import './styles/profile-setup.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);