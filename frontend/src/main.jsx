import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthInitializer from "./components/AuthInitializer";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthInitializer>

      <App />

    </AuthInitializer>
  </StrictMode>,
)
