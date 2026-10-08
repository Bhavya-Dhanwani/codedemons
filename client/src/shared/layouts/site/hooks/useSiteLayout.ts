import { useRef } from 'react'
import { useLocation } from 'react-router'
import { useAppSelector } from '../../../hooks/store'
import { useSmoothScroll } from './useSmoothScroll'
import { usePageTransition } from './usePageTransition'

export function useSiteLayout() {
  const curtain = useRef<HTMLDivElement>(null)
  const lenis = useSmoothScroll()
  usePageTransition(curtain, lenis)
  const preloaded = useAppSelector((s) => s.ui.preloaded)
  const { pathname } = useLocation()
  return { curtain, showPreloader: !preloaded && pathname === '/' }
}
