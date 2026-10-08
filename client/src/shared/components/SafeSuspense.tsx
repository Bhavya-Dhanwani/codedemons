import { Component, Suspense, type ReactNode } from 'react'

/** Keeps the page alive if a part fails (e.g. a 3D scene with no WebGL). */
class Safe extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? null : this.props.children }
}

/** Lazy part that renders nothing while loading and nothing if it crashes. */
export function SafeSuspense({ children }: { children: ReactNode }) {
  return <Safe><Suspense fallback={null}>{children}</Suspense></Safe>
}
