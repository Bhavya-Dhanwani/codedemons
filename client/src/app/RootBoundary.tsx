import { Component, type ReactNode } from 'react'

/**
 * Last line of defence: if anything crashes outside a page's own error screen, show what happened
 * instead of a blank page, with a way to recover.
 */
export class RootBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('[codedemons] app crashed:', error) }

  // a broken saved session is the usual suspect, so offer a clean start
  signOut = () => {
    try { localStorage.removeItem('cd-portal-token'); localStorage.removeItem('cd-admin-token') } catch { /* private mode */ }
    location.assign('/')
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <main className="ad-login">
        <div className="crash">
          <h1>Something went wrong.</h1>
          <p>This page hit an error. Reloading usually fixes it. If it keeps happening, send us the message below.</p>
          <code>{error.message || String(error)}</code>
          <div className="ad-row">
            <button type="button" className="ad-btn primary" onClick={() => location.reload()}>Reload</button>
            <button type="button" className="ad-btn ghost" onClick={this.signOut}>Sign out and start over</button>
          </div>
        </div>
      </main>
    )
  }
}
