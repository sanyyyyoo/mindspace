import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './hooks/useTheme.js'

const storedTheme =
  localStorage.getItem('analysis-theme') ||
  localStorage.getItem('selfcast-theme')
document.documentElement.setAttribute(
  'data-theme',
  storedTheme === 'light' ? 'light' : 'dark'
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
