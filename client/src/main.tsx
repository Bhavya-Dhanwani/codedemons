import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/lib/motion' // registers the GSAP plugins before anything animates
import './index.css'
import App from './app/App'

// A deploy replaced the build: this tab still points at old file names that no longer exist.
// Reload once to get the new page; the guard stops a reload loop if the files really are broken.
addEventListener('vite:preloadError', (e) => {
  try {
    const last = Number(sessionStorage.getItem('cd-reloaded') || 0)
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem('cd-reloaded', String(Date.now()))
  } catch { /* private mode: reload anyway */ }
  e.preventDefault()
  location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
