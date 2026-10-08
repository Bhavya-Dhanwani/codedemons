import { useCallback, useEffect } from 'react'
import { hideToast, showToast } from '../state/uiSlice'
import { useAppDispatch, useAppSelector } from './store'

/** Returns a function that shows a short message at the bottom of the screen. */
export function useToast() {
  const dispatch = useAppDispatch()
  return useCallback((msg: string) => dispatch(showToast(msg)), [dispatch])
}

/** For the toast itself: the current message, hidden again after a moment. */
export function useToastMessage() {
  const dispatch = useAppDispatch()
  const msg = useAppSelector((s) => s.ui.toast)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => dispatch(hideToast()), 2200)
    return () => clearTimeout(t)
  }, [msg, dispatch])
  return msg
}
