import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // Change this
import App from './App' // Import App
import { AuthContextProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </AuthContextProvider>
  </StrictMode>
)