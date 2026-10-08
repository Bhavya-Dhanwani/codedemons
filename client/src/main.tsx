import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/lib/motion' // registers the GSAP plugins before anything animates
import './index.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
