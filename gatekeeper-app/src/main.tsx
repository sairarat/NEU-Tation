import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthContextProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div id="app-container">
      <h1>React Supabase Auth & Context</h1>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
      
    </div>
  </StrictMode>
)