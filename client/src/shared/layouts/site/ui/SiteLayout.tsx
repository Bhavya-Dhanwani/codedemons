import { Outlet } from 'react-router'
import { useSiteLayout } from '../hooks/useSiteLayout'
import { Preloader } from './Preloader'
import { Curtain } from './Curtain'
import { Cursor } from './Cursor'
import { Dock, Nav } from './Nav'
import { Footer } from './Footer'

/** Public site chrome around every marketing page. */
export default function SiteLayout() {
  const { curtain, showPreloader } = useSiteLayout()
  return (
    <>
      {showPreloader && <Preloader />}
      <Curtain ref={curtain} />
      <Cursor />
      <div className="grain" aria-hidden />
      <Nav />
      <Dock />
      <Outlet />
      <Footer />
    </>
  )
}
