import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './services/supabaseClient.ts'

// Expose supabase ke window global untuk testing di console
declare global {
  interface Window {
    supabase: typeof supabase
  }
}

window.supabase = supabase

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
